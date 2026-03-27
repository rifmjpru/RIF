import { randomUUID } from "node:crypto";
import { getSiteContentCollection, getSiteContentDocumentId, getSubmissionsCollection } from "../config/database.js";
import { slugify } from "../utils/slugify.js";
import { sendSubmissionEmails } from "./mailer.js";

const editableSections = new Set([
  "siteSettings",
  "pageHeroPanels",
  "homepage",
  "about",
  "legalPages",
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
  "mediaCoverage",
  "formsMeta"
]);

const submissionTypes = new Set(["apply", "membership", "enquiry"]);
const acceptedSubmissionTypes = new Set(["apply", "membership", "enquiry", "incubatee"]);

const defaultTestimonialsSection = {
  eyebrow: "Testimonials",
  title: "What founders, members, and ecosystem partners say about working with RIF.",
  description: "Show a short set of recent testimonials on the homepage and guide visitors to the full page when they want to read more.",
  previewCount: 3,
  ctaLabel: "View More Testimonials",
  ctaLink: "/testimonials",
  pageEyebrow: "Testimonials",
  pageTitle: "Voices from the RIF ecosystem",
  pageDescription: "A full list of testimonials that can be edited anytime from the admin dashboard."
};

const defaultHomepageCta = {
  title: "Designed for institutional credibility and founder momentum.",
  description:
    "Every major section is editable from the admin dashboard so the website can handle updates, applications, media, documents, and announcements without code changes.",
  primaryLabel: "Send Enquiry",
  primaryLink: "/enquiry",
  secondaryLabel: "View Leadership",
  secondaryLink: "/leadership",
  qrLabel: "Quick Scan",
  qrTitle: "",
  qrNote: "",
  qrImageUrl: "",
  qrAssetId: ""
};

const defaultLeadershipContent = {
  eyebrow: "Leadership",
  title: "Leadership that guides governance, direction, and founder confidence.",
  description: "Explore the strategic pillars behind RIF along with the board and advisory leaders who shape institutional momentum.",
  primaryCtaLabel: "Board of Directors",
  primaryCtaLink: "/leadership/board-of-directors",
  secondaryCtaLabel: "Send Enquiry",
  secondaryCtaLink: "/enquiry",
  pillarsEyebrow: "Leadership Pillars",
  pillarsTitle: "The principles guiding how RIF builds trust and momentum.",
  pillarsDescription: "These pillars now sit within Leadership so governance, advisory support, and strategic direction are presented together."
};

const defaultFormsMeta = {
  apply: {
    title: "Apply to RIF",
    intro: "Use this form for incubation or program admission requests.",
    points: [
      "Share your startup idea and stage",
      "Explain the problem and traction so far",
      "Mention the support you expect from RIF"
    ],
    qrCodeLabel: "Scan to Pay",
    qrCodeTitle: "Application Payment QR",
    qrCodeNote: "Dummy QR for now. Replace this from the admin panel whenever the final payment QR is ready.",
    qrCodeImageUrl: "",
    qrCodeAssetId: ""
  },
  membership: {
    title: "Register for Membership",
    intro: "Choose a plan and tell us how you want to engage with the ecosystem.",
    points: [
      "Select your membership track",
      "Tell us your role and goals",
      "Add your organization details"
    ],
    qrCodeLabel: "Scan to Pay",
    qrCodeTitle: "Membership Payment QR",
    qrCodeNote: "Dummy QR for now. Replace this from the admin panel whenever the final membership payment QR is ready.",
    qrCodeImageUrl: "",
    qrCodeAssetId: ""
  },
  enquiry: {
    title: "General Enquiry",
    intro: "Use this form for general questions, collaboration requests, startup support queries, or follow-up conversations with the RIF team.",
    points: [
      "Share your basic contact details",
      "Tell us the topic of your enquiry",
      "Explain how the RIF team can help"
    ],
    qrCodeLabel: "Quick Connect",
    qrCodeTitle: "General Enquiry QR",
    qrCodeNote: "Dummy QR for now. Replace it later from the admin panel with the final enquiry QR or a WhatsApp/contact QR.",
    qrCodeImageUrl: "",
    qrCodeAssetId: ""
  }
};

