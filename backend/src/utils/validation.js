const asCleanString = (value) => value?.toString().trim() || "";

export const sanitizePayload = (payload = {}) =>
  Object.fromEntries(
    Object.entries(payload).map(([key, value]) => {
      if (Array.isArray(value)) {
        return [key, value.map((item) => (typeof item === "string" ? asCleanString(item) : item))];
      }

      return [key, typeof value === "string" ? asCleanString(value) : value];
    })
  );

export const requireFields = (payload, fields) => {
  const missing = fields.filter((field) => !asCleanString(payload[field]));

  if (missing.length) {
    const error = new Error(`Missing required fields: ${missing.join(", ")}`);
    error.statusCode = 400;
    throw error;
  }
};

