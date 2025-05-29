const config = require("../config");
const transporter = require("./transporterMail");

const sendBookingSuccessEmail = (userEmail, eventName,amount) => {
  const bookingLink = `${config.client_url}/app/my-tickets`;

  const mailOptions = {
    from: config.mail_user,
    to: userEmail,
    subject: "Booking Confirmation - lessortiesdediane",
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
          color: #2c3e50;
          font-weight: 700;
          margin-bottom: 10px;
        }
        p {
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 20px;
        }
        a.button {
          display: inline-block;
          background-color: #1e88e5;
          color: #ffffff !important;
          text-decoration: none;
          padding: 12px 25px;
          border-radius: 5px;
          font-weight: 600;
          transition: background-color 0.3s ease;
        }
        a.button:hover {
          background-color: #0d6efd;
        }
        .footer {
          font-size: 12px;
          color: #888888;
          margin-top: 30px;
          text-align: center;
        }
        .brand {
          font-weight: 700;
          color: #1e88e5;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Welcome to <span class="brand">lessortiesdediane</span>!</h1>
        <p>You have booked ${eventName}. Total Amount: ${amount}  Your Booking has been successfull</p>
        <p style="text-align:center;">
          <a href="${bookingLink}" class="button" target="_blank" rel="noopener noreferrer">See Bookings</a>
        </p>
        <p>If the button above doesn't work, copy and paste the following URL into your browser:</p>
        <p style="word-break: break-word; color:#1e88e5;">${bookingLink}</p>
        <p>If you didn't register, please ignore this email.</p>
        <div class="footer">
          &copy; ${new Date().getFullYear()} lessortiesdediane. All rights reserved.
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
      console.log("Booking Confirmation email sent:", info.response);
    }
  });
};

module.exports = sendBookingSuccessEmail;
