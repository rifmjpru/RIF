import crypto from "node:crypto";

const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
const decode = (value) => JSON.parse(Buffer.from(value, "base64url").toString("utf8"));

export const signToken = (payload, secret, expiresInHours = 12) => {
  const header = { alg: "HS256", typ: "JWT" };
  const body = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + expiresInHours * 60 * 60
  };

  const unsigned = `${encode(header)}.${encode(body)}`;
  const signature = crypto.createHmac("sha256", secret).update(unsigned).digest("base64url");

  return `${unsigned}.${signature}`;
};

export const verifyToken = (token, secret) => {
  if (!token) {
    return null;
  }

  const parts = token.split(".");

  if (parts.length !== 3) {
    return null;
  }

  const [header, payload, signature] = parts;
  const unsigned = `${header}.${payload}`;
  const expected = crypto.createHmac("sha256", secret).update(unsigned).digest("base64url");

  if (signature !== expected) {
    return null;
  }

  const body = decode(payload);

  if (!body.exp || body.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return body;
};

