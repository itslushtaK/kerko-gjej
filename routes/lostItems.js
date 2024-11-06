const express = require("express");
const LostItem = require("../models/LostItem");
const User = require("../models/User"); // Ensure you have this model to fetch user email
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
      datePosted: datePosted || new Date(),
      image,
      phoneNumber,
      userId: req.userId,
      approved: false,
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
        <p><strong>Date Posted:</strong> ${new Date().toLocaleDateString()}</p>
        ${image ? `<p><strong>Image:</strong> <img src="${image}" alt="${name}" width="200"/></p>` : ""}
        <p><strong>Phone Number:</strong> ${phoneNumber}</p>
        <p><strong>User ID:</strong> ${req.userId}</p>
        <p>Please review and approve the submission by clicking the link below:</p>
        <p><a href="https://kerko-gjej-production.up.railway.app/api/lost-items/approve/${newLostItem._id}">Approve Lost Item</a></p>
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

// Approve lost item route and notify user by email
router.get("/approve/:id", async (req, res) => {
  try {
    // Find the lost item by ID and populate user details
    const lostItem = await LostItem.findById(req.params.id).populate("userId");
    if (!lostItem) return res.status(404).json({ msg: "Lost item not found." });

    // Check if already approved
    if (lostItem.approved) return res.status(400).json({ msg: "Item is already approved." });

    // Set approval status to true
    lostItem.approved = true;
    await lostItem.save();

    // Send an email to the item author notifying about the approval
    const user = lostItem.userId; // User details from populated userId
    if (user && user.email) {
      const approvalEmailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Your Lost Item Post has been Approved",
        html: `
          <h3>Congratulations!</h3>
          <p>Your post titled "<strong>${lostItem.name}</strong>" has been approved by the admin and is now visible to others.</p>
          <p><a href="https://kerko-gjej.vercel.app/lost-items/">View your post</a></p>
          <p>Thank you for using Kerko & Gjej to help others find lost items!</p>
        `,
      };

      await transporter.sendMail(approvalEmailOptions);
    }

    res.redirect("https://kerko-gjej.vercel.app/item-approved");

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get my lost items route
router.get("/my-items", auth, async (req, res) => {
  try {
    const userLostItems = await LostItem.find({ userId: req.userId });
    res.status(200).json(userLostItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get lost item by ID
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
    const lostItems = await LostItem.find({ approved: true }).sort({ createdAt: -1 });
    res.status(200).json(lostItems);
  } catch (error) {
    res.status(500).json({ msg: "Error retrieving lost items." });
  }
});

// Delete a lost item by ID (only if it belongs to the logged-in user)
router.delete("/delete/:id", auth, async (req, res) => {
  const { id } = req.params;

  try {
    const lostItem = await LostItem.findById(id);
    if (!lostItem) {
      return res.status(404).json({ msg: "Lost item not found." });
    }
    if (lostItem.userId.toString() !== req.userId) {
      return res.status(403).json({ msg: "Not authorized to delete this item." });
    }

    await lostItem.deleteOne();
    res.status(200).json({ msg: "Lost item deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
