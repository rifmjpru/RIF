import { env } from "../config/env.js";

let transporter = null;
let nodemailerModule = null;

const isEmailConfigured = () =>
  Boolean(env.smtpHost && env.smtpUser && env.smtpPass && env.smtpFrom && env.notifyAdminEmail);

const getTransporter = async () => {
  if (transporter) return transporter;
  if (!isEmailConfigured()) return null;

  if (!nodemailerModule) {
    try {
      nodemailerModule = await import("nodemailer");
    } catch (error) {
      console.warn("[mail] Nodemailer not installed; email sending disabled.", error?.message || error);
      return null;
    }
  }

  transporter = nodemailerModule.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass
    }
  });

  return transporter;
};

const formatLines = (payload = {}) =>
  Object.entries(payload)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");

const sendMail = async ({ to, subject, text }) => {
  const tx = await getTransporter();
  if (!tx) {
    console.warn("[mail] Email not sent: SMTP not configured.");
    return false;
  }

  try {
    await tx.sendMail({
      from: env.smtpFrom,
      to,
      subject,
      text
    });
    return true;
  } catch (error) {
    console.error("[mail] Failed to send email", error);
    return false;
  }
};

export const sendSubmissionEmails = async (type, submission) => {
  const tx = await getTransporter();
  if (!tx) return;

  const subjectLabel = {
    apply: "New Apply Submission",
    membership: "New Membership Request",
    enquiry: "New General Enquiry"
  }[type] || "New Website Submission";

  const summary = formatLines(submission);

  await sendMail({
    to: env.notifyAdminEmail,
    subject: subjectLabel,
    text: `A new ${type} form was submitted:\n\n${summary}`
  });

  if (submission.email) {
    await sendMail({
      to: submission.email,
      subject: "We received your submission",
      text:
        `Hi ${submission.name || "there"},\n\n` +
        "Thanks for submitting your form. Our team will review and get back to you.\n\n" +
        "Summary:\n" +
        `${summary}\n\n` +
        "- RIF Team"
    });
  }
};
