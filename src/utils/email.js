const nodemailer = require("nodemailer");

async function sendResetPasswordEmail(to, otp) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject: "Your GoldNews Admin OTP",
    html: `
      <h2>Reset Password OTP</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP is valid for 10 minutes.</p>
    `
  });

  console.log("📨 OTP EMAIL SENT to:", to, "OTP:", otp);
}

module.exports = { sendResetPasswordEmail };
