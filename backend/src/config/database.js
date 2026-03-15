import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { GridFSBucket, MongoClient } from "mongodb";
import { env } from "./env.js";
import { hashPassword } from "../utils/password.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const seedFile = path.resolve(__dirname, "..", "..", "data", "cms-data.json");
const siteContentDocumentId = "site-content";
const collections = {
  siteContent: "site_content",
  submissions: "submissions",
  adminUsers: "admin_users"
};
const mediaBucketName = "gallery_assets";

let client;
let database;
let mediaBucket;
let databaseStatus = "disconnected";

const loadSeedData = async () => {
  const raw = await fs.readFile(seedFile, "utf8");
  return JSON.parse(raw);
};

const seedDatabaseIfNeeded = async () => {
  const siteContentCollection = database.collection(collections.siteContent);
  const submissionsCollection = database.collection(collections.submissions);
  const adminUsersCollection = database.collection(collections.adminUsers);
  const normalizedAdminUsername = env.adminUsername.toLowerCase();
  const syncedAdminUser = {
    username: normalizedAdminUsername,
    passwordHash: hashPassword(env.adminPassword),
    role: "admin"
  };
  const existingContent = await siteContentCollection.findOne({ _id: siteContentDocumentId });

  if (existingContent) {
    const seed = await loadSeedData();
    const contentUpdates = {};

    if (!Array.isArray(existingContent.heroSlider)) {
      contentUpdates.heroSlider =
        existingContent.gallery?.length
          ? existingContent.gallery.slice(0, 4).map(({ description: _description, ...item }, index) => ({
              title: `Hero Slide ${index + 1}`,
              ...item
            }))
          : seed.heroSlider || [];
    }

    if (!Array.isArray(existingContent.gallery)) {
      contentUpdates.gallery = seed.gallery || [];
    }

    if (Object.keys(contentUpdates).length) {
      await siteContentCollection.updateOne(
        { _id: siteContentDocumentId },
        {
          $set: contentUpdates
        }
      );
    }

    await adminUsersCollection.updateOne(
      { username: normalizedAdminUsername },
      {
        $set: syncedAdminUser,
        $setOnInsert: {
          id: randomUUID(),
          createdAt: new Date().toISOString()
        }
      },
      { upsert: true }
    );

    return;
  }

  const seed = await loadSeedData();
  const { submissions = {}, ...siteContent } = seed;

  await siteContentCollection.insertOne({
    _id: siteContentDocumentId,
    ...siteContent
  });

  const submissionDocuments = Object.entries(submissions).flatMap(([type, entries]) =>
    (entries || []).map((entry) => ({
      type,
      ...entry
    }))
  );

  if (submissionDocuments.length) {
    await submissionsCollection.insertMany(submissionDocuments);
  }

  await adminUsersCollection.updateOne(
    { username: normalizedAdminUsername },
    {
      $set: syncedAdminUser,
      $setOnInsert: {
        id: randomUUID(),
        createdAt: new Date().toISOString()
      }
    },
    { upsert: true }
  );
};

export const connectToDatabase = async () => {
  if (database) {
    return database;
  }

  databaseStatus = "connecting";

  try {
    client = new MongoClient(env.mongodbUri);
    await client.connect();
    database = client.db(env.mongodbDbName);
    mediaBucket = new GridFSBucket(database, { bucketName: mediaBucketName });

    const submissionsCollection = database.collection(collections.submissions);
    const adminUsersCollection = database.collection(collections.adminUsers);
    await submissionsCollection.createIndex({ type: 1, submittedAt: -1 });
    await submissionsCollection.createIndex({ id: 1 }, { unique: true, sparse: true });
    await adminUsersCollection.createIndex({ username: 1 }, { unique: true });
    await adminUsersCollection.createIndex({ id: 1 }, { unique: true });

    await seedDatabaseIfNeeded();
    databaseStatus = "connected";

    return database;
  } catch (error) {
    databaseStatus = "error";
    throw error;
  }
};

export const getDatabase = () => {
  if (!database) {
    const error = new Error("Database connection has not been initialized.");
    error.statusCode = 500;
    throw error;
  }

  return database;
};

export const getDatabaseStatus = () => databaseStatus;

export const getSiteContentCollection = () => getDatabase().collection(collections.siteContent);

export const getSubmissionsCollection = () => getDatabase().collection(collections.submissions);

export const getAdminUsersCollection = () => getDatabase().collection(collections.adminUsers);

export const getMediaBucket = () => {
  if (!mediaBucket) {
    const error = new Error("Media bucket has not been initialized.");
    error.statusCode = 500;
    throw error;
  }

  return mediaBucket;
};

export const getMediaFilesCollection = () => getDatabase().collection(`${mediaBucketName}.files`);

export const getSiteContentDocumentId = () => siteContentDocumentId;
