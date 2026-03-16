import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth-middleware.js";
import { uploadImageBuffer } from "../config/cloudinary.js";
import { deleteSubmission, getAdminData, getSubmissions, updateSection } from "../services/cms-service.js";
import { Readable } from "node:stream";
import { getMediaBucket } from "../config/database.js";

const router = Router();
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 6 * 1024 * 1024
  },
  fileFilter(_request, file, callback) {
    if (!file.mimetype.startsWith("image/")) {
      const error = new Error("Only image uploads are allowed.");
      error.statusCode = 400;
      callback(error);
      return;
    }

    callback(null, true);
  }
});

const documentUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024
  },
  fileFilter(_request, file, callback) {
    const isPdf = file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      const error = new Error("Only PDF uploads are allowed.");
      error.statusCode = 400;
      callback(error);
      return;
    }

    callback(null, true);
  }
});

router.use(requireAuth);

const handleAssetUpload = async (request, response, next, options) => {
  try {
    if (!request.file) {
      response.status(400).json({
        message: options.requiredMessage
      });
      return;
    }

    const uploadStream = getMediaBucket().openUploadStream(request.file.originalname, {
      contentType: request.file.mimetype,
      metadata: {
        contentType: request.file.mimetype,
        uploadedBy: request.user?.sub || "admin",
        uploadedAt: new Date().toISOString(),
        purpose: options.purpose
      }
    });

    await new Promise((resolve, reject) => {
      Readable.from(request.file.buffer)
        .pipe(uploadStream)
        .on("error", reject)
        .on("finish", resolve);
    });

    response.status(201).json({
      assetId: uploadStream.id.toString(),
      [options.urlKey]: `/api/assets/${uploadStream.id.toString()}`,
      filename: request.file.originalname
    });
  } catch (error) {
    next(error);
  }
};

const handleImageUpload = async (request, response, next) => {
  try {
    if (!request.file) {
      response.status(400).json({ message: "Image file is required." });
      return;
    }

    const result = await uploadImageBuffer(request.file.buffer, {
      filename_override: request.file.originalname
    });

    response.status(201).json({
      assetId: result.public_id,
      imageUrl: result.secure_url,
      filename: request.file.originalname
    });
  } catch (error) {
    next(error);
  }
};

const handleDocumentUpload = async (request, response, next) =>
  handleAssetUpload(request, response, next, {
    purpose: "document",
    requiredMessage: "PDF file is required.",
    urlKey: "documentUrl"
  });

router.get("/content", async (_request, response, next) => {
  try {
    const data = await getAdminData();
    response.json(data);
  } catch (error) {
    next(error);
  }
});

router.put("/content/:section", async (request, response, next) => {
  try {
    const updated = await updateSection(request.params.section, request.body?.value);
    response.json({
      message: `${request.params.section} updated successfully.`,
      value: updated
    });
  } catch (error) {
    next(error);
  }
});

router.get("/submissions", async (_request, response, next) => {
  try {
    const submissions = await getSubmissions();
    response.json(submissions);
  } catch (error) {
    next(error);
  }
});

router.delete("/submissions/:type/:id", async (request, response, next) => {
  try {
    const submissions = await deleteSubmission(request.params.type, request.params.id);
    response.json({
      message: "Submission deleted successfully.",
      submissions
    });
  } catch (error) {
    next(error);
  }
});

router.post("/uploads/image", imageUpload.single("image"), handleImageUpload);
router.post("/uploads/gallery-image", imageUpload.single("image"), handleImageUpload);
router.post("/uploads/document", documentUpload.single("document"), handleDocumentUpload);

export default router;
