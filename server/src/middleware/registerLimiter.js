const { rateLimit } = require("express-rate-limit");

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 10, // 10 sign-ups per IP per hour
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many accounts created from this address. Please try again later." },
});

module.exports = registerLimiter;