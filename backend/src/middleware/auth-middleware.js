import { env } from "../config/env.js";
import { verifyToken } from "../utils/token.js";

export const requireAuth = (request, response, next) => {
  const authorization = request.headers.authorization || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  const payload = verifyToken(token, env.adminTokenSecret);

  if (!payload) {
    response.status(401).json({
      message: "Authentication required."
    });
    return;
  }

  request.user = payload;
  next();
};

