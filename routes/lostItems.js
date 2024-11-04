// routes/lostItems.js
const express = require("express");
const LostItem = require("../models/LostItem");
const auth = require("../middleware/auth");
const nodemailer = require("nodemailer");

const router = express.Router();

// Nodemailer setup for sending emails
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Add lost item route
router.post("/add", auth, async (req, res) => {
  const { name, description, datePosted, image, phoneNumber } = req.body;

  try {
    const newLostItem = new LostItem({
      name,
      description,
      datePosted,
      image,
      phoneNumber,
      userId: req.userId,
      isApproved: false,
    });

    await newLostItem.save();

    // Prepare email to admin
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: "New Lost Item Submission Awaiting Approval",
      html: `
        <h3>New Lost Item Submitted</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Description:</strong> ${description}</p>
        <p><strong>Date Posted:</strong> ${datePosted}</p>
        <p><strong>Image:</strong> <img src="${image}" alt="${name}" width="200"/></p>
        <p><strong>Phone Number:</strong> ${phoneNumber}</p>
        <p><strong>User ID:</strong> ${req.userId}</p>
        <p>Please review and approve the submission by clicking the link below:</p>
        <p><a href="http://localhost:5000/api/lost-items/approve/${newLostItem._id}">Approve Lost Item</a></p>
      `,
    };

    await transporter.sendMail(mailOptions);

   res.status(201).json({
  msg: "Lost item added successfully, awaiting approval.",
  redirectUrl: "https://kerko-gjej.vercel.app/item-approved",
});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve lost item route
router.get("/approve/:id", async (req, res) => {
  try {
    const lostItem = await LostItem.findById(req.params.id);
    if (!lostItem) return res.status(404).json({ msg: "Lost item not found." });

    lostItem.approved = true; // Set approval status to true
    await lostItem.save();

    res.status(200).json({ msg: "Lost item approved successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get my lost items route
router.get("/my-items", auth, async (req, res) => {
  try {
    // Find lost items associated with the logged-in user's ID
    const userLostItems = await LostItem.find({ userId: req.userId });

    res.status(200).json(userLostItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/lost-items/:id", async (req, res) => {
  try {
    const lostItem = await LostItem.findById(req.params.id);
    if (!lostItem) {
      return res.status(404).json({ msg: "Lost item not found." });
    }
    res.status(200).json(lostItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all lost items route
router.get("/lost-items", async (req, res) => {
  try {
    const lostItems = await LostItem.find({ approved: true }) // Fetch all approved lost items
      .sort({ createdAt: -1 }); // Sort by createdAt in descending order (newest first)
    res.status(200).json(lostItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error retrieving lost items." });
  }
});

// Delete a lost item by ID (only if it belongs to the logged-in user)
router.delete("/delete/:id", auth, async (req, res) => {
  const { id } = req.params;

  try {
    // Find the lost item by ID
    const lostItem = await LostItem.findById(id);

    // Check if the item exists and belongs to the logged-in user
    if (!lostItem) {
      return res.status(404).json({ msg: "Lost item not found." });
    }
    if (lostItem.userId.toString() !== req.userId) {
      return res
        .status(403)
        .json({ msg: "Not authorized to delete this item." });
    }

    // Delete the lost item
    await lostItem.deleteOne(); // Use deleteOne instead of remove
    res.status(200).json({ msg: "Lost item deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export the router
module.exports = router;
