const express = require("express");
const router = express.Router();
const { authLimiter } = require("../middlewares/rateLimiter")

const { register, login, logout } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", authLimiter, login);
router.post("/logout", logout);

module.exports = router;