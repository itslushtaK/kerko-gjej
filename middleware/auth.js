// middleware/auth.js
const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const token = req.header("Authorization").replace("Bearer ", ""); // Extract token from Authorization header
  if (!token) return res.status(401).json({ msg: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
    req.userId = decoded.id; // Store the user ID in the request object
    next(); // Proceed to the next middleware/route handler
  } catch (error) {
    res.status(401).json({ msg: "Invalid token" });
  }
};

module.exports = auth;
