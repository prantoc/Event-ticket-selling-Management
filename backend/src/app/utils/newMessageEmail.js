const config = require("../config");
const transporter = require("./transporterMail");

const newMessageEmail = (userEmail, name, email, message) => {
  const mailOptions = {
    from: config.mail_user,
    to: userEmail,
    subject: "📬 New Contact Message Received",
    html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f4f6f8;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          padding: 30px;
          color: #333333;
        }
        h1 {
          color: #1e88e5;
          font-size: 24px;
          margin-bottom: 10px;
        }
        .info {
          background-color: #f0f4f8;
          border-left: 4px solid #1e88e5;
          padding: 10px 15px;
          margin: 20px 0;
          border-radius: 5px;
        }
        .info p {
          margin: 5px 0;
          font-size: 14px;
        }
        .message {
          margin: 20px 0;
          padding: 15px;
          background-color: #f9f9f9;
          border-radius: 5px;
          border: 1px solid #eee;
          white-space: pre-wrap;
        }
        .footer {
          font-size: 12px;
          color: #888888;
          margin-top: 30px;
          text-align: center;
        }
        .brand {
          font-weight: bold;
          color: #1e88e5;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>📩 You've received a new message!</h1>
        <p>Hello,</p>
        <p>You just received a new message through your contact form on <span class="brand">lessortiesdediane</span>:</p>

        <div class="info">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
        </div>

        <div class="message">
          ${message}
        </div>

        <p>You can reply directly to this email to get in touch with the sender.</p>

        <div class="footer">
          &copy; ${new Date().getFullYear()} <span class="brand">lessortiesdediane</span>. All rights reserved.
        </div>
      </div>
    </body>
    </html>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Contact message email sent:", info.response);
    }
  });
};

module.exports = newMessageEmail;