const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const asyncHandler = require("../lib/asyncHandler");
const { registerSchema, loginSchema } = require("../validators/auth.validator");

const register = asyncHandler(async (req, res) => {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  const { name, email, password } = result.data;

  // Scramble the password before it goes anywhere near the database
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  res.status(201).json(user);
});

const login = asyncHandler(async (req, res) => {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  const { email, password } = result.data;

  // 1. Find the user, 2. compare the password with the stored hash
  const user = await prisma.user.findUnique({ where: { email } });
  const passwordMatches = user && (await bcrypt.compare(password, user.password));

  // Same message for "no such email" and "wrong password"
  if (!passwordMatches) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  // 3. Sign a token that carries the user's id and role
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  // The token is valid, but the account may have been deleted since
  if (!user) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  res.json(user);
});

module.exports = { register, login, getMe };