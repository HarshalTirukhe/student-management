const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  // 1. The client sends:  Authorization: Bearer <token>
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const token = header.split(" ")[1];

  // 2. Check the signature and the expiry time
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Make the user's id and role available to later code
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authenticate;