const defaultPageHeroPanels = {
  about: {
    eyebrow: "",
    title: "",
    description: "",
    imageUrl: "",
    imageAssetId: "",
    imageAlt: ""
  },
  leadership: {
    eyebrow: "",
    title: "",
    description: "",
    imageUrl: "",
    imageAssetId: "",
    imageAlt: ""
  },
  boardOfDirectors: {
    eyebrow: "",
    title: "",
    description: "",
    imageUrl: "",
    imageAssetId: "",
    imageAlt: ""
  },
  advisoryBoard: {
    eyebrow: "",
    title: "",
    description: "",
    imageUrl: "",
    imageAssetId: "",
    imageAlt: ""
  },
  coreTeam: {
    eyebrow: "",
    title: "",
    description: "",
    imageUrl: "",
    imageAssetId: "",
    imageAlt: ""
  },
  contact: {
    eyebrow: "",
    title: "",
    description: "",
    imageUrl: "",
    imageAssetId: "",
    imageAlt: "",
    qrLabel: "",
    qrTitle: "",
    qrNote: "",
    qrImageUrl: "",
    qrAssetId: ""
  },
  services: {
    eyebrow: "",
    title: "",
    description: "",
    imageUrl: "",
    imageAssetId: "",
    imageAlt: ""
  },
  incubatees: {
    eyebrow: "",
    title: "",
    description: "",
    imageUrl: "",
    imageAssetId: "",
    imageAlt: ""
  },
  mentors: {
    eyebrow: "",
    title: "",
    description: "",
    imageUrl: "",
    imageAssetId: "",
    imageAlt: ""
  },
  newsEvents: {
    eyebrow: "",
    title: "",
    description: "",
    imageUrl: "",
    imageAssetId: "",
    imageAlt: ""
  },
  testimonials: {
    eyebrow: "",
    title: "",
    description: "",
    imageUrl: "",
    imageAssetId: "",
    imageAlt: ""
  },
  privacyPolicy: {
    eyebrow: "",
    title: "",
    description: "",
    imageUrl: "",
    imageAssetId: "",
    imageAlt: ""
  },
  termsConditions: {
    eyebrow: "",
    title: "",
    description: "",
    imageUrl: "",
    imageAssetId: "",
    imageAlt: ""
  },
  refundPolicy: {
    eyebrow: "",
    title: "",
    description: "",
    imageUrl: "",
    imageAssetId: "",
    imageAlt: ""
  }
};

const normalizeSubmissionType = (type = "") => (type === "incubatee" ? "enquiry" : type);

const normalizeLegalPage = (value, baseKey) => {
  if (!value || typeof value !== "object") {
    return value;
  }

  return {
    ...value,
    sections: ensureIds(value.sections, baseKey)
  };
};

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

const normalizeHomepageSection = (value) => {
  if (!value || typeof value !== "object") {
    return value;
  }

  const legacyTestimonials =
    Array.isArray(value.testimonials) && value.testimonials.length
      ? value.testimonials
      : (value.startupStories || []).map((story) => ({
          id: story.id,
          name: story.name || "",
          role: story.role || story.sector || "",
          quote: story.quote || story.highlight || ""
        }));

  return {
    ...value,
    stats: ensureIds(value.stats, "stat"),
    featuredPrograms: ensureIds(value.featuredPrograms, "program"),
    cta: {
      ...defaultHomepageCta,
      ...(value.cta || {})
    },
    testimonialsSection: {
      ...defaultTestimonialsSection,
      ...(value.testimonialsSection || {})
    },
    testimonials: ensureIds(legacyTestimonials, "testimonial"),
    timeline: ensureIds(value.timeline, "timeline")
  };
};

