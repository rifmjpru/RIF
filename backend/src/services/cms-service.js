import { randomUUID } from "node:crypto";
import { getSiteContentCollection, getSiteContentDocumentId, getSubmissionsCollection } from "../config/database.js";
import { slugify } from "../utils/slugify.js";
import { sendSubmissionEmails } from "./mailer.js";

const editableSections = new Set([
  "siteSettings",
  "homepage",
  "about",
  "team",
  "incubatees",
  "mentors",
  "services",
  "membershipPlans",
  "rifServices",
  "news",
  "events",
  "heroSlider",
  "gallery",
  "formsMeta"
]);

const submissionTypes = new Set(["apply", "membership", "incubitee"]);

const ensureIds = (value, baseKey = "item") => {
  if (!Array.isArray(value)) {
    return value;
  }

  return value.map((item, index) => {
    if (!item || typeof item !== "object") {
      return item;
    }

    if (item.id) {
      return item;
    }

    const titleLike = item.title || item.name || item.label || `${baseKey}-${index + 1}`;

    return {
      ...item,
      id: slugify(titleLike) || `${baseKey}-${index + 1}`
    };
  });
};

const normalizeSection = (section, value) => {
  if (section === "team" && value && typeof value === "object") {
    return {
      boardOfDirectors: ensureIds(value.boardOfDirectors, "board"),
      advisoryBoard: ensureIds(value.advisoryBoard, "advisor"),
      coreTeam: ensureIds(value.coreTeam, "core")
    };
  }

  if (
    ["incubatees", "mentors", "services", "membershipPlans", "news", "events", "heroSlider", "gallery"].includes(
      section
    )
  ) {
    return ensureIds(value, section);
  }

  if (section === "rifServices") {
    if (Array.isArray(value)) {
      return ensureIds(value, "rif-service");
    }

    if (value && typeof value === "object") {
      return {
        ...value,
        benefits: ensureIds(value.benefits, "rif-benefit"),
        serviceTiles: ensureIds(value.serviceTiles, "rif-tile"),
        screeningSteps: ensureIds(value.screeningSteps, "rif-step"),
        eligibilityPoints: Array.isArray(value.eligibilityPoints) ? value.eligibilityPoints : []
      };
    }
  }

  if (section === "about" && value && typeof value === "object") {
    return {
      ...value,
      pillars: ensureIds(value.pillars, "pillar"),
      documents: ensureIds(value.documents, "document")
    };
  }

  return value;
};

export const getPublicSiteData = async () => {
  const data = await getSiteContentCollection().findOne({ _id: getSiteContentDocumentId() });

  if (!data) {
    return {};
  }

  const { _id, ...siteContent } = data;

  return {
    ...siteContent,
    heroSlider: Array.isArray(siteContent.heroSlider) ? siteContent.heroSlider : [],
    gallery: Array.isArray(siteContent.gallery) ? siteContent.gallery : []
  };
};

export const getAdminData = async () => {
  return getPublicSiteData();
};

export const updateSection = async (section, value) => {
  if (!editableSections.has(section)) {
    const error = new Error(`Section "${section}" is not editable.`);
    error.statusCode = 400;
    throw error;
  }

  const normalizedValue = normalizeSection(section, value);
  await getSiteContentCollection().updateOne(
    { _id: getSiteContentDocumentId() },
    {
      $set: {
        [section]: normalizedValue
      }
    }
  );

  return normalizedValue;
};

export const createSubmission = async (type, payload) => {
  if (!submissionTypes.has(type)) {
    const error = new Error(`Unsupported form type "${type}".`);
    error.statusCode = 400;
    throw error;
  }

  const entry = {
    id: randomUUID(),
    type,
    submittedAt: new Date().toISOString(),
    ...payload
  };

  await getSubmissionsCollection().insertOne(entry);
  sendSubmissionEmails(type, entry).catch((error) => {
    console.error("[mail] Error sending submission emails", error);
  });

  const { type: _type, ...submission } = entry;
  return submission;
};

export const getSubmissions = async () => {
  const documents = await getSubmissionsCollection().find({}).sort({ submittedAt: -1 }).toArray();

  return documents.reduce(
    (grouped, document) => {
      const { _id, type, ...submission } = document;
      grouped[type].push(submission);
      return grouped;
    },
    {
      apply: [],
      membership: [],
      incubitee: []
    }
  );
};

export const deleteSubmission = async (type, id) => {
  if (!submissionTypes.has(type)) {
    const error = new Error(`Unsupported submission type "${type}".`);
    error.statusCode = 400;
    throw error;
  }

  await getSubmissionsCollection().deleteOne({ type, id });
  const documents = await getSubmissionsCollection().find({ type }).sort({ submittedAt: -1 }).toArray();

  return documents.map(({ _id, type: _type, ...submission }) => submission);
};
