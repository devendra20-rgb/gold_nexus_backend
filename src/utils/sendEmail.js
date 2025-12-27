const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1. Setup Transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true, // Port 465 requires secure: true
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // 2. Define Email Details
  const message = {
    from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.message, // HTML Body
  };

  // 3. Send
  await transporter.sendMail(message);
};

module.exports = sendEmail;