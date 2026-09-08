import nodemailer from "nodemailer";

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

if (!emailUser || !emailPass) {
  throw new Error(
    "EMAIL_USER or EMAIL_PASS is missing"
  );
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

export const sendOTPEmail = async (
  email: string,
  otp: string
) => {
  await transporter.sendMail({
    from: `"FindBack" <${emailUser}>`,
    to: email,
    subject: "FindBack - Email Verification OTP",

    html: `
      <div>
        <h2>FindBack Email Verification</h2>

        <p>Your OTP is:</p>

        <h1>${otp}</h1>

        <p>This OTP is valid for 5 minutes.</p>

        <p>
          If you did not create a FindBack account,
          please ignore this email.
        </p>
      </div>
    `,
  });
};