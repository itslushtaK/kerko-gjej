// routes/upload.js
const express = require("express");
const router = express.Router();
const cloudinary = require("../cloudinaryConfig");
const multer = require("multer");
const upload = multer({ dest: "uploads/" }); // Temporary storage before Cloudinary

router.post("/upload-image", upload.single("image"), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    res.json({ imageUrl: result.secure_url });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

module.exports = router;
