import { v2 as cloudinary } from "cloudinary";
import { env } from "./env.js";

let configured = false;

const ensureConfigured = () => {
  if (configured) {
    return;
  }

  const missing = [env.cloudinaryCloudName, env.cloudinaryApiKey, env.cloudinaryApiSecret].some((value) => !value);

  if (missing) {
    const error = new Error(
      "Cloudinary credentials are missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET."
    );
    error.statusCode = 500;
    throw error;
  }

  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret
  });

  configured = true;
};

export const uploadImageBuffer = (buffer, options = {}) => {
  ensureConfigured();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder: env.cloudinaryUploadFolder || "rif-site",
        use_filename: true,
        unique_filename: false,
        overwrite: false,
        ...options
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      }
    );

    stream.end(buffer);
  });
};
