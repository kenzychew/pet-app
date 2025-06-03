const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyToken } = require("../utils/jwt");

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);

// Protected route - requires authentication
router.get("/me", verifyToken, authController.getCurrentUser);

module.exports = router;
