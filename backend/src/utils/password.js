import crypto from "node:crypto";

const KEY_LENGTH = 64;

export const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
};

export const verifyPassword = (password, storedValue) => {
  if (!storedValue || !storedValue.includes(":")) {
    return false;
  }

  const [salt, originalHash] = storedValue.split(":");
  const computedHash = crypto.scryptSync(password, salt, KEY_LENGTH);
  const originalBuffer = Buffer.from(originalHash, "hex");

  if (originalBuffer.length !== computedHash.length) {
    return false;
  }

  return crypto.timingSafeEqual(originalBuffer, computedHash);
};

