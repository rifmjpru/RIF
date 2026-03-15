import { Router } from "express";
import { getAdminUsersCollection } from "../config/database.js";
import { env } from "../config/env.js";
import { verifyPassword } from "../utils/password.js";
import { signToken } from "../utils/token.js";

const router = Router();

router.post("/login", async (request, response, next) => {
  const { username = "", password = "" } = request.body || {};
  const normalizedUsername = username.trim().toLowerCase();

  try {
    const adminUser = await getAdminUsersCollection().findOne({ username: normalizedUsername });

    if (!adminUser || !verifyPassword(password, adminUser.passwordHash)) {
      response.status(401).json({
        message: "Invalid admin credentials."
      });
      return;
    }

    const token = signToken(
      {
        sub: adminUser.username,
        role: adminUser.role,
        userId: adminUser.id
      },
      env.adminTokenSecret
    );

    response.json({
      token,
      user: {
        id: adminUser.id,
        username: adminUser.username,
        role: adminUser.role
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
