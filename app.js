// app.js
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const authRoutes = require("./routes/auth");
const lostItemsRoutes = require("./routes/lostItems"); // Import lost items routes

const cors = require("cors");

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: [
      "https://kerko-gjej.vercel.app",
      "https://kerko-gjej-q40wtwxqn-gentuar-lushtakus-projects.vercel.app",
    ], // Allow requests from your frontend
  })
);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.error(error));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/lost-items", lostItemsRoutes); // Corrected path here

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
