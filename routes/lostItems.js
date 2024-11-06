// Approve lost item route
router.get("/approve/:id", async (req, res) => {
  try {
    const lostItem = await LostItem.findById(req.params.id);
    if (!lostItem) return res.status(404).json({ msg: "Lost item not found." });

    // Set approval status to true
    lostItem.approved = true;
    await lostItem.save();

    // Prepare email notification to the author
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: lostItem.userEmail, // Ensure this field is populated with the user's email
      subject: "Your Lost Item Post Has Been Approved",
      html: `
        <h3>Good News!</h3>
        <p>Your post titled "<strong>${lostItem.name}</strong>" has been approved by the admin.</p>
        <p>It is now visible on the Lost & Found platform. Thank you for contributing!</p>
        <p><a href="https://kerko-gjej.vercel.app/lost-items/${lostItem._id}">View Your Post</a></p>
      `,
    };

    // Send the email notification to the author
    await transporter.sendMail(mailOptions);

    // Redirect to the frontend confirmation page
    res.redirect("https://kerko-gjej.vercel.app/item-approved");

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
