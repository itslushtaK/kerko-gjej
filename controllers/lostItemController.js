// controllers/lostItemController.js
const LostItem = require("../models/LostItem"); // Ensure you have a LostItem model

exports.addLostItem = async (req, res) => {
  const { name, description, datePosted, image, phoneNumber } = req.body;

  if (!name || !description || !datePosted || !image || !phoneNumber) {
    return res.status(400).json({ msg: "Please provide all fields" });
  }

  try {
    const lostItem = new LostItem({
      name,
      description,
      datePosted,
      image,
      phoneNumber,
      postedBy: req.user.id, // Assuming your user ID is stored in req.user by auth middleware
    });

    await lostItem.save();

    // Here you could send an email to the admin for approval
    // Example: await sendEmailToAdmin(lostItem);

    res.status(201).json(lostItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
