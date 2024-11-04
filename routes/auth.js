// routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const auth = require("../middleware/auth");
const {
  confirmationEmailTemplate,
  resetPasswordEmailTemplate,
} = require("../utils/emailTemplates"); // Adjust the path if necessary

require("dotenv").config();

const router = express.Router();

// Nodemailer setup for email confirmation
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Bypass certificate validation
  },
});

// Register route
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    // Hash password and save user
    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ username, email, password: hashedPassword });
    await user.save();

    // Generate email confirmation token
    const emailToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const url = `http://localhost:5000/api/auth/confirm/${emailToken}`;

    // Send email
    await transporter.sendMail({
      to: email,
      subject: "Confirm your Email",
      html: confirmationEmailTemplate(username, url), // Pass the username
    });

    res
      .status(201)
      .json({ msg: "User registered. Check your email to confirm." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Email confirmation route
router.get("/confirm/:token", async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(400).json({ msg: "Invalid token" });

    user.isVerified = true;
    await user.save();
    res.redirect("http://localhost:3000/email-confirmed");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Incorrect password" });

    // Check if email is verified
    if (!user.isVerified)
      return res.status(403).json({ msg: "Email not verified" });

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// routes/auth.js

// Forgot password route
// Forgot password route
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found." });

    // Generate reset token
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m", // Token expires in 15 minutes
    });

    // Update reset URL to point to front-end
    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

    // Send email
    await transporter.sendMail({
      to: email,
      subject: "Password Reset",
      html: resetPasswordEmailTemplate(user.username, resetUrl), // Pass the username
    });

    res.status(200).json({ msg: "Password reset email sent." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset password route
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user)
      return res.status(404).json({ msg: "Invalid token or user not found." });

    // Hash and set new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ msg: "Password reset successful." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//profile routes
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password"); // Exclude password
    if (!user) return res.status(404).json({ msg: "User not found." });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//change password
router.put("/change-password", auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ msg: "User not found." });

    // Check if current password is correct
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ msg: "Current password is incorrect." });

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.status(200).json({ msg: "Password updated successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
