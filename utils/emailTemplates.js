const confirmationEmailTemplate = (username, url) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Confirmation</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 20px;
    }
    .container {
      background: white;
      padding: 20px;
      border-radius: 5px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      max-width: 600px;
      margin: auto;
    }
    h1 {
      color: #333;
    }
    p {
      color: #666;
      line-height: 1.5;
    }
    a {
      text-decoration: none;
      font-weight: bold;
    }
    .button {
      display: inline-block;
      background-color: #28a745; /* Green background */
      color: white; /* White text */
      padding: 10px 20px;
      border-radius: 5px;
      text-align: center;
      font-size: 16px;
      margin-top: 10px;
      transition: background-color 0.3s ease; /* Add transition for hover effect */
    }
    .button:hover {
      background-color: #218838; /* Darker green on hover */
    }
    .footer {
      margin-top: 20px;
      font-size: 12px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Welcome to the Lost & Found, ${username}!</h1>
    <p>Thank you for registering. Please click the button below to confirm your email:</p>
    <a href="${url}" class="button">Confirm Email</a>
    <p>If you did not create an account, please ignore this email.</p>
    <div class="footer">Lost & Found Team</div>
  </div>
</body>
</html>
`;

const resetPasswordEmailTemplate = (username, url) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 20px;
    }
    .container {
      background: white;
      padding: 20px;
      border-radius: 5px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      max-width: 600px;
      margin: auto;
    }
    h1 {
      color: #333;
    }
    p {
      color: #666;
      line-height: 1.5;
    }
    a {
      color: #1a73e8;
      text-decoration: none;
      font-weight: bold;
    }
    .button {
      display: inline-block;
      background-color: #1a73e8; /* Blue background for reset */
      color: white;
      padding: 10px 20px;
      border-radius: 5px;
      text-align: center;
      text-decoration: none;
      font-size: 16px;
      margin-top: 10px;
      transition: background-color 0.3s ease; /* Add transition for hover effect */
    }
    .button:hover {
      background-color: #0c6bb1; /* Darker blue on hover */
    }
    .footer {
      margin-top: 20px;
      font-size: 12px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Reset Your Password - Lost & Found</h1>
    <p>Hello ${username},</p>
    <p>You requested to reset your password. Click the button below to set a new password:</p>
    <a href="${url}" class="button">Reset Password</a>
    <p>If you did not request this, please ignore this email.</p>
    <div class="footer">Lost & Found Team</div>
  </div>
</body>
</html>
`;

// Export both templates
module.exports = {
  confirmationEmailTemplate,
  resetPasswordEmailTemplate,
};
