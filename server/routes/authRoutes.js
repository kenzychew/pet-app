const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyToken } = require("../utils/jwt");

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);

// Protected route - requires authentication
router.get("/me", verifyToken, authController.getCurrentUser);

module.exports = router;
