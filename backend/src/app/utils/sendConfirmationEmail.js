const config = require("../config");
const transporter = require("./transporterMail");



function sendConfirmationEmail(userEmail, token) {
    const confirmationLink = `http://localhost:5173/verify-email?token=${token}`;
    const mailOptions = {
        from: config.mail_user,
        to: userEmail,
        subject: 'Confirm Your Email Address',
        html: `<p>Please click the following link to confirm your email address: <a href="${confirmationLink}">${confirmationLink}</a></p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending email:', error);
        } else {
            console.log('Confirmation email sent:', info.response);
        }
    });
}

module.exports = sendConfirmationEmail