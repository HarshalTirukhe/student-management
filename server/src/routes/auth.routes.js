const express = require("express");
const { register, login, getMe } = require("../controllers/auth.controller");
const authenticate = require("../middleware/authenticate");
const loginLimiter = require("../middleware/loginLimiter");

const router = express.Router();

router.post("/register", register);
router.post("/login", loginLimiter, login);
router.get("/me", authenticate, getMe);

module.exports = router;