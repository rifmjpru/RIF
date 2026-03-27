import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, "..", "..");

dotenv.config({ path: path.join(backendRoot, ".env") });

const splitOrigins = (value) =>
  value
    .split(",")
    .map((origin) => origin.trim())
    .map((origin) => origin.replace(/\/+$/, ""))
    .filter(Boolean);

export const env = {
  port: Number(process.env.PORT || 5001),
  frontendOrigins: splitOrigins(process.env.FRONTEND_ORIGINS || "http://localhost:5173"),
  mongodbUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017",
  mongodbDbName: process.env.MONGODB_DB_NAME || "rif_website",
  adminUsername: process.env.ADMIN_USERNAME || "admin@rif.local",
  adminPassword: process.env.ADMIN_PASSWORD || "change-me",
  adminTokenSecret: process.env.ADMIN_TOKEN_SECRET || "replace-with-a-long-random-string",
  backendRoot,
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || "",
  cloudinaryUploadFolder: process.env.CLOUDINARY_UPLOAD_FOLDER || "",
  smtpHost: process.env.SMTP_HOST || "",
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",
  smtpFrom: process.env.SMTP_FROM || process.env.SMTP_USER || "",
  notifyAdminEmail: process.env.NOTIFY_ADMIN_EMAIL || process.env.ADMIN_USERNAME || ""
};
