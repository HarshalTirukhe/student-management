const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");
const asyncHandler = require("../lib/asyncHandler");
const { registerSchema } = require("../validators/auth.validator");

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

module.exports = { register };