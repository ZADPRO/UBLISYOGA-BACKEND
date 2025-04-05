import nodemailer from "nodemailer";

interface MailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAILID,
    pass: process.env.PASSWORD,
  },
});

/**
 * Sends an email using Nodemailer.
 * @param {MailOptions} mailOptions - Options for the email.
 */
export const sendEmail = async (mailOptions: MailOptions): Promise<void> => {
  try {
    await transporter.sendMail({
      from: process.env.EMAILID, // Sender address
      ...mailOptions,
    });
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
