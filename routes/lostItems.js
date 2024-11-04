// Add lost item route
router.post("/add", auth, async (req, res) => {
  const { name, description, datePosted, image, phoneNumber } = req.body;

  try {
    const newLostItem = new LostItem({
      name,
      description,
      datePosted: datePosted || new Date(),
      image, // This should be a URL or a string representing the image
      phoneNumber,
      userId: req.userId,
      approved: false,
    });

    await newLostItem.save();

    // Prepare email to admin with the backend approval link
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
        <p><a href="http://localhost:5000/api/lostItems/approve/${newLostItem._id}">Approve Lost Item</a></p>
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

    // Redirect to the frontend confirmation page
    res.redirect("https://kerko-gjej.vercel.app/item-approved");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
