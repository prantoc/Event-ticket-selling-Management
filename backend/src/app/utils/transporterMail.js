const config = require("../config");
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    host: config.mail_host,
    port: config.mail_port,
    auth: {
      user: config.mail_user,
      pass: config.mail_pass,
    },
  });

  module.exports = transporter