const normalizeFormsMeta = (value) => {
  const safeValue = value && typeof value === "object" ? value : {};
  const enquiryValue = safeValue.enquiry || safeValue.incubatee || {};

  return {
    apply: {
      ...defaultFormsMeta.apply,
      ...(safeValue.apply || {})
    },
    membership: {
      ...defaultFormsMeta.membership,
      ...(safeValue.membership || {})
    },
    enquiry: {
      ...defaultFormsMeta.enquiry,
      ...enquiryValue
    }
  };
};

const normalizePageHeroPanels = (value) => {
  const safeValue = value && typeof value === "object" ? value : {};

  return Object.fromEntries(
    Object.entries(defaultPageHeroPanels).map(([key, defaults]) => [
      key,
      {
        ...defaults,
        ...(safeValue[key] || {})
      }
    ])
  );
};

const normalizeSection = (section, value) => {
  if (section === "pageHeroPanels") {
    return normalizePageHeroPanels(value);
  }

  if (section === "homepage" && value && typeof value === "object") {
    return normalizeHomepageSection(value);
  }

  if (section === "team" && value && typeof value === "object") {
    return {
      ...value,
      leadershipContent: {
        ...defaultLeadershipContent,
        ...(value.leadershipContent || {})
      },
      boardOfDirectors: ensureIds(value.boardOfDirectors, "board"),
      advisoryBoard: ensureIds(value.advisoryBoard, "advisor"),
      coreTeam: ensureIds(value.coreTeam, "core")
    };
  }

  if (
    ["incubatees", "mentors", "services", "membershipPlans", "news", "events", "heroSlider", "gallery", "mediaCoverage"].includes(
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

  if (section === "legalPages" && value && typeof value === "object") {
    return {
      privacyPolicy: normalizeLegalPage(value.privacyPolicy, "privacy-section"),
      termsConditions: normalizeLegalPage(value.termsConditions, "terms-section"),
      refundPolicy: normalizeLegalPage(value.refundPolicy, "refund-section")
    };
  }

  if (section === "formsMeta") {
    return normalizeFormsMeta(value);
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
    homepage: normalizeHomepageSection(siteContent.homepage),
    pageHeroPanels: normalizePageHeroPanels(siteContent.pageHeroPanels),
    about: normalizeSection("about", siteContent.about),
    team: normalizeSection("team", siteContent.team),
    legalPages: normalizeSection("legalPages", siteContent.legalPages),
    formsMeta: normalizeFormsMeta(siteContent.formsMeta),
    heroSlider: Array.isArray(siteContent.heroSlider) ? siteContent.heroSlider : [],
    gallery: Array.isArray(siteContent.gallery) ? siteContent.gallery : [],
    mediaCoverage: Array.isArray(siteContent.mediaCoverage) ? siteContent.mediaCoverage : []
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
  const normalizedType = normalizeSubmissionType(type);

  if (!acceptedSubmissionTypes.has(type) || !submissionTypes.has(normalizedType)) {
    const error = new Error(`Unsupported form type "${type}".`);
    error.statusCode = 400;
    throw error;
  }

  const entry = {
    id: randomUUID(),
    type: normalizedType,
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

  const initial = {
    apply: [],
    membership: [],
    enquiry: []
  };

  return (Array.isArray(documents) ? documents : []).reduce((grouped, document) => {
    if (!document || typeof document !== "object") {
      return grouped;
    }

    const { _id, type, ...submission } = document;
    const bucketKey = submissionTypes.has(normalizeSubmissionType(type)) ? normalizeSubmissionType(type) : "apply";

    if (!Array.isArray(grouped[bucketKey])) {
      grouped[bucketKey] = [];
    }

    grouped[bucketKey].push(submission);
    return grouped;
  }, initial);
};

export const deleteSubmission = async (type, id) => {
  const normalizedType = normalizeSubmissionType(type);

  if (!submissionTypes.has(normalizedType)) {
    const error = new Error(`Unsupported submission type "${type}".`);
    error.statusCode = 400;
    throw error;
  }

  await getSubmissionsCollection().deleteOne({
    id,
    type: {
      $in: normalizedType === "enquiry" ? ["enquiry", "incubatee"] : [normalizedType]
    }
  });
  return getSubmissions();
};
