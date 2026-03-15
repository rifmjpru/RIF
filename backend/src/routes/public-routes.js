import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDatabaseStatus, getMediaBucket, getMediaFilesCollection } from "../config/database.js";
import { createSubmission, getPublicSiteData } from "../services/cms-service.js";
import { requireFields, sanitizePayload } from "../utils/validation.js";

const router = Router();

router.get("/health", (_request, response) => {
  response.json({
    ok: true,
    service: "rif-backend",
    database: getDatabaseStatus()
  });
});

router.get("/site", async (_request, response, next) => {
  try {
    const data = await getPublicSiteData();
    response.json(data);
  } catch (error) {
    next(error);
  }
});

router.get("/assets/:assetId", async (request, response, next) => {
  try {
    const { assetId } = request.params;

    if (!ObjectId.isValid(assetId)) {
      response.status(404).json({
        message: "Asset not found."
      });
      return;
    }

    const objectId = new ObjectId(assetId);
    const file = await getMediaFilesCollection().findOne({ _id: objectId });

    if (!file) {
      response.status(404).json({
        message: "Asset not found."
      });
      return;
    }

    response.setHeader("Content-Type", file.metadata?.contentType || file.contentType || "application/octet-stream");
    response.setHeader("Cache-Control", "public, max-age=31536000, immutable");

    const stream = getMediaBucket().openDownloadStream(objectId);
    stream.on("error", next);
    stream.pipe(response);
  } catch (error) {
    next(error);
  }
});

router.post("/forms/apply", async (request, response, next) => {
  try {
    const payload = sanitizePayload(request.body);
    requireFields(payload, ["name", "email", "startupName", "stage", "problemStatement"]);
    const entry = await createSubmission("apply", payload);
    response.status(201).json({
      message: "Application submitted successfully.",
      entry
    });
  } catch (error) {
    next(error);
  }
});

router.post("/forms/membership", async (request, response, next) => {
  try {
    const payload = sanitizePayload(request.body);
    requireFields(payload, ["name", "email", "planName", "organization", "engagementGoal"]);
    const entry = await createSubmission("membership", payload);
    response.status(201).json({
      message: "Membership request submitted successfully.",
      entry
    });
  } catch (error) {
    next(error);
  }
});

router.post("/forms/incubitee", async (request, response, next) => {
  try {
    const payload = sanitizePayload(request.body);
    requireFields(payload, ["founderName", "email", "ventureName", "sector", "stage"]);
    const entry = await createSubmission("incubitee", payload);
    response.status(201).json({
      message: "Incubitee registration submitted successfully.",
      entry
    });
  } catch (error) {
    next(error);
  }
});

export default router;
