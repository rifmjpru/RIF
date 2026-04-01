import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../api/client.js";
import { buildPolicyContent } from "../components/PolicyPage.jsx";
import { useSiteData } from "../components/SiteDataProvider.jsx";
import { legalPageDefaults } from "../data/legalPages.js";
import { getByPath, setByPath } from "../utils/object-path.js";
import { formatDate, slugLabel } from "../utils/formatters.js";
import { resolveMediaUrl } from "../utils/media.js";

const SOCIAL_KEYS = ["linkedin", "twitter", "youtube", "facebook", "instagram"];

const adminTabs = [
  { id: "overview", label: "Overview" },
  { id: "site-settings", label: "Site Settings" },
  { id: "page-hero-panels", label: "Hero Panels" },
  { id: "homepage", label: "Homepage" },
  { id: "about", label: "About" },
  { id: "gallery", label: "Gallery" },
  { id: "team", label: "Leadership & Team" },
  { id: "incubatees", label: "Incubatees" },
  { id: "mentors", label: "Mentors" },
  { id: "services", label: "Services" },
  { id: "membership", label: "Membership" },
  { id: "rif-services", label: "RIF Services" },
  { id: "legal-pages", label: "Legal Pages" },
  { id: "news-events", label: "News & Events" },
  { id: "forms", label: "Forms" },
  { id: "submissions", label: "Submissions" }
];

const commonFormMetaFields = [
  { key: "title", label: "Title", span: 2 },
  { key: "intro", label: "Intro", type: "textarea", span: 2, rows: 4 },
  { key: "points", label: "Bullet Points", type: "array", span: 2, rows: 4 }
];

const formMetaLabels = {
  apply: "Apply",
  membership: "Membership",
  enquiry: "General Enquiry"
};

const formMetaFieldSets = {
  apply: [
    ...commonFormMetaFields,
    { key: "paymentAmount", label: "Form Fee (₹)", type: "number" }
  ],
  membership: [...commonFormMetaFields],
  incubatee: [
    ...commonFormMetaFields,
    { key: "paymentAmount", label: "Form Fee (₹)", type: "number" }
  ]
};

const createId = () => (crypto.randomUUID ? crypto.randomUUID() : `item-${Date.now()}`);
const ensureItemsHaveIds = (items = [], baseKey = "item") =>
  (items || []).map((item, index) =>
    item && typeof item === "object"
      ? {
          ...item,
          id: item.id || `${baseKey}-${index + 1}`
        }
      : item
  );

const buildBlankItem = (fields) =>
  fields.reduce(
    (draft, field) => ({
      ...draft,
      [field.key]: field.type === "array" ? [] : field.type === "select" ? field.options?.[0] || "" : ""
    }),
    { id: createId() }
  );

const createDefaultRifServicesData = (legacyItems = []) => ({
  pageEyebrow: "Our Services",
  pageTitle: "Custom IT solutions for your successful business",
  benefitsEyebrow: "Benefits",
  benefitsTitle: "Benefits to Choose RIF",
  benefits: [],
  otherServicesEyebrow: "Other Services",
  otherServicesTitle: "Custom IT solutions for your successful business",
  serviceTiles: (legacyItems || []).map((item) => ({
    id: item.id || createId(),
    title: item.title || "",
    description: item.description || "",
    iconUrl: item.imageUrl || "",
    iconAssetId: item.imageAssetId || "",
    iconAlt: item.title || "Service icon"
  })),
  supportCardTitle: "Call Us For Any Query",
  supportCardDescription: "Please connect with our team for guidance, support, and collaboration enquiries.",
  supportPhone: "+91 8979794345",
  eligibilityTitle: "Eligibility Criteria for Incubatees",
  eligibilityIntro:
    "Entrepreneurs and startups interested in applying for incubation at RIF should review the following criteria.",
  eligibilityPoints: [],
  screeningTitle: "Screening Process for Incubatees",
  screeningSteps: []
});

const normalizeEligibilityEntries = (items = []) =>
  (Array.isArray(items) ? items : [])
    .map((item, index) => {
      if (typeof item === "string") {
        return {
          id: `rif-eligibility-${index + 1}`,
          title: `Criteria ${index + 1}`,
          description: item
        };
      }

      if (item && typeof item === "object") {
        return {
          id: item.id || `rif-eligibility-${index + 1}`,
          title: item.title || `Criteria ${index + 1}`,
          description: item.description || ""
        };
      }

      return null;
    })
    .filter((item) => item?.description);

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

const normalizeHomepageData = (value) => {
  const safeValue = value && typeof value === "object" ? value : {};
  const legacyTestimonials =
    Array.isArray(safeValue.testimonials) && safeValue.testimonials.length
      ? safeValue.testimonials
      : (safeValue.startupStories || []).map((story) => ({
          id: story.id,
          name: story.name || "",
          role: story.role || story.sector || "",
          quote: story.quote || story.highlight || ""
        }));

  return {
    ...safeValue,
    stats: ensureItemsHaveIds(safeValue.stats, "stat"),
    featuredPrograms: ensureItemsHaveIds(safeValue.featuredPrograms, "program"),
    cta: {
      ...defaultHomepageCta,
      ...(safeValue.cta || {})
    },
    testimonialsSection: {
      ...defaultTestimonialsSection,
      ...(safeValue.testimonialsSection || {})
    },
    testimonials: ensureItemsHaveIds(legacyTestimonials, "testimonial"),
    timeline: ensureItemsHaveIds(safeValue.timeline, "timeline")
  };
};

const normalizeFormsMetaData = (value) => ({
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
    qrCodeAssetId: "",
    ...(value?.apply || {})
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
    qrCodeAssetId: "",
    ...(value?.membership || {})
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
    qrCodeAssetId: "",
    ...(value?.enquiry || value?.incubatee || {})
  }
});

const normalizeTeamData = (value) => ({
  ...(value || {}),
  leadershipContent: {
    ...defaultLeadershipContent,
    ...(value?.leadershipContent || {})
  },
  boardOfDirectors: ensureItemsHaveIds(value?.boardOfDirectors, "board"),
  advisoryBoard: ensureItemsHaveIds(value?.advisoryBoard, "advisor"),
  coreTeam: ensureItemsHaveIds(value?.coreTeam, "core")
});

const normalizeRifServicesData = (value) => {
  if (Array.isArray(value)) {
    return createDefaultRifServicesData(value);
  }

  if (!value || typeof value !== "object") {
    return createDefaultRifServicesData();
  }

  const defaults = createDefaultRifServicesData();
  return {
    ...defaults,
    ...value,
    benefits: ensureItemsHaveIds(value.benefits || [], "rif-benefit"),
    serviceTiles: ensureItemsHaveIds(value.serviceTiles || [], "rif-tile"),
    eligibilityPoints: normalizeEligibilityEntries(value.eligibilityPoints),
    screeningSteps: ensureItemsHaveIds(value.screeningSteps || [], "rif-step")
  };
};

const legalPageKeys = [
  { key: "privacyPolicy", label: "Privacy Policy" },
  { key: "termsConditions", label: "Terms & Conditions" },
  { key: "refundPolicy", label: "Refund Policy" }
];

const pageHeroPanelDefinitions = [
  { key: "about", label: "About Page" },
  { key: "leadership", label: "Leadership Page" },
  { key: "boardOfDirectors", label: "Board of Directors" },
  { key: "advisoryBoard", label: "Advisory Board" },
  { key: "coreTeam", label: "Core Team" },
  { key: "contact", label: "Contact Page" },
  { key: "services", label: "Services Page" },
  { key: "incubatees", label: "Incubatees Page" },
  { key: "mentors", label: "Mentors Page" },
  { key: "newsEvents", label: "News & Events" },
  { key: "testimonials", label: "Testimonials Page" },
  { key: "privacyPolicy", label: "Privacy Policy" },
  { key: "termsConditions", label: "Terms & Conditions" },
  { key: "refundPolicy", label: "Refund Policy" }
];

const createDefaultPageHeroPanel = (label) => ({
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
});

const defaultPageHeroPanels = Object.fromEntries(
  pageHeroPanelDefinitions.map((panel) => [panel.key, createDefaultPageHeroPanel(panel.label)])
);

const normalizeLegalPage = (value, baseKey) => {
  const defaults = buildPolicyContent();

  return {
    ...defaults,
    ...(value || {}),
    sections: ensureItemsHaveIds(value?.sections || [], baseKey).map((section) => ({
      ...section,
      heading: section?.heading || "",
      paragraphs: Array.isArray(section?.paragraphs) ? section.paragraphs : []
    }))
  };
};

const normalizeLegalPagesData = (value) => ({
  privacyPolicy: normalizeLegalPage(
    {
      ...legalPageDefaults.privacyPolicy,
      ...(value?.privacyPolicy || {})
    },
    "privacy-section"
  ),
  termsConditions: normalizeLegalPage(
    {
      ...legalPageDefaults.termsConditions,
      ...(value?.termsConditions || {})
    },
    "terms-section"
  ),
  refundPolicy: normalizeLegalPage(
    {
      ...legalPageDefaults.refundPolicy,
      ...(value?.refundPolicy || {})
    },
    "refund-section"
  )
});

const normalizePageHeroPanelsData = (value) =>
  Object.fromEntries(
    pageHeroPanelDefinitions.map((panel) => [
      panel.key,
      {
        ...defaultPageHeroPanels[panel.key],
        ...(value?.[panel.key] || {})
      }
    ])
  );

const buildBlankPolicySection = () => ({
  id: createId(),
  heading: "",
  paragraphs: []
});

const withProfileImageDefaults = (item) => ({
  ...item,
  imageUrl: item?.imageUrl || "",
  imageAssetId: item?.imageAssetId || ""
});

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getCropArea = ({ width, height, zoom, offsetX, offsetY, aspectRatio }) => {
  const safeZoom = clamp(Number(zoom) || 1, 1, 4);
  const ratio = Number(aspectRatio) > 0 ? Number(aspectRatio) : 1;
  const imageRatio = width / height;
  let baseWidth = width;
  let baseHeight = height;

  if (imageRatio > ratio) {
    baseWidth = height * ratio;
    baseHeight = height;
  } else {
    baseWidth = width;
    baseHeight = width / ratio;
  }

  const cropWidth = Math.floor(baseWidth / safeZoom);
  const cropHeight = Math.floor(baseHeight / safeZoom);
  const maxPanX = Math.max(0, (width - cropWidth) / 2);
  const maxPanY = Math.max(0, (height - cropHeight) / 2);
  const centerX = width / 2 + (clamp(Number(offsetX) || 0, -100, 100) / 100) * maxPanX;
  const centerY = height / 2 + (clamp(Number(offsetY) || 0, -100, 100) / 100) * maxPanY;

  return {
    x: clamp(Math.round(centerX - cropWidth / 2), 0, width - cropWidth),
    y: clamp(Math.round(centerY - cropHeight / 2), 0, height - cropHeight),
    width: cropWidth,
    height: cropHeight
  };
};

const drawCroppedCanvas = async ({ imageUrl, width, height, zoom, offsetX, offsetY, aspectRatio, outputWidth, outputHeight }) => {
  const image = await new Promise((resolve, reject) => {
    const nextImage = new Image();
    nextImage.onload = () => resolve(nextImage);
    nextImage.onerror = () => reject(new Error("Unable to process selected image."));
    nextImage.src = imageUrl;
  });

  const crop = getCropArea({ width, height, zoom, offsetX, offsetY, aspectRatio });
  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  const context = canvas.getContext("2d");
  context.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, outputWidth, outputHeight);

  return canvas;
};

const InputField = ({ field, value, onChange }) => {
  if (field.type === "social-links") {
    const keys = field.allowedKeys || SOCIAL_KEYS;
    const current = value && typeof value === "object" ? value : {};
    return (
      <div className="social-links-grid">
        {keys.map((key) => (
          <label className="field" key={key}>
            <span>{key[0].toUpperCase() + key.slice(1)}</span>
            <input
              type="url"
              value={current[key] || ""}
              placeholder={`https://${key}.com/...`}
              onChange={(event) =>
                onChange({
                  ...current,
                  [key]: event.target.value.trim()
                })
              }
            />
          </label>
        ))}
      </div>
    );
  }

  if (field.type === "json") {
    return (
      <textarea
        rows={field.rows || 4}
        value={value ? JSON.stringify(value, null, 2) : ""}
        onChange={(event) => {
          const text = event.target.value;
          try {
            const parsed = text ? JSON.parse(text) : {};
            const filtered =
              field.allowedKeys && typeof parsed === "object" && !Array.isArray(parsed)
                ? Object.fromEntries(
                    Object.entries(parsed).filter(([key]) => field.allowedKeys.includes(key))
                  )
                : parsed;
            onChange(filtered);
          } catch {
            onChange(text);
          }
        }}
      />
    );
  }

  if (field.type === "textarea") {
    return (
      <textarea
        rows={field.rows || 4}
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  if (field.type === "select") {
    return (
      <select value={value || ""} onChange={(event) => onChange(event.target.value)}>
        {(field.options || []).map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "array") {
    return (
      <textarea
        rows={field.rows || 4}
        value={(value || []).join("\n")}
        onChange={(event) =>
          onChange(
            event.target.value
              .split("\n")
              .map((item) => item.trim())
              .filter(Boolean)
          )
        }
      />
    );
  }

  return (
    <input
      type={field.type || "text"}
      value={value || ""}
      onChange={(event) => onChange(event.target.value)}
    />
  );
};

const ObjectEditor = ({ title, fields, value, onChange }) => (
  <section className="admin-panel">
    <div className="admin-panel-head">
      <h3>{title}</h3>
    </div>
    <div className="admin-form-grid">
      {fields.map((field) => (
        <label className={field.span === 2 ? "field field-span-2" : "field"} key={field.key}>
          <span>{field.label}</span>
          <InputField
            field={field}
            value={value?.[field.key]}
            onChange={(nextValue) =>
              onChange({
                ...value,
                [field.key]: nextValue
              })
            }
          />
        </label>
      ))}
    </div>
  </section>
);

const PageHeroPanelEditor = ({ title, value, onChange, onSelectImage, onRemoveImage, onSelectQrImage, onRemoveQrImage, uploading, qrUploading }) => (
  <section className="admin-panel">
    <div className="admin-panel-head">
      <div>
        <h3>{title}</h3>
        <p className="muted-copy">
          Controls the right-side hero panel shown on this public page. Upload an image cropped for the panel and
          update the copy below.
        </p>
      </div>
    </div>
    <div className="page-hero-panel-admin">
      <div className="page-hero-panel-admin-visual">
        <div className="page-hero-panel-admin-preview">
          {value?.imageUrl ? (
            <img
              alt={value.imageAlt || title}
              className="page-hero-panel-admin-image"
              src={resolveMediaUrl(value.imageUrl, value.imageAlt || title)}
            />
          ) : (
            <div className="page-hero-panel-admin-empty">No image uploaded yet</div>
          )}
        </div>
        <p className="detail-line">Recommended crop: portrait panel at 4:5 ratio.</p>
      </div>
      <div className="admin-section-stack">
        <div className="admin-form-grid">
          <label className="field">
            <span>Eyebrow</span>
            <input
              type="text"
              value={value?.eyebrow || ""}
              onChange={(event) => onChange({ ...value, eyebrow: event.target.value })}
            />
          </label>
          <label className="field field-span-2">
            <span>Panel Title</span>
            <textarea
              rows="3"
              value={value?.title || ""}
              onChange={(event) => onChange({ ...value, title: event.target.value })}
            />
          </label>
          <label className="field field-span-2">
            <span>Description</span>
            <textarea
              rows="4"
              value={value?.description || ""}
              onChange={(event) => onChange({ ...value, description: event.target.value })}
            />
          </label>
          <label className="field field-span-2">
            <span>Image Alt Text</span>
            <input
              type="text"
              value={value?.imageAlt || ""}
              onChange={(event) => onChange({ ...value, imageAlt: event.target.value })}
            />
          </label>
          <label className="field">
            <span>QR Eyebrow</span>
            <input
              type="text"
              value={value?.qrLabel || ""}
              onChange={(event) => onChange({ ...value, qrLabel: event.target.value })}
            />
          </label>
          <label className="field field-span-2">
            <span>QR Title</span>
            <input
              type="text"
              value={value?.qrTitle || ""}
              onChange={(event) => onChange({ ...value, qrTitle: event.target.value })}
            />
          </label>
          <label className="field field-span-2">
            <span>QR Note</span>
            <textarea
              rows="3"
              value={value?.qrNote || ""}
              onChange={(event) => onChange({ ...value, qrNote: event.target.value })}
            />
          </label>
          <label className="field field-span-2">
            <span>Upload Image</span>
            <input
              accept="image/*"
              type="file"
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (file) {
                  onSelectImage(file);
                }

                event.target.value = "";
              }}
              />
          </label>
          <label className="field field-span-2">
            <span>Upload QR Image</span>
            <input
              accept="image/*"
              type="file"
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (file) {
                  onSelectQrImage(file);
                }

                event.target.value = "";
              }}
            />
          </label>
        </div>
        <div className="page-hero-panel-admin-actions">
          <button className="button button-ghost button-small" onClick={onRemoveImage} type="button">
            Remove Image
          </button>
          <button className="button button-ghost button-small" onClick={onRemoveQrImage} type="button">
            Remove QR Image
          </button>
        </div>
        {uploading ? <p className="form-message">Uploading image...</p> : null}
        {qrUploading ? <p className="form-message">Uploading QR image...</p> : null}
        <div className="form-meta-qr-admin-grid">
          <div className="form-meta-qr-admin-preview">
            {value?.qrImageUrl ? (
              <img alt={value.qrTitle || "QR code"} className="form-meta-qr-admin-image" src={resolveMediaUrl(value.qrImageUrl, value.qrTitle || "QR code")} />
            ) : (
              <div className="form-meta-qr-admin-empty">Upload a QR image to show a contact QR block on the public page hero.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  </section>
);

const AdminDialog = ({ title, onClose, children, footer, size = "default" }) => (
  <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
    <div className={`admin-modal admin-modal-${size}`}>
      <div className="admin-modal-head">
        <h3>{title}</h3>
        <button className="button button-ghost button-small" onClick={onClose} type="button">
          Close
        </button>
      </div>
      <div className="admin-modal-body">{children}</div>
      {footer ? <div className="admin-modal-actions">{footer}</div> : null}
    </div>
  </div>
);

const AdminIndexedSections = ({ tabId, panels, openSections, onToggle, indexTitle = "Section Index" }) => {
  const activePanel = openSections[tabId] || panels[0]?.id || "";

  return (
    <div className="admin-section-stack">
      <section className="admin-panel">
        <div className="admin-panel-head">
          <h3>{indexTitle}</h3>
        </div>
        <div className="admin-index-grid">
          {panels.map((panel) => {
            const isActive = activePanel === panel.id;
            return (
              <button
                className={isActive ? "admin-index-button admin-index-button-active" : "admin-index-button"}
                key={panel.id}
                onClick={() => onToggle(tabId, panel.id)}
                type="button"
              >
                {panel.label}
              </button>
            );
          })}
        </div>
      </section>

      {panels.map((panel) => {
        const isOpen = activePanel === panel.id;
        return (
          <section className="admin-panel admin-collapsible-panel" key={panel.id}>
            <button className="admin-collapsible-trigger" onClick={() => onToggle(tabId, panel.id)} type="button">
              <span>{panel.label}</span>
              <span>{isOpen ? "-" : "+"}</span>
            </button>
            {isOpen ? <div className="admin-collapsible-body">{panel.content}</div> : null}
          </section>
        );
      })}
    </div>
  );
};

const InlineConfirmButton = ({
  label = "Remove",
  message = "Delete this item?",
  onConfirm,
  buttonClassName = "button button-ghost button-small",
  confirmLabel = "Delete"
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="inline-delete-wrap">
      <button className={buttonClassName} onClick={() => setOpen((current) => !current)} type="button">
        {label}
      </button>
      {open ? (
        <div className="inline-delete-confirm" role="alertdialog" aria-label={message}>
          <p>{message}</p>
          <div className="inline-delete-actions">
            <button className="button button-ghost button-small" onClick={() => setOpen(false)} type="button">
              Cancel
            </button>
            <button
              className="button button-small"
              onClick={() => {
                onConfirm?.();
                setOpen(false);
              }}
              type="button"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const CollectionEditor = ({ title, fields, items, onChange }) => {
  const safeItems = items || [];

  const updateItem = (itemId, fieldKey, nextValue) => {
    onChange(
      safeItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              [fieldKey]: nextValue
            }
          : item
      )
    );
  };

  const removeItem = (itemId) => {
    onChange(safeItems.filter((item) => item.id !== itemId));
  };

  const addItem = () => {
    onChange([...safeItems, buildBlankItem(fields)]);
  };

  return (
    <section className="admin-panel">
      <div className="admin-panel-head">
        <h3>{title}</h3>
        <button className="button button-small" onClick={addItem} type="button">
          Add Item
        </button>
      </div>
      <div className="admin-collection">
        {safeItems.map((item, index) => (
          <article className="admin-card" key={item.id || index}>
            <div className="admin-card-head">
              <strong>{item.title || item.name || `${title} ${index + 1}`}</strong>
              <InlineConfirmButton message={`Delete this item from ${title}?`} onConfirm={() => removeItem(item.id)} />
            </div>
            <div className="admin-form-grid">
              {fields.map((field) => (
                <label className={field.span === 2 ? "field field-span-2" : "field"} key={field.key}>
                  <span>{field.label}</span>
                  <InputField
                    field={field}
                    value={item[field.key]}
                    onChange={(nextValue) => updateItem(item.id, field.key, nextValue)}
                  />
                </label>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

const PolicySectionsEditor = ({ title, items, onChange }) => {
  const safeItems = items || [];

  const updateItem = (itemId, fieldKey, nextValue) => {
    onChange(
      safeItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              [fieldKey]: nextValue
            }
          : item
      )
    );
  };

  const addItem = () => {
    onChange([...safeItems, buildBlankPolicySection()]);
  };

  const removeItem = (itemId) => {
    onChange(safeItems.filter((item) => item.id !== itemId));
  };

  return (
    <section className="admin-panel">
      <div className="admin-panel-head">
        <h3>{title}</h3>
        <button className="button button-small" onClick={addItem} type="button">
          Add Section
        </button>
      </div>
      <div className="admin-collection">
        {safeItems.map((item, index) => (
          <article className="admin-card" key={item.id || index}>
            <div className="admin-card-head">
              <strong>{item.heading || `${title} ${index + 1}`}</strong>
              <InlineConfirmButton message="Delete this policy section?" onConfirm={() => removeItem(item.id)} />
            </div>
            <div className="admin-form-grid">
              <label className="field field-span-2">
                <span>Section Heading</span>
                <input
                  type="text"
                  value={item.heading || ""}
                  onChange={(event) => updateItem(item.id, "heading", event.target.value)}
                />
              </label>
              <label className="field field-span-2">
                <span>Paragraphs</span>
                <textarea
                  rows={6}
                  value={(item.paragraphs || []).join("\n")}
                  onChange={(event) =>
                    updateItem(
                      item.id,
                      "paragraphs",
                      event.target.value
                        .split("\n")
                        .map((paragraph) => paragraph.trim())
                        .filter(Boolean)
                    )
                  }
                />
              </label>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

const buildBlankDocument = () => ({
  id: createId(),
  title: "",
  type: "PDF",
  url: "",
  assetId: "",
  filename: ""
});

const buildBlankPillar = () => ({
  id: createId(),
  eyebrow: "RIF Strategic Pillar",
  title: "",
  description: "",
  imageUrl: "",
  imageAssetId: ""
});

const PillarsEditor = ({ items, onChange, onUploadImage, uploadingKey }) => {
  const safeItems = items || [];

  const updateItem = (itemId, fieldKey, nextValue) => {
    onChange(
      safeItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              [fieldKey]: nextValue
            }
          : item
      )
    );
  };

  const addItem = () => {
    onChange([...safeItems, buildBlankPillar()]);
  };

  const removeItem = (itemId) => {
    onChange(safeItems.filter((item) => item.id !== itemId));
  };

  const clearImage = (itemId) => {
    onChange(
      safeItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              imageUrl: "",
              imageAssetId: ""
            }
          : item
      )
    );
  };

  return (
    <section className="admin-panel">
      <div className="admin-panel-head">
        <h3>Leadership Pillars</h3>
        <button className="button button-small" onClick={addItem} type="button">
          Add Pillar
        </button>
      </div>
      <div className="admin-collection">
        {safeItems.map((item, index) => (
          <article className="admin-card" key={item.id || index}>
            <div className="admin-card-head">
              <strong>{item.title || `Pillar ${index + 1}`}</strong>
              <InlineConfirmButton message="Delete this pillar?" onConfirm={() => removeItem(item.id)} />
            </div>
            <div className="admin-form-grid">
              <label className="field">
                <span>Eyebrow</span>
                <input
                  type="text"
                  value={item.eyebrow || ""}
                  onChange={(event) => updateItem(item.id, "eyebrow", event.target.value)}
                />
              </label>
              <label className="field">
                <span>Pillar Title</span>
                <input
                  type="text"
                  value={item.title || ""}
                  onChange={(event) => updateItem(item.id, "title", event.target.value)}
                />
              </label>
              <label className="field field-span-2">
                <span>Description</span>
                <textarea
                  rows={4}
                  value={item.description || ""}
                  onChange={(event) => updateItem(item.id, "description", event.target.value)}
                />
              </label>
              <label className="field field-span-2">
                <span>Profile Photo</span>
                <input
                  accept="image/*"
                  type="file"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      onUploadImage(item.id, file);
                    }
                    event.target.value = "";
                  }}
                />
              </label>
            </div>
            <div className="admin-inline-actions">
              {item.imageUrl ? (
                <a className="text-link" href={item.imageUrl} rel="noreferrer" target="_blank">
                  Open Uploaded Image
                </a>
              ) : (
                <p className="muted-copy">No profile photo uploaded yet.</p>
              )}
              {uploadingKey === item.id ? <p className="form-message">Uploading image...</p> : null}
              <InlineConfirmButton
                confirmLabel="Remove"
                label="Remove Photo"
                message="Remove profile photo from this pillar?"
                onConfirm={() => clearImage(item.id)}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

const DocumentsEditor = ({ items, onChange, onUploadPdf, uploadingKey }) => {
  const safeItems = ensureItemsHaveIds(items || [], "document").map((item) => ({
    ...item,
    title: item?.title ?? "",
    type: item?.type ?? "PDF",
    url: item?.url ?? "",
    assetId: item?.assetId ?? "",
    filename: item?.filename ?? ""
  }));

  const updateItem = (itemId, fieldKey, nextValue) => {
    onChange(
      safeItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              [fieldKey]: nextValue
            }
          : item
      )
    );
  };

  const addItem = () => {
    onChange([...safeItems, buildBlankDocument()]);
  };

  const removeItem = (itemId) => {
    onChange(safeItems.filter((item) => item.id !== itemId));
  };

  const clearPdf = (itemId) => {
    onChange(
      safeItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              url: "",
              assetId: "",
              filename: ""
            }
          : item
      )
    );
  };

  return (
    <section className="admin-panel">
      <div className="admin-panel-head">
        <h3>Documents</h3>
        <button className="button button-small" onClick={addItem} type="button">
          Add Document
        </button>
      </div>
      <div className="admin-collection">
        {safeItems.map((item, index) => (
          <article className="admin-card" key={item.id || index}>
            <div className="admin-card-head">
              <strong>{item.title || `Document ${index + 1}`}</strong>
              <InlineConfirmButton message="Delete this document?" onConfirm={() => removeItem(item.id)} />
            </div>
            <div className="admin-form-grid">
              <label className="field">
                <span>Document Title</span>
                <input
                  type="text"
                  value={item.title || ""}
                  onChange={(event) => updateItem(item.id, "title", event.target.value)}
                />
              </label>
              <label className="field field-span-2">
                <span>PDF File Upload</span>
                <input
                  accept="application/pdf,.pdf"
                  type="file"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      onUploadPdf(item.id ?? index, file);
                    }
                    event.target.value = "";
                  }}
                />
              </label>
            </div>
            <div className="admin-inline-actions">
              {item.url ? (
                <a className="text-link" href={item.url} rel="noreferrer" target="_blank">
                  Open Uploaded PDF
                </a>
              ) : (
                <p className="muted-copy">No PDF uploaded yet.</p>
              )}
              {uploadingKey === String(item.id ?? index) ? <p className="form-message">Uploading PDF...</p> : null}
              <InlineConfirmButton
                confirmLabel="Remove"
                label="Remove PDF"
                message="Remove uploaded PDF from this document?"
                onConfirm={() => clearPdf(item.id)}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

const ProfileCollectionEditor = ({ title, fields, items, onChange, onSelectImage, uploadingKey, helper, renderExtras }) => {
  const safeItems = items || [];
  const [editingItemId, setEditingItemId] = useState("");
  const editingItem = safeItems.find((item) => item.id === editingItemId) || null;

  const updateItem = (itemId, fieldKey, nextValue) => {
    onChange(
      safeItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              [fieldKey]: nextValue
            }
          : item
      )
    );
  };

  const patchItem = (itemId, patch) => {
    onChange(
      safeItems.map((item) =>
        item.id === itemId
          ? typeof patch === "function"
            ? patch(item)
            : { ...item, ...patch }
          : item
      )
    );
  };

  const removeItem = (itemId) => {
    onChange(safeItems.filter((item) => item.id !== itemId));
    if (editingItemId === itemId) {
      setEditingItemId("");
    }
  };

  const clearImage = (itemId) => {
    onChange(
      safeItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              imageUrl: "",
              imageAssetId: ""
            }
          : item
      )
    );
  };

  const addItem = () => {
    onChange([...safeItems, withProfileImageDefaults(buildBlankItem(fields))]);
  };

  return (
    <section className="admin-panel">
      <div className="admin-panel-head">
        <div>
          <h3>{title}</h3>
          {helper ? <p className="muted-copy">{helper}</p> : null}
        </div>
        <button className="button button-small" onClick={addItem} type="button">
          Add Item
        </button>
      </div>
      <div className="admin-collection">
        {safeItems.map((item, index) => (
          <article className="admin-card profile-admin-card profile-admin-card-compact" key={item.id || index}>
            <div className="profile-admin-preview">
              <img
                alt={item.name || item.title || "Profile"}
                src={resolveMediaUrl(item.imageUrl, item.name || item.title || "Profile")}
              />
            </div>
            <div className="profile-admin-fields">
              <div className="admin-card-head">
                <strong>{item.title || item.name || `${title} ${index + 1}`}</strong>
                <p className="detail-line">{item.role || item.sector || item.stage || "No details added yet."}</p>
              </div>
              <div className="admin-inline-actions">
                <button className="button button-small" onClick={() => setEditingItemId(item.id)} type="button">
                  Edit
                </button>
                <InlineConfirmButton
                  message={`Delete this item from ${title}?`}
                  onConfirm={() => removeItem(item.id)}
                />
              </div>
              {uploadingKey === item.id ? <p className="form-message">Uploading image...</p> : null}
            </div>
          </article>
        ))}
      </div>
      {!safeItems.length ? <p className="muted-copy">No profiles added yet.</p> : null}
      {editingItem ? (
        <AdminDialog
          title={`Edit ${editingItem.title || editingItem.name || "Profile"}`}
          onClose={() => setEditingItemId("")}
        >
          <div className="admin-form-grid">
            {fields.map((field) => (
              <label className={field.span === 2 ? "field field-span-2" : "field"} key={field.key}>
                <span>{field.label}</span>
                <InputField
                  field={field}
                  value={editingItem[field.key]}
                  onChange={(nextValue) => updateItem(editingItem.id, field.key, nextValue)}
                />
              </label>
            ))}
            <label className="field field-span-2">
              <span>Profile Image (Crop to Square)</span>
              <input
                accept="image/*"
                type="file"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    onSelectImage(editingItem.id, file);
                  }
                  event.target.value = "";
                }}
              />
            </label>
          </div>
          <div className="profile-admin-actions">
            <InlineConfirmButton
              confirmLabel="Remove"
              label="Remove Image"
              message="Remove this profile image?"
              onConfirm={() => clearImage(editingItem.id)}
            />
          </div>
          {renderExtras
            ? renderExtras({
                item: editingItem,
                patchItem: (patch) => patchItem(editingItem.id, patch),
                updateField: (key, value) => updateItem(editingItem.id, key, value)
              })
            : null}
        </AdminDialog>
      ) : null}
    </section>
  );
};

const ImageCropDialog = ({ cropState, onClose, onConfirm }) => {
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [previewUrl, setPreviewUrl] = useState("");
  const [processing, setProcessing] = useState(false);
  const imageUrl = cropState?.imageUrl;
  const aspectRatio = cropState?.aspectRatio || 1;
  const previewWidth = aspectRatio < 1 ? 280 : aspectRatio > 1.4 ? 340 : 300;
  const previewHeight = Math.min(360, Math.max(160, Math.round(previewWidth / aspectRatio)));

  useEffect(() => {
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
  }, [cropState?.itemId, cropState?.section]);

  useEffect(() => {
    let cancelled = false;
    let generatedUrl = "";

    const renderPreview = async () => {
      if (!cropState || !imageUrl) {
        setPreviewUrl("");
        return;
      }

      try {
        const previewCanvas = await drawCroppedCanvas({
          imageUrl,
          width: cropState.width,
          height: cropState.height,
          zoom,
          offsetX,
          offsetY,
          aspectRatio,
          outputWidth: previewWidth,
          outputHeight: previewHeight
        });

        generatedUrl = previewCanvas.toDataURL("image/jpeg", 0.9);

        if (!cancelled) {
          setPreviewUrl(generatedUrl);
        }
      } catch {
        if (!cancelled) {
          setPreviewUrl("");
        }
      }
    };

    renderPreview();

    return () => {
      cancelled = true;
    };
  }, [aspectRatio, cropState, imageUrl, offsetX, offsetY, previewHeight, previewWidth, zoom]);

  const handleConfirm = async () => {
    if (!cropState || !imageUrl) {
      return;
    }

    try {
      setProcessing(true);
      const canvas = await drawCroppedCanvas({
        imageUrl,
        width: cropState.width,
        height: cropState.height,
        zoom,
        offsetX,
        offsetY,
        aspectRatio,
        outputWidth: cropState.outputWidth || 800,
        outputHeight: cropState.outputHeight || 800
      });

      const croppedBlob = await new Promise((resolve, reject) => {
        canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not crop image."))), "image/jpeg", 0.92);
      });

      const safeName = (cropState.file?.name || "profile-image").replace(/\.[^.]+$/, "");
      const croppedFile = new File([croppedBlob], `${safeName}-cropped.jpg`, { type: "image/jpeg" });
      await onConfirm(croppedFile);
    } finally {
      setProcessing(false);
    }
  };

  if (!cropState) {
    return null;
  }

  return (
    <div className="crop-modal-backdrop" role="dialog" aria-modal="true">
      <div className="crop-modal">
        <div className="crop-modal-head">
          <h3>{cropState?.dialogTitle || "Crop Image"}</h3>
          <button className="button button-ghost button-small" onClick={onClose} type="button">
            Close
          </button>
        </div>
        <p className="muted-copy">{cropState?.helperText || "Adjust zoom and position, then upload."}</p>
        <div className="crop-preview-wrap" style={{ aspectRatio: `${aspectRatio}` }}>
          {previewUrl ? <img alt="Cropped preview" className="crop-preview-image" src={previewUrl} /> : null}
        </div>
        <div className="admin-form-grid">
          <label className="field field-span-2">
            <span>Zoom</span>
            <input
              max="4"
              min="1"
              step="0.05"
              type="range"
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
            />
          </label>
          <label className="field">
            <span>Horizontal</span>
            <input
              max="100"
              min="-100"
              step="1"
              type="range"
              value={offsetX}
              onChange={(event) => setOffsetX(Number(event.target.value))}
            />
          </label>
          <label className="field">
            <span>Vertical</span>
            <input
              max="100"
              min="-100"
              step="1"
              type="range"
              value={offsetY}
              onChange={(event) => setOffsetY(Number(event.target.value))}
            />
          </label>
        </div>
        <div className="crop-modal-actions">
          <button className="button button-ghost" onClick={onClose} type="button">
            Cancel
          </button>
          <button className="button" disabled={processing} onClick={handleConfirm} type="button">
            {processing ? "Processing..." : "Crop and Upload"}
          </button>
        </div>
      </div>
    </div>
  );
};

const createMediaItem = ({ title, withFocalControls }) => ({
  id: createId(),
  title,
  imageUrl: "",
  imageAssetId: "",
  ...(withFocalControls
    ? {
        focusX: 50,
        focusY: 50
      }
    : {})
});

const MediaCollectionEditor = ({
  title,
  helper,
  items,
  onChange,
  onSelectImage,
  uploadingKey,
  addLabel,
  blankTitle,
  captionLabel = "Title",
  withFocalControls
}) => {
  const safeItems = items || [];

  const updateItem = (itemId, fieldKey, nextValue) => {
    onChange(
      safeItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              [fieldKey]: nextValue
            }
          : item
      )
    );
  };

  const removeItem = (itemId) => {
    onChange(safeItems.filter((item) => item.id !== itemId));
  };

  const addItem = () => {
    onChange([...safeItems, createMediaItem({ title: blankTitle, withFocalControls })]);
  };

  return (
    <section className="admin-panel">
      <div className="admin-panel-head">
        <div>
          <h3>{title}</h3>
          <p className="muted-copy">{helper}</p>
        </div>
        <button className="button button-small" onClick={addItem} type="button">
          {addLabel}
        </button>
      </div>
      <div className="gallery-admin-grid">
        {safeItems.map((item) => {
          const focusX = Math.min(Math.max(Number(item.focusX ?? 50), 0), 100);
          const focusY = Math.min(Math.max(Number(item.focusY ?? 50), 0), 100);

          return (
            <article className="gallery-admin-card" key={item.id}>
              <div className="gallery-admin-preview">
                <img
                  alt={item.altText || item.title}
                  src={resolveMediaUrl(item.imageUrl, item.title)}
                  style={withFocalControls ? { objectPosition: `${focusX}% ${focusY}%` } : undefined}
                />
                {withFocalControls ? (
                  <span
                    aria-hidden
                    className="gallery-admin-preview-focus"
                    style={{ left: `${focusX}%`, top: `${focusY}%` }}
                  />
                ) : null}
              </div>
            <div className="gallery-admin-fields">
              <div className="admin-card-head">
                <strong>{item.title || "Gallery Item"}</strong>
                <InlineConfirmButton message={`Delete this item from ${title}?`} onConfirm={() => removeItem(item.id)} />
              </div>
              <div className="admin-form-grid">
                <label className="field field-span-2">
                  <span>{captionLabel}</span>
                  <input
                    type="text"
                    value={item.title || ""}
                    onChange={(event) => updateItem(item.id, "title", event.target.value)}
                  />
                </label>
                {withFocalControls ? (
                  <>
                    <label className="field">
                      <span>Focus X (0-100)</span>
                      <input
                        max="100"
                        min="0"
                        step="1"
                        type="range"
                        value={focusX}
                        onChange={(event) => updateItem(item.id, "focusX", Number(event.target.value))}
                      />
                      <small className="focal-value">Current: {focusX}</small>
                    </label>
                    <label className="field">
                      <span>Focus Y (0-100)</span>
                      <input
                        max="100"
                        min="0"
                        step="1"
                        type="range"
                        value={focusY}
                        onChange={(event) => updateItem(item.id, "focusY", Number(event.target.value))}
                      />
                      <small className="focal-value">Current: {focusY}</small>
                    </label>
                  </>
                ) : null}
                <label className="field field-span-2">
                  <span>Upload Image</span>
                  <input
                    accept="image/*"
                    type="file"
                    onChange={(event) => {
                      const file = event.target.files?.[0];

                      if (file) {
                        onSelectImage(item.id, file);
                      }

                      event.target.value = "";
                    }}
                  />
                </label>
              </div>
              {uploadingKey === item.id ? <p className="form-message">Uploading image...</p> : null}
            </div>
          </article>
          );
        })}
      </div>
      {!safeItems.length ? <p className="muted-copy">No images added yet.</p> : null}
    </section>
  );
};

const createBlankRifServiceTile = () => ({
  id: createId(),
  title: "",
  description: "",
  iconUrl: "",
  iconAssetId: "",
  iconAlt: ""
});

const RifServiceTilesEditor = ({ items, onChange, onUploadIcon, uploadingKey }) => {
  const safeItems = items || [];

  const updateItem = (itemId, fieldKey, nextValue) => {
    onChange(
      safeItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              [fieldKey]: nextValue
            }
          : item
      )
    );
  };

  const removeItem = (itemId) => {
    onChange(safeItems.filter((item) => item.id !== itemId));
  };

  const addItem = () => {
    onChange([...safeItems, createBlankRifServiceTile()]);
  };

  return (
    <section className="admin-panel">
      <div className="admin-panel-head">
        <h3>Service Tiles</h3>
        <button className="button button-small" onClick={addItem} type="button">
          Add Tile
        </button>
      </div>
      <div className="gallery-admin-grid">
        {safeItems.map((item, index) => (
          <article className="gallery-admin-card" key={item.id || index}>
            <div className="gallery-admin-preview">
              <img alt={item.iconAlt || item.title || "Service icon"} src={resolveMediaUrl(item.iconUrl, item.title || "Service icon")} />
            </div>
            <div className="gallery-admin-fields">
              <div className="admin-card-head">
                <strong>{item.title || `Service Tile ${index + 1}`}</strong>
                <InlineConfirmButton message="Delete this service tile?" onConfirm={() => removeItem(item.id)} />
              </div>
              <div className="admin-form-grid">
                <label className="field field-span-2">
                  <span>Title</span>
                  <input type="text" value={item.title || ""} onChange={(event) => updateItem(item.id, "title", event.target.value)} />
                </label>
                <label className="field field-span-2">
                  <span>Description</span>
                  <textarea rows={3} value={item.description || ""} onChange={(event) => updateItem(item.id, "description", event.target.value)} />
                </label>
                <label className="field">
                  <span>Icon Alt Text</span>
                  <input type="text" value={item.iconAlt || ""} onChange={(event) => updateItem(item.id, "iconAlt", event.target.value)} />
                </label>
                <label className="field">
                  <span>Upload Icon</span>
                  <input
                    accept="image/*"
                    type="file"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        onUploadIcon(item.id, file);
                      }
                      event.target.value = "";
                    }}
                  />
                </label>
              </div>
              {uploadingKey === item.id ? <p className="form-message">Uploading icon...</p> : null}
            </div>
          </article>
        ))}
      </div>
      {!safeItems.length ? <p className="muted-copy">No service tiles added yet.</p> : null}
    </section>
  );
};

const SubmissionTable = ({ title, type, items, onDelete }) => {
  const [activeSubmissionId, setActiveSubmissionId] = useState("");
  const activeSubmission = items?.find((item) => item.id === activeSubmissionId) || null;

  return (
    <section className="admin-panel">
      <div className="admin-panel-head">
        <h3>{title}</h3>
        <span className="admin-count">{items?.length || 0} submissions</span>
      </div>
      {!items?.length ? (
        <p className="muted-copy">No submissions yet.</p>
      ) : (
        <div className="submission-table">
          {items.map((item) => (
            <article className="submission-row submission-row-compact" key={item.id}>
              <div>
                <strong>{item.name || item.founderName || item.ventureName}</strong>
                <p className="detail-line">{item.email}</p>
                <p className="detail-line">Submitted: {formatDate(item.submittedAt)}</p>
              </div>
              <div className="submission-actions">
                <button className="button button-small" onClick={() => setActiveSubmissionId(item.id)} type="button">
                  View Details
                </button>
                <InlineConfirmButton
                  buttonClassName="button button-ghost button-small"
                  message="Delete this submission permanently?"
                  onConfirm={() => onDelete(type, item.id)}
                />
              </div>
            </article>
          ))}
        </div>
      )}
      {activeSubmission ? (
        <AdminDialog
          title={`${title.replace("Submissions", "").trim()} Submission`}
          onClose={() => setActiveSubmissionId("")}
          footer={
            <>
              <button className="button button-ghost" onClick={() => setActiveSubmissionId("")} type="button">
                Close
              </button>
              <InlineConfirmButton
                buttonClassName="button button-small"
                message="Delete this submission permanently?"
                onConfirm={() => {
                  onDelete(type, activeSubmission.id);
                  setActiveSubmissionId("");
                }}
              />
            </>
          }
        >
          <div className="submission-payload">
            {Object.entries(activeSubmission)
              .filter(([key]) => !["id", "submittedAt"].includes(key))
              .map(([key, value]) => (
                <p key={key}>
                  <strong>{slugLabel(key)}:</strong> {Array.isArray(value) ? value.join(", ") : value}
                </p>
              ))}
          </div>
        </AdminDialog>
      ) : null}
    </section>
  );
};

export default function AdminDashboardPage() {
  const { siteData, setSiteData, authToken, setAuthToken, status, refreshSiteData } = useSiteData();
  const [activeTab, setActiveTab] = useState("overview");
  const [draftData, setDraftData] = useState(null);
  const [submissions, setSubmissions] = useState(null);
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [feedback, setFeedback] = useState("");
  const [loginError, setLoginError] = useState("");
  const [saving, setSaving] = useState("");
  const [uploadingTarget, setUploadingTarget] = useState("");
  const [cropState, setCropState] = useState(null);
  const [activeFormMetaKey, setActiveFormMetaKey] = useState("");
  const [galleryEditorMode, setGalleryEditorMode] = useState("heroSlider");
  const [openSections, setOpenSections] = useState({
    overview: "coverage",
    homepage: "announcement",
    "site-settings": "branding",
    "page-hero-panels": "about",
    about: "overview",
    team: "leadership-content",
    "rif-services": "header",
    "legal-pages": "privacy-policy",
    "news-events": "news",
    gallery: "gallery-index",
    forms: "form-content",
    submissions: "incoming-submissions"
  });

  const loadSubmissions = useCallback(async () => {
    if (!authToken) {
      setSubmissions(null);
      return;
    }

    try {
      const data = await api.getSubmissions(authToken);
      setSubmissions(data);
      setLoginError("");
    } catch (error) {
      setFeedback(`Could not load submissions. ${error.message}`);
    }
  }, [authToken]);

  useEffect(() => {
    if (siteData) {
      const baseData = structuredClone(siteData);
      const normalizedPillars = ensureItemsHaveIds(baseData?.about?.pillars, "pillar");
      const normalizedDocuments = ensureItemsHaveIds(baseData?.about?.documents, "document");
      setDraftData({
        heroSlider: [],
        gallery: [],
        ...baseData,
        homepage: normalizeHomepageData(baseData?.homepage),
        about: {
          ...(baseData?.about || {}),
          pillars: normalizedPillars,
          documents: normalizedDocuments
        },
        team: normalizeTeamData(baseData?.team),
        legalPages: normalizeLegalPagesData(baseData?.legalPages),
        pageHeroPanels: normalizePageHeroPanelsData(baseData?.pageHeroPanels),
        rifServices: normalizeRifServicesData(baseData?.rifServices),
        mediaCoverage: ensureItemsHaveIds(baseData?.mediaCoverage, "media-coverage"),
        formsMeta: normalizeFormsMetaData(baseData?.formsMeta)
      });
    }
  }, [siteData]);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  useEffect(() => {
    if (activeTab !== "submissions" || !authToken) {
      return;
    }

    loadSubmissions();
    const timer = setInterval(() => {
      loadSubmissions();
    }, 15000);

    return () => clearInterval(timer);
  }, [activeTab, authToken, loadSubmissions]);

  const totals = useMemo(
    () => ({
      programs: draftData?.homepage?.featuredPrograms?.length || 0,
      team: (draftData?.team?.boardOfDirectors?.length || 0) + (draftData?.team?.advisoryBoard?.length || 0) + (draftData?.team?.coreTeam?.length || 0),
      mentors: draftData?.mentors?.length || 0,
      incubatees: draftData?.incubatees?.length || 0,
      heroSlider: draftData?.heroSlider?.length || 0,
      gallery: draftData?.gallery?.length || 0
    }),
    [draftData]
  );

  const activeFormMetaValue = activeFormMetaKey ? getByPath(draftData, ["formsMeta", activeFormMetaKey]) : null;

  const updatePath = (path, value) => {
    setDraftData((current) => setByPath(current, path, value));
  };

  const toggleOpenSection = (tabId, sectionId) => {
    setOpenSections((current) => ({
      ...current,
      [tabId]: current[tabId] === sectionId ? "" : sectionId
    }));
  };

  const saveSection = async (section) => {
    try {
      setSaving(section);
      const result = await api.updateSection(section, draftData[section], authToken);
      setSiteData((current) => ({
        ...(current || {}),
        [section]: result.value
      }));
      setFeedback(`${slugLabel(section)} saved successfully.`);
    } catch (error) {
      setFeedback(error.message);
    } finally {
      setSaving("");
    }
  };

  const saveMultiple = async (sections) => {
    for (const section of sections) {
      await saveSection(section);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const result = await api.loginAdmin(credentials);
      setAuthToken(result.token);
      setLoginError("");
      setFeedback("Admin access granted.");
    } catch (error) {
      setLoginError(error.message);
    }
  };

  const handleDeleteSubmission = async (type, id) => {
    try {
      const result = await api.deleteSubmission(type, id, authToken);
      setSubmissions(result?.submissions || result);
    } catch (error) {
      setFeedback(error.message);
    }
  };

  const handleMediaUpload = async (section, itemId, file) => {
    try {
      setUploadingTarget(`${section}:${itemId}`);
      const uploadResult = await api.uploadImageAsset(file, authToken);
      const nextSectionValue = (draftData?.[section] || []).map((item) =>
        item.id === itemId
          ? {
              ...item,
              imageUrl: uploadResult.imageUrl,
              imageAssetId: uploadResult.assetId
            }
          : item
      );

      setDraftData((current) => ({
        ...current,
        [section]: nextSectionValue
      }));

      const savedResult = await api.updateSection(section, nextSectionValue, authToken);

      setDraftData((current) => ({
        ...current,
        [section]: savedResult.value
      }));
      setSiteData((current) => ({
        ...(current || {}),
        [section]: savedResult.value
      }));
      setFeedback(`${slugLabel(section)} image uploaded and saved.`);
    } catch (error) {
      setFeedback(error.message);
    } finally {
      setUploadingTarget("");
    }
  };

  const closeCropDialog = () => {
    if (cropState?.imageUrl) {
      URL.revokeObjectURL(cropState.imageUrl);
    }
    setCropState(null);
  };

  const openCropDialog = async (cropConfig) => {
    const { itemId, file } = cropConfig;

    if (!file?.type?.startsWith("image/")) {
      setFeedback("Please select a valid image file.");
      return;
    }

    let tempImageUrl = "";

    try {
      if (cropState?.imageUrl) {
        URL.revokeObjectURL(cropState.imageUrl);
      }

      tempImageUrl = URL.createObjectURL(file);
      const dimensions = await new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
        image.onerror = () => reject(new Error("Could not read the selected image."));
        image.src = tempImageUrl;
      });

      setCropState({
        ...cropConfig,
        itemId,
        file,
        imageUrl: tempImageUrl,
        width: dimensions.width,
        height: dimensions.height,
        aspectRatio: cropConfig.aspectRatio || 1,
        outputWidth: cropConfig.outputWidth || 800,
        outputHeight: cropConfig.outputHeight || 800
      });
      setFeedback("");
    } catch (error) {
      if (tempImageUrl) {
        URL.revokeObjectURL(tempImageUrl);
      }
      setFeedback(error.message);
    }
  };

  useEffect(
    () => () => {
      if (cropState?.imageUrl) {
        URL.revokeObjectURL(cropState.imageUrl);
      }
    },
    [cropState]
  );

  const handleProfileImageUpload = async (sectionPath, itemId, file, options = {}) => {
    const targetKey = options.targetKey || "imageUrl";
    const assetKey = options.assetKey || `${String(targetKey).replace(/Url$/, "")}AssetId`;
    const sectionKey = sectionPath.join(".");

    try {
      setUploadingTarget(`profile:${sectionKey}:${itemId}`);
      const uploadResult = await api.uploadImageAsset(file, authToken);
      const currentItems = getByPath(draftData, sectionPath) || [];
      const nextItems = currentItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              [targetKey]: uploadResult.imageUrl,
              [assetKey]: uploadResult.assetId
            }
          : item
      );

      updatePath(sectionPath, nextItems);
      setFeedback("Image uploaded. Click Save to publish this section.");
    } catch (error) {
      setFeedback(error.message);
    } finally {
      setUploadingTarget("");
    }
  };

  const handlePageHeroPanelImageUpload = async (panelKey, file) => {
    if (!file?.type?.startsWith("image/")) {
      setFeedback("Please upload a valid image file.");
      return;
    }

    try {
      setUploadingTarget(`pageHeroPanel:${panelKey}`);
      const uploadResult = await api.uploadImageAsset(file, authToken);
      const currentPanel = getByPath(draftData, ["pageHeroPanels", panelKey]) || defaultPageHeroPanels[panelKey];

      updatePath(["pageHeroPanels", panelKey], {
        ...currentPanel,
        imageUrl: uploadResult.imageUrl,
        imageAssetId: uploadResult.assetId
      });
      setFeedback("Hero panel image uploaded. Click Save Hero Panels to publish.");
    } catch (error) {
      setFeedback(error.message);
    } finally {
      setUploadingTarget("");
    }
  };

  const handlePageHeroPanelImageRemove = (panelKey) => {
    const currentPanel = getByPath(draftData, ["pageHeroPanels", panelKey]) || defaultPageHeroPanels[panelKey];

    updatePath(["pageHeroPanels", panelKey], {
      ...currentPanel,
      imageUrl: "",
      imageAssetId: ""
    });
    setFeedback("Hero panel image removed. Click Save Hero Panels to publish.");
  };

  const handlePageHeroPanelQrUpload = async (panelKey, file) => {
    if (!file?.type?.startsWith("image/")) {
      setFeedback("Please upload a valid QR image file.");
      return;
    }

    try {
      setUploadingTarget(`pageHeroPanelQr:${panelKey}`);
      const uploadResult = await api.uploadImageAsset(file, authToken);
      const currentPanel = getByPath(draftData, ["pageHeroPanels", panelKey]) || defaultPageHeroPanels[panelKey];

      updatePath(["pageHeroPanels", panelKey], {
        ...currentPanel,
        qrImageUrl: uploadResult.imageUrl,
        qrAssetId: uploadResult.assetId
      });
      setFeedback("Hero panel QR image uploaded. Click Save Hero Panels to publish.");
    } catch (error) {
      setFeedback(error.message);
    } finally {
      setUploadingTarget("");
    }
  };

  const handlePageHeroPanelQrRemove = (panelKey) => {
    const currentPanel = getByPath(draftData, ["pageHeroPanels", panelKey]) || defaultPageHeroPanels[panelKey];

    updatePath(["pageHeroPanels", panelKey], {
      ...currentPanel,
      qrImageUrl: "",
      qrAssetId: ""
    });
    setFeedback("Hero panel QR image removed. Click Save Hero Panels to publish.");
  };

  const handleFormMetaQrUpload = async (formKey, file) => {
    if (!file?.type?.startsWith("image/")) {
      setFeedback("Please upload a valid image file for the QR block.");
      return;
    }

    try {
      setUploadingTarget(`formMetaQr:${formKey}`);
      const uploadResult = await api.uploadImageAsset(file, authToken);
      const currentFormMeta = getByPath(draftData, ["formsMeta", formKey]) || {};

      updatePath(["formsMeta", formKey], {
        ...currentFormMeta,
        qrCodeImageUrl: uploadResult.imageUrl,
        qrCodeAssetId: uploadResult.assetId
      });
      setFeedback("QR image uploaded. Click Save Forms to publish.");
    } catch (error) {
      setFeedback(error.message);
    } finally {
      setUploadingTarget("");
    }
  };

  const handleFormMetaQrRemove = (formKey) => {
    const currentFormMeta = getByPath(draftData, ["formsMeta", formKey]) || {};

    updatePath(["formsMeta", formKey], {
      ...currentFormMeta,
      qrCodeImageUrl: "",
      qrCodeAssetId: ""
    });
    setFeedback("QR image removed. Click Save Forms to publish.");
  };

  const handleHomepageCtaQrUpload = async (file) => {
    if (!file?.type?.startsWith("image/")) {
      setFeedback("Please upload a valid image file for the homepage CTA QR block.");
      return;
    }

    try {
      setUploadingTarget("homepageCtaQr");
      const uploadResult = await api.uploadImageAsset(file, authToken);
      const currentCta = getByPath(draftData, ["homepage", "cta"]) || defaultHomepageCta;

      updatePath(["homepage", "cta"], {
        ...currentCta,
        qrImageUrl: uploadResult.imageUrl,
        qrAssetId: uploadResult.assetId
      });
      setFeedback("Homepage CTA QR image uploaded. Click Save Homepage to publish.");
    } catch (error) {
      setFeedback(error.message);
    } finally {
      setUploadingTarget("");
    }
  };

  const handleHomepageCtaQrRemove = () => {
    const currentCta = getByPath(draftData, ["homepage", "cta"]) || defaultHomepageCta;

    updatePath(["homepage", "cta"], {
      ...currentCta,
      qrImageUrl: "",
      qrAssetId: ""
    });
    setFeedback("Homepage CTA QR image removed. Click Save Homepage to publish.");
  };

  const handleAboutDocumentUpload = async (itemRef, file) => {
    const fileName = file?.name || "";
    const isPdf = file?.type === "application/pdf" || fileName.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setFeedback("Please upload a PDF document.");
      return;
    }

    try {
      setUploadingTarget(`about-document:${String(itemRef)}`);
      const uploadResult = await api.uploadDocumentAsset(file, authToken);
      setDraftData((current) => {
        const currentDocuments = getByPath(current, ["about", "documents"]) || [];
        const nextDocuments = currentDocuments.map((item) =>
          item.id === itemRef
            ? {
                ...item,
                title: item.title || uploadResult.filename?.replace(/\.pdf$/i, "") || item.title,
                type: "PDF",
                url: uploadResult.documentUrl,
                assetId: uploadResult.assetId,
                filename: uploadResult.filename
              }
            : item
        );
        const didMatch = nextDocuments.some((item) => item.id === itemRef && item.url);
        const fallbackDocuments =
          !didMatch && typeof itemRef === "number" && currentDocuments[itemRef]
            ? currentDocuments.map((item, index) =>
                index === itemRef
                  ? {
                      ...item,
                      title: item.title || uploadResult.filename?.replace(/\.pdf$/i, "") || item.title,
                      type: "PDF",
                      url: uploadResult.documentUrl,
                      assetId: uploadResult.assetId,
                      filename: uploadResult.filename
                    }
                  : item
              )
            : nextDocuments;

        return setByPath(current, ["about", "documents"], fallbackDocuments);
      });
      setFeedback("PDF uploaded successfully. Click Save About to publish.");
    } catch (error) {
      setFeedback(error.message);
    } finally {
      setUploadingTarget("");
    }
  };

  const handleAboutPillarImageUpload = async (itemId, file) => {
    if (!file?.type?.startsWith("image/")) {
      setFeedback("Please upload a valid image file.");
      return;
    }

    try {
      setUploadingTarget(`about-pillar:${itemId}`);
      const uploadResult = await api.uploadImageAsset(file, authToken);
      const currentPillars = draftData?.about?.pillars || [];
      const nextPillars = currentPillars.map((item) =>
        item.id === itemId
          ? {
              ...item,
              imageUrl: uploadResult.imageUrl,
              imageAssetId: uploadResult.assetId
            }
          : item
      );

      updatePath(["about", "pillars"], nextPillars);
      setFeedback("Leadership pillar image uploaded. Click Save to publish this section.");
    } catch (error) {
      setFeedback(error.message);
    } finally {
      setUploadingTarget("");
    }
  };

  const handleRifServiceIconUpload = async (itemId, file) => {
    if (!file?.type?.startsWith("image/")) {
      setFeedback("Please upload a valid image file.");
      return;
    }

    try {
      setUploadingTarget(`rif-service-icon:${itemId}`);
      const uploadResult = await api.uploadImageAsset(file, authToken);
      const currentTiles = getByPath(draftData, ["rifServices", "serviceTiles"]) || [];
      const nextTiles = currentTiles.map((item) =>
        item.id === itemId
          ? {
              ...item,
              iconUrl: uploadResult.imageUrl,
              iconAssetId: uploadResult.assetId
            }
          : item
      );

      updatePath(["rifServices", "serviceTiles"], nextTiles);
      setFeedback("Service icon uploaded. Click Save RIF Services to publish.");
    } catch (error) {
      setFeedback(error.message);
    } finally {
      setUploadingTarget("");
    }
  };

  const patchIncubatee = (itemId, updater) => {
    const nextItems = (draftData?.incubatees || []).map((item) =>
      item.id === itemId ? (typeof updater === "function" ? updater(item) : { ...item, ...updater }) : item
    );

    updatePath(["incubatees"], nextItems);
  };

  const handleIncubateeGalleryUpload = async (itemId, file) => {
    if (!file?.type?.startsWith("image/")) {
      setFeedback("Please upload a valid image file.");
      return;
    }

    try {
      setUploadingTarget(`incubatee-gallery:${itemId}`);
      const uploadResult = await api.uploadImageAsset(file, authToken);
      patchIncubatee(itemId, (item) => ({
        ...item,
        photoUrls: [...(item.photoUrls || []), uploadResult.imageUrl],
        photoAssetIds: [...(item.photoAssetIds || []), uploadResult.assetId]
      }));
      setFeedback("Gallery image uploaded. Click Save Incubatees to publish.");
    } catch (error) {
      setFeedback(error.message);
    } finally {
      setUploadingTarget("");
    }
  };

  const handleIncubateeGalleryRemove = (itemId, imageUrl) => {
    patchIncubatee(itemId, (item) => {
      const removeIndex = (item.photoUrls || []).findIndex((url) => url === imageUrl);
      return {
        ...item,
        photoUrls: (item.photoUrls || []).filter((url) => url !== imageUrl),
        photoAssetIds: Array.isArray(item.photoAssetIds)
          ? item.photoAssetIds.filter((_, index) => index !== removeIndex)
          : []
      };
    });
  };

  const handleCropConfirm = async (croppedFile) => {
    if (!cropState) {
      return;
    }

    const { sectionPath, section, itemId, mode, targetKey, assetKey } = cropState;
    closeCropDialog();

    if (mode === "media") {
      await handleMediaUpload(section, itemId, croppedFile);
      return;
    }

    if (mode === "pageHeroPanel") {
      await handlePageHeroPanelImageUpload(itemId, croppedFile);
      return;
    }

    await handleProfileImageUpload(sectionPath, itemId, croppedFile, { targetKey, assetKey });
  };

  if (!authToken) {
    return (
      <section className="admin-login-shell">
        <div className="admin-login-card">
          <p className="section-eyebrow">Admin Dashboard</p>
          <h1>Manage every deliverable from one place.</h1>
          <p>
            The dashboard updates homepage content, about information, teams, incubatees, mentors, services, plans,
            legal pages, forms, news, events, hero slides, gallery images, and incoming submissions.
          </p>
          <form autoComplete="off" className="admin-login-form" onSubmit={handleLogin}>
            <label className="field">
              <span>Username</span>
              <input
                type="text"
                autoComplete="off"
                value={credentials.username}
                onChange={(event) =>
                  setCredentials((current) => ({
                    ...current,
                    username: event.target.value
                  }))
                }
              />
            </label>
            <label className="field">
              <span>Password</span>
              <input
                type="password"
                autoComplete="off"
                value={credentials.password}
                onChange={(event) =>
                  setCredentials((current) => ({
                    ...current,
                    password: event.target.value
                  }))
                }
              />
            </label>
            <button className="button" type="submit">
              Login
            </button>
            {loginError ? <p className="form-message form-message-error">{loginError}</p> : null}
          </form>
          <p className="detail-line">Use backend `.env` credentials before going live.</p>
        </div>
      </section>
    );
  }

  if (status === "loading" || !draftData) {
    return (
      <section className="section">
        <div className="empty-state">
          <h1>Loading dashboard data...</h1>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-shell">
      <aside className="admin-sidebar">
        <div>
          <p className="section-eyebrow">Dashboard</p>
          <h2>RIF CMS</h2>
          <p className="muted-copy">Public site + admin content layers are connected through the Express API.</p>
        </div>
        <nav className="admin-tab-list">
          {adminTabs.map((tab) => (
            <button
              className={activeTab === tab.id ? "admin-tab admin-tab-active" : "admin-tab"}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <button className="button button-ghost" onClick={() => setAuthToken("")} type="button">
          Logout
        </button>
      </aside>

      <div className="admin-main">
        <header className="admin-main-header">
          <div>
            <p className="section-eyebrow">Manage Content</p>
            <h1>{adminTabs.find((tab) => tab.id === activeTab)?.label}</h1>
          </div>
          <div className="admin-header-actions">
            <button className="button button-ghost" onClick={refreshSiteData} type="button">
              Refresh
            </button>
          </div>
        </header>
        {feedback ? <p className="status-banner">{feedback}</p> : null}

        {activeTab === "overview" ? (
          <div className="admin-section-stack">
            <section className="admin-panel">
              <div className="stats-grid">
                <article className="stat-card">
                  <strong>{totals.programs}</strong>
                  <span>Programs</span>
                </article>
                <article className="stat-card">
                  <strong>{totals.team}</strong>
                  <span>Team entries</span>
                </article>
                <article className="stat-card">
                  <strong>{totals.mentors}</strong>
                  <span>Mentors</span>
                </article>
                <article className="stat-card">
                  <strong>{totals.incubatees}</strong>
                  <span>Incubatees</span>
                </article>
                <article className="stat-card">
                  <strong>{totals.heroSlider}</strong>
                  <span>Hero slides</span>
                </article>
                <article className="stat-card">
                  <strong>{totals.gallery}</strong>
                  <span>Gallery items</span>
                </article>
              </div>
            </section>
            <section className="admin-panel">
              <h3>What this admin covers</h3>
              <ul className="bullet-list">
                <li>Homepage hero, stats, programs, testimonials, timeline, and CTA.</li>
                <li>Editable right-side hero panels for About, Leadership, Team, Contact, Services, News, Testimonials, and legal pages.</li>
                <li>About page overview and documents.</li>
                <li>Leadership page content, leadership pillars, teams, incubatees, mentors, services, memberships, RIF services, legal pages, news, events, hero slides, and gallery.</li>
                <li>Apply, membership, and general enquiry form copy plus incoming submission management.</li>
              </ul>
            </section>
          </div>
        ) : null}

        {activeTab === "homepage" ? (
          <div className="admin-section-stack">
            <AdminIndexedSections
              tabId="homepage"
              openSections={openSections}
              onToggle={toggleOpenSection}
              panels={[
                {
                  id: "announcement",
                  label: "Announcement",
                  content: (
                    <ObjectEditor
                      fields={[{ key: "announcement", label: "Announcement", type: "textarea", span: 2, rows: 3 }]}
                      onChange={(nextValue) => updatePath(["homepage"], { ...draftData.homepage, ...nextValue })}
                      title="Announcement"
                      value={{ announcement: draftData.homepage.announcement }}
                    />
                  )
                },
                {
                  id: "hero",
                  label: "Hero",
                  content: (
                    <ObjectEditor
                      fields={[
                        { key: "eyebrow", label: "Eyebrow" },
                        { key: "title", label: "Hero Title", type: "textarea", span: 2, rows: 3 },
                        { key: "description", label: "Description", type: "textarea", span: 2, rows: 5 },
                        { key: "primaryCtaLabel", label: "Primary CTA Label" },
                        { key: "primaryCtaLink", label: "Primary CTA Link" },
                        { key: "secondaryCtaLabel", label: "Secondary CTA Label" },
                        { key: "secondaryCtaLink", label: "Secondary CTA Link" }
                      ]}
                      onChange={(nextValue) => updatePath(["homepage", "hero"], nextValue)}
                      title="Hero"
                      value={draftData.homepage.hero}
                    />
                  )
                },
                {
                  id: "stats",
                  label: "Stats",
                  content: (
                    <CollectionEditor
                      fields={[
                        { key: "label", label: "Label" },
                        { key: "value", label: "Value" }
                      ]}
                      items={draftData.homepage.stats}
                      onChange={(nextValue) => updatePath(["homepage", "stats"], nextValue)}
                      title="Stats"
                    />
                  )
                },
                {
                  id: "focus-partners",
                  label: "Focus Areas & Partners",
                  content: (
                    <ObjectEditor
                      fields={[
                        { key: "focusAreas", label: "Focus Areas", type: "array", span: 2, rows: 5 },
                        { key: "partnerLogos", label: "Partner Logos", type: "array", span: 2, rows: 4 }
                      ]}
                      onChange={(nextValue) => updatePath(["homepage"], { ...draftData.homepage, ...nextValue })}
                      title="Focus Areas and Partners"
                      value={draftData.homepage}
                    />
                  )
                },
                {
                  id: "featured-programs",
                  label: "Featured Programs",
                  content: (
                    <CollectionEditor
                      fields={[
                        { key: "title", label: "Program Title" },
                        { key: "stage", label: "Stage" },
                        { key: "mode", label: "Mode" },
                        { key: "description", label: "Description", type: "textarea", span: 2, rows: 4 }
                      ]}
                      items={draftData.homepage.featuredPrograms}
                      onChange={(nextValue) => updatePath(["homepage", "featuredPrograms"], nextValue)}
                      title="Featured Programs"
                    />
                  )
                },
                {
                  id: "testimonials-section",
                  label: "Testimonials Section",
                  content: (
                    <ObjectEditor
                      fields={[
                        { key: "eyebrow", label: "Section Eyebrow" },
                        { key: "title", label: "Section Title", type: "textarea", span: 2, rows: 3 },
                        { key: "description", label: "Section Description", type: "textarea", span: 2, rows: 4 },
                        { key: "previewCount", label: "Homepage Preview Count", type: "number" },
                        { key: "ctaLabel", label: "View More Button Label" },
                        { key: "ctaLink", label: "View More Button Link" },
                        { key: "pageEyebrow", label: "Testimonials Page Eyebrow" },
                        { key: "pageTitle", label: "Testimonials Page Title", type: "textarea", span: 2, rows: 3 },
                        { key: "pageDescription", label: "Testimonials Page Description", type: "textarea", span: 2, rows: 4 }
                      ]}
                      onChange={(nextValue) => updatePath(["homepage", "testimonialsSection"], nextValue)}
                      title="Testimonials Section"
                      value={draftData.homepage.testimonialsSection}
                    />
                  )
                },
                {
                  id: "testimonials",
                  label: "Testimonials",
                  content: (
                    <CollectionEditor
                      fields={[
                        { key: "name", label: "Name" },
                        { key: "role", label: "Role / Organization" },
                        { key: "quote", label: "Testimonial", type: "textarea", span: 2, rows: 4 }
                      ]}
                      items={draftData.homepage.testimonials}
                      onChange={(nextValue) => updatePath(["homepage", "testimonials"], nextValue)}
                      title="Testimonials"
                    />
                  )
                },
                {
                  id: "timeline",
                  label: "Timeline",
                  content: (
                    <CollectionEditor
                      fields={[
                        { key: "title", label: "Timeline Step" },
                        { key: "description", label: "Description", type: "textarea", span: 2, rows: 4 }
                      ]}
                      items={draftData.homepage.timeline}
                      onChange={(nextValue) => updatePath(["homepage", "timeline"], nextValue)}
                      title="Timeline"
                    />
                  )
                },
                {
                  id: "cta",
                  label: "CTA Section",
                  content: (
                    <div className="admin-section-stack">
                      <ObjectEditor
                        fields={[
                          { key: "title", label: "CTA Title", type: "textarea", span: 2, rows: 3 },
                          { key: "description", label: "CTA Description", type: "textarea", span: 2, rows: 4 },
                          { key: "primaryLabel", label: "Primary Label" },
                          { key: "primaryLink", label: "Primary Link" },
                          { key: "secondaryLabel", label: "Secondary Label" },
                          { key: "secondaryLink", label: "Secondary Link" },
                          { key: "qrLabel", label: "QR Eyebrow" },
                          { key: "qrTitle", label: "QR Title", span: 2 },
                          { key: "qrNote", label: "QR Note", type: "textarea", span: 2, rows: 3 }
                        ]}
                        onChange={(nextValue) => updatePath(["homepage", "cta"], nextValue)}
                        title="CTA Section"
                        value={draftData.homepage.cta}
                      />
                      <section className="admin-panel form-meta-qr-admin">
                        <div className="admin-panel-head">
                          <div>
                            <h3>CTA QR Block</h3>
                            <p className="muted-copy">Upload a square QR image for the homepage CTA panel or leave it blank to hide the QR block.</p>
                          </div>
                        </div>
                        <div className="form-meta-qr-admin-grid">
                          <div className="form-meta-qr-admin-preview">
                            {draftData.homepage.cta?.qrImageUrl ? (
                              <img
                                alt={draftData.homepage.cta?.qrTitle || "Homepage CTA QR"}
                                className="form-meta-qr-admin-image"
                                src={resolveMediaUrl(draftData.homepage.cta.qrImageUrl, draftData.homepage.cta?.qrTitle || "Homepage CTA QR")}
                              />
                            ) : (
                              <div className="form-meta-qr-admin-empty">No QR image uploaded yet. The public QR block stays hidden until you add one or a title.</div>
                            )}
                          </div>
                          <div className="admin-section-stack">
                            <label className="field">
                              <span>Upload QR Image</span>
                              <input
                                accept="image/*"
                                type="file"
                                onChange={(event) => {
                                  const file = event.target.files?.[0];

                                  if (file) {
                                    handleHomepageCtaQrUpload(file);
                                  }

                                  event.target.value = "";
                                }}
                              />
                            </label>
                            <div className="page-hero-panel-admin-actions">
                              <button className="button button-ghost button-small" onClick={handleHomepageCtaQrRemove} type="button">
                                Remove QR Image
                              </button>
                            </div>
                            {uploadingTarget === "homepageCtaQr" ? <p className="form-message">Uploading QR image...</p> : null}
                          </div>
                        </div>
                      </section>
                    </div>
                  )
                }
              ]}
            />
            <button className="button" disabled={saving === "homepage"} onClick={() => saveSection("homepage")} type="button">
              {saving === "homepage" ? "Saving..." : "Save Homepage"}
            </button>
          </div>
        ) : null}

        {activeTab === "site-settings" ? (
          <div className="admin-section-stack">
            <AdminIndexedSections
              tabId="site-settings"
              openSections={openSections}
              onToggle={toggleOpenSection}
              panels={[
                {
                  id: "branding",
                  label: "Institution Details",
                  content: (
                    <ObjectEditor
                      fields={[
                        { key: "name", label: "Short Name" },
                        { key: "fullName", label: "Full Name", span: 2 },
                        { key: "tagline", label: "Tagline", type: "textarea", span: 2, rows: 3 },
                        { key: "location", label: "Location", span: 2 },
                        { key: "contactEmail", label: "Contact Email", type: "email" },
                        { key: "contactPhone", label: "Contact Phone" },
                        { key: "footerNote", label: "Footer Note", type: "textarea", span: 2, rows: 3 }
                      ]}
                      onChange={(nextValue) => updatePath(["siteSettings"], { ...draftData.siteSettings, ...nextValue })}
                      title="Institution Details"
                      value={draftData.siteSettings}
                    />
                  )
                },
                {
                  id: "social-links",
                  label: "Social Links",
                  content: (
                    <ObjectEditor
                      fields={[
                        { key: "linkedin", label: "LinkedIn URL", type: "url", span: 2 },
                        { key: "youtube", label: "YouTube URL", type: "url", span: 2 },
                        { key: "instagram", label: "Instagram URL", type: "url", span: 2 }
                      ]}
                      onChange={(nextValue) => updatePath(["siteSettings", "socialLinks"], nextValue)}
                      title="Social Links"
                      value={draftData.siteSettings.socialLinks}
                    />
                  )
                }
              ]}
            />
            <button
              className="button"
              disabled={saving === "siteSettings"}
              onClick={() => saveSection("siteSettings")}
              type="button"
            >
              {saving === "siteSettings" ? "Saving..." : "Save Site Settings"}
            </button>
          </div>
        ) : null}

        {activeTab === "page-hero-panels" ? (
          <div className="admin-section-stack">
            <AdminIndexedSections
              tabId="page-hero-panels"
              openSections={openSections}
              onToggle={toggleOpenSection}
              panels={pageHeroPanelDefinitions.map((panel) => ({
                id: panel.key.replace(/([A-Z])/g, "-$1").toLowerCase(),
                label: panel.label,
                content: (
                  <PageHeroPanelEditor
                    onChange={(nextValue) => updatePath(["pageHeroPanels", panel.key], nextValue)}
                    onRemoveImage={() => handlePageHeroPanelImageRemove(panel.key)}
                    onRemoveQrImage={() => handlePageHeroPanelQrRemove(panel.key)}
                    onSelectImage={(file) =>
                      openCropDialog({
                        mode: "pageHeroPanel",
                        itemId: panel.key,
                        file,
                        aspectRatio: 4 / 5,
                        outputWidth: 900,
                        outputHeight: 1125,
                        helperText: "Crop this image for the right-side hero panel (4:5 portrait)."
                      })
                    }
                    onSelectQrImage={(file) => handlePageHeroPanelQrUpload(panel.key, file)}
                    qrUploading={uploadingTarget === `pageHeroPanelQr:${panel.key}`}
                    title={panel.label}
                    uploading={uploadingTarget === `pageHeroPanel:${panel.key}`}
                    value={draftData.pageHeroPanels?.[panel.key] || defaultPageHeroPanels[panel.key]}
                  />
                )
              }))}
            />
            <button
              className="button"
              disabled={saving === "pageHeroPanels"}
              onClick={() => saveSection("pageHeroPanels")}
              type="button"
            >
              {saving === "pageHeroPanels" ? "Saving..." : "Save Hero Panels"}
            </button>
          </div>
        ) : null}

        {activeTab === "about" ? (
          <div className="admin-section-stack">
            <AdminIndexedSections
              tabId="about"
              openSections={openSections}
              onToggle={toggleOpenSection}
              panels={[
                {
                  id: "overview",
                  label: "Overview",
                  content: (
                    <ObjectEditor
                      fields={[
                        { key: "title", label: "Title" },
                        { key: "body", label: "Body", type: "textarea", span: 2, rows: 5 },
                        { key: "mission", label: "Mission", type: "textarea", span: 2, rows: 3 },
                        { key: "vision", label: "Vision", type: "textarea", span: 2, rows: 3 }
                      ]}
                      onChange={(nextValue) => updatePath(["about", "overview"], nextValue)}
                      title="Overview"
                      value={draftData.about.overview}
                    />
                  )
                },
                {
                  id: "documents",
                  label: "Documents",
                  content: (
                    <DocumentsEditor
                      items={draftData.about.documents}
                      onUploadPdf={handleAboutDocumentUpload}
                      onChange={(nextValue) => updatePath(["about", "documents"], nextValue)}
                      uploadingKey={
                        uploadingTarget.startsWith("about-document:") ? uploadingTarget.replace("about-document:", "") : ""
                      }
                    />
                  )
                }
              ]}
            />
            <button className="button" disabled={saving === "about"} onClick={() => saveSection("about")} type="button">
              {saving === "about" ? "Saving..." : "Save About"}
            </button>
          </div>
        ) : null}

        {activeTab === "team" ? (
          <div className="admin-section-stack">
            <AdminIndexedSections
              tabId="team"
              openSections={openSections}
              onToggle={toggleOpenSection}
              panels={[
                {
                  id: "leadership-content",
                  label: "Leadership Page Content",
                  content: (
                    <ObjectEditor
                      fields={[
                        { key: "eyebrow", label: "Leadership Eyebrow" },
                        { key: "title", label: "Leadership Page Title", type: "textarea", span: 2, rows: 3 },
                        { key: "description", label: "Leadership Page Description", type: "textarea", span: 2, rows: 4 },
                        { key: "primaryCtaLabel", label: "Primary CTA Label" },
                        { key: "primaryCtaLink", label: "Primary CTA Link" },
                        { key: "secondaryCtaLabel", label: "Secondary CTA Label" },
                        { key: "secondaryCtaLink", label: "Secondary CTA Link" },
                        { key: "pillarsEyebrow", label: "Pillars Eyebrow" },
                        { key: "pillarsTitle", label: "Pillars Title", type: "textarea", span: 2, rows: 3 },
                        { key: "pillarsDescription", label: "Pillars Description", type: "textarea", span: 2, rows: 4 }
                      ]}
                      onChange={(nextValue) => updatePath(["team", "leadershipContent"], nextValue)}
                      title="Leadership Page Content"
                      value={draftData.team.leadershipContent}
                    />
                  )
                },
                {
                  id: "leadership-pillars",
                  label: "Leadership Pillars",
                  content: (
                    <PillarsEditor
                      items={draftData.about.pillars}
                      onUploadImage={handleAboutPillarImageUpload}
                      onChange={(nextValue) => updatePath(["about", "pillars"], nextValue)}
                      uploadingKey={uploadingTarget.startsWith("about-pillar:") ? uploadingTarget.replace("about-pillar:", "") : ""}
                    />
                  )
                },
                {
                  id: "board-of-directors",
                  label: "Board of Directors",
                  content: (
                    <ProfileCollectionEditor
                      fields={[
                        { key: "name", label: "Name" },
                        { key: "role", label: "Role" },
                        { key: "bio", label: "Bio", type: "textarea", span: 2, rows: 4 }
                      ]}
                      helper="Upload and crop profile photos for director cards."
                      items={(draftData.team.boardOfDirectors || []).map(withProfileImageDefaults)}
                      onSelectImage={(itemId, file) =>
                        openCropDialog({
                          mode: "profile",
                          sectionPath: ["team", "boardOfDirectors"],
                          itemId,
                          file,
                          aspectRatio: 1,
                          outputWidth: 800,
                          outputHeight: 800,
                          helperText: "Adjust zoom and position, then upload a square profile image."
                        })
                      }
                      onChange={(nextValue) => updatePath(["team", "boardOfDirectors"], nextValue)}
                      title="Board of Directors"
                      uploadingKey={
                        uploadingTarget.startsWith("profile:team.boardOfDirectors:")
                          ? uploadingTarget.replace("profile:team.boardOfDirectors:", "")
                          : ""
                      }
                    />
                  )
                },
                {
                  id: "advisory-board",
                  label: "Advisory Board",
                  content: (
                    <ProfileCollectionEditor
                      fields={[
                        { key: "name", label: "Name" },
                        { key: "role", label: "Role" },
                        { key: "bio", label: "Bio", type: "textarea", span: 2, rows: 4 }
                      ]}
                      helper="Upload and crop profile photos for advisory members."
                      items={(draftData.team.advisoryBoard || []).map(withProfileImageDefaults)}
                      onSelectImage={(itemId, file) =>
                        openCropDialog({
                          mode: "profile",
                          sectionPath: ["team", "advisoryBoard"],
                          itemId,
                          file,
                          aspectRatio: 1,
                          outputWidth: 800,
                          outputHeight: 800,
                          helperText: "Adjust zoom and position, then upload a square profile image."
                        })
                      }
                      onChange={(nextValue) => updatePath(["team", "advisoryBoard"], nextValue)}
                      title="Advisory Board"
                      uploadingKey={
                        uploadingTarget.startsWith("profile:team.advisoryBoard:")
                          ? uploadingTarget.replace("profile:team.advisoryBoard:", "")
                          : ""
                      }
                    />
                  )
                },
                {
                  id: "core-team",
                  label: "Core Team",
                  content: (
                    <ProfileCollectionEditor
                      fields={[
                        { key: "name", label: "Name" },
                        { key: "role", label: "Role" },
                        { key: "bio", label: "Bio", type: "textarea", span: 2, rows: 4 }
                      ]}
                      helper="Upload and crop profile photos for core team members."
                      items={(draftData.team.coreTeam || []).map(withProfileImageDefaults)}
                      onSelectImage={(itemId, file) =>
                        openCropDialog({
                          mode: "profile",
                          sectionPath: ["team", "coreTeam"],
                          itemId,
                          file,
                          aspectRatio: 1,
                          outputWidth: 800,
                          outputHeight: 800,
                          helperText: "Adjust zoom and position, then upload a square profile image."
                        })
                      }
                      onChange={(nextValue) => updatePath(["team", "coreTeam"], nextValue)}
                      title="Core Team"
                      uploadingKey={
                        uploadingTarget.startsWith("profile:team.coreTeam:")
                          ? uploadingTarget.replace("profile:team.coreTeam:", "")
                          : ""
                      }
                    />
                  )
                }
              ]}
            />
            <button className="button" disabled={saving === "team" || saving === "about"} onClick={() => saveMultiple(["team", "about"])} type="button">
              {saving === "team" || saving === "about" ? "Saving..." : "Save Leadership & Team"}
            </button>
          </div>
        ) : null}

        {activeTab === "incubatees" ? (
          <div className="admin-section-stack">
            <ProfileCollectionEditor
              
              fields={[
                { key: "name", label: "Venture Name" },
                { key: "tagline", label: "Tagline / Role" },
                { key: "sector", label: "Sector" },
                { key: "stage", label: "Stage" },
                { key: "founder", label: "Founder & CEO" },
                { key: "location", label: "Location" },
                { key: "summary", label: "Summary", type: "textarea", span: 2, rows: 3 },
                { key: "description", label: "Full Description", type: "textarea", span: 2, rows: 5 },
                { key: "establishmentYear", label: "Establishment Year" },
                { key: "objectives", label: "Objectives of the Start-up", type: "textarea", span: 2, rows: 4 },
                { key: "directors", label: "Directors / Team" },
                { key: "email", label: "Email" },
                { key: "phone", label: "Mobile" },
                { key: "website", label: "Website", type: "url" },
                { key: "photoUrls", label: "Photo Gallery URLs (one per line)", type: "array", span: 2, rows: 4 },
                {
                  key: "socialLinks",
                  label: "Social Links",
                  type: "social-links",
                  allowedKeys: SOCIAL_KEYS,
                  span: 2
                }
              ]}
              helper="Upload and crop venture profile images."
              items={(draftData.incubatees || []).map(withProfileImageDefaults)}
              onSelectImage={(itemId, file) =>
                openCropDialog({
                  mode: "profile",
                  sectionPath: ["incubatees"],
                  itemId,
                  file,
                  aspectRatio: 1,
                  outputWidth: 800,
                  outputHeight: 800,
                  helperText: "Adjust zoom and position, then upload a square profile image."
                })
              }
              onChange={(nextValue) => updatePath(["incubatees"], nextValue)}
              title="Incubatee Profiles"
              uploadingKey={
                uploadingTarget.startsWith("profile:incubatees:")
                  ? uploadingTarget.replace("profile:incubatees:", "")
                  : ""
              }
              renderExtras={({ item }) => (
                <div className="admin-form-grid admin-form-grid-wide">
                  <div className="field field-span-2">
                    <span>Photo Gallery (optional)</span>
                    <input
                      accept="image/*"
                      type="file"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) {
                          handleIncubateeGalleryUpload(item.id, file);
                        }
                        event.target.value = "";
                      }}
                    />
                    {uploadingTarget === `incubatee-gallery:${item.id}` ? <p className="form-message">Uploading gallery image...</p> : null}
                    <div className="admin-chip-grid">
                      {(item.photoUrls || []).map((url, index) => (
                        <div className="admin-chip" key={`${item.id}-photo-${index}`}>
                          <span>Photo {index + 1}</span>
                          <InlineConfirmButton
                            confirmLabel="Remove"
                            label="Remove"
                            message="Remove this gallery image URL from the incubatee?"
                            onConfirm={() => handleIncubateeGalleryRemove(item.id, url)}
                          />
                        </div>
                      ))}
                      {!item.photoUrls?.length ? <p className="muted-copy">No gallery images yet.</p> : null}
                    </div>
                  </div>
                </div>
              )}
            />
            <button className="button" disabled={saving === "incubatees"} onClick={() => saveSection("incubatees")} type="button">
              {saving === "incubatees" ? "Saving..." : "Save Incubatees"}
            </button>
          </div>
        ) : null}

        {activeTab === "mentors" ? (
          <div className="admin-section-stack">
            <ProfileCollectionEditor
              
              fields={[
                { key: "name", label: "Name" },
                { key: "expertise", label: "Expertise" },
                { key: "company", label: "Company" },
                { key: "focus", label: "Focus", type: "textarea", span: 2, rows: 4 }
              ]}
              helper="Upload and crop profile photos for mentors."
              items={(draftData.mentors || []).map(withProfileImageDefaults)}
              onSelectImage={(itemId, file) =>
                openCropDialog({
                  mode: "profile",
                  sectionPath: ["mentors"],
                  itemId,
                  file,
                  aspectRatio: 1,
                  outputWidth: 800,
                  outputHeight: 800,
                  helperText: "Adjust zoom and position, then upload a square profile image."
                })
              }
              onChange={(nextValue) => updatePath(["mentors"], nextValue)}
              title="Mentor Profiles"
              uploadingKey={
                uploadingTarget.startsWith("profile:mentors:")
                  ? uploadingTarget.replace("profile:mentors:", "")
                  : ""
              }
            />
            <button className="button" disabled={saving === "mentors"} onClick={() => saveSection("mentors")} type="button">
              {saving === "mentors" ? "Saving..." : "Save Mentors"}
            </button>
          </div>
        ) : null}

        {activeTab === "services" ? (
          <div className="admin-section-stack">
            <CollectionEditor
              
              fields={[
                { key: "title", label: "Title" },
                { key: "category", label: "Category" },
                { key: "description", label: "Description", type: "textarea", span: 2, rows: 4 },
                { key: "items", label: "Bullet Items", type: "array", span: 2, rows: 4 }
              ]}
              items={draftData.services}
              onChange={(nextValue) => updatePath(["services"], nextValue)}
              title="Services"
            />
            <button className="button" disabled={saving === "services"} onClick={() => saveSection("services")} type="button">
              {saving === "services" ? "Saving..." : "Save Services"}
            </button>
          </div>
        ) : null}

        {activeTab === "membership" ? (
          <div className="admin-section-stack">
            <CollectionEditor
              
              fields={[
                { key: "name", label: "Plan Name" },
                { key: "price", label: "Price" },
                { key: "frequency", label: "Frequency" },
                { key: "description", label: "Description", type: "textarea", span: 2, rows: 4 },
                { key: "features", label: "Features", type: "array", span: 2, rows: 4 }
              ]}
              items={draftData.membershipPlans}
              onChange={(nextValue) => updatePath(["membershipPlans"], nextValue)}
              title="Membership Plans"
            />
            <button
              className="button"
              disabled={saving === "membershipPlans"}
              onClick={() => saveSection("membershipPlans")}
              type="button"
            >
              {saving === "membershipPlans" ? "Saving..." : "Save Membership Plans"}
            </button>
          </div>
        ) : null}

        {activeTab === "rif-services" ? (
          <div className="admin-section-stack">
            <AdminIndexedSections
              tabId="rif-services"
              openSections={openSections}
              onToggle={toggleOpenSection}
              panels={[
                {
                  id: "header",
                  label: "Header Content",
                  content: (
                    <ObjectEditor
                      fields={[
                        { key: "pageEyebrow", label: "Page Eyebrow" },
                        { key: "pageTitle", label: "Page Title", span: 2 },
                        { key: "benefitsEyebrow", label: "Benefits Eyebrow" },
                        { key: "benefitsTitle", label: "Benefits Title", span: 2 },
                        { key: "otherServicesEyebrow", label: "Other Services Eyebrow" },
                        { key: "otherServicesTitle", label: "Other Services Title", span: 2 }
                      ]}
                      onChange={(nextValue) => updatePath(["rifServices"], nextValue)}
                      title="RIF Services Header Content"
                      value={draftData.rifServices}
                    />
                  )
                },
                {
                  id: "benefits",
                  label: "Benefits",
                  content: (
                    <CollectionEditor
                      fields={[
                        { key: "title", label: "Benefit Title" },
                        { key: "description", label: "Benefit Description", type: "textarea", span: 2, rows: 4 }
                      ]}
                      items={draftData.rifServices?.benefits}
                      onChange={(nextValue) => updatePath(["rifServices", "benefits"], nextValue)}
                      title="Benefits List"
                    />
                  )
                },
                {
                  id: "service-tiles",
                  label: "Service Tiles",
                  content: (
                    <RifServiceTilesEditor
                      items={draftData.rifServices?.serviceTiles}
                      onChange={(nextValue) => updatePath(["rifServices", "serviceTiles"], nextValue)}
                      onUploadIcon={handleRifServiceIconUpload}
                      uploadingKey={uploadingTarget.startsWith("rif-service-icon:") ? uploadingTarget.replace("rif-service-icon:", "") : ""}
                    />
                  )
                },
                {
                  id: "support-card",
                  label: "Support Card",
                  content: (
                    <ObjectEditor
                      fields={[
                        { key: "supportCardTitle", label: "Support Card Title", span: 2 },
                        { key: "supportCardDescription", label: "Support Card Description", type: "textarea", span: 2, rows: 4 },
                        { key: "supportPhone", label: "Support Phone" }
                      ]}
                      onChange={(nextValue) => updatePath(["rifServices"], nextValue)}
                      title="Support Call Card"
                      value={draftData.rifServices}
                    />
                  )
                },
                {
                  id: "eligibility",
                  label: "Eligibility",
                  content: (
                    <div className="admin-section-stack">
                      <ObjectEditor
                        fields={[
                          { key: "eligibilityTitle", label: "Eligibility Title", span: 2 },
                          { key: "eligibilityIntro", label: "Eligibility Intro", type: "textarea", span: 2, rows: 4 }
                        ]}
                        onChange={(nextValue) => updatePath(["rifServices"], nextValue)}
                        title="Eligibility Section"
                        value={draftData.rifServices}
                      />
                      <CollectionEditor
                        fields={[
                          { key: "title", label: "Bullet Title" },
                          { key: "description", label: "Bullet Description", type: "textarea", span: 2, rows: 3 }
                        ]}
                        items={draftData.rifServices?.eligibilityPoints || []}
                        onChange={(nextValue) => updatePath(["rifServices", "eligibilityPoints"], nextValue)}
                        title="Eligibility Bullets"
                      />
                    </div>
                  )
                },
                {
                  id: "screening-header",
                  label: "Screening Header",
                  content: (
                    <ObjectEditor
                      fields={[{ key: "screeningTitle", label: "Screening Section Title", span: 2 }]}
                      onChange={(nextValue) => updatePath(["rifServices"], nextValue)}
                      title="Screening Section Header"
                      value={draftData.rifServices}
                    />
                  )
                },
                {
                  id: "screening-steps",
                  label: "Screening Steps",
                  content: (
                    <CollectionEditor
                      fields={[
                        { key: "title", label: "Step Title" },
                        { key: "description", label: "Step Description", type: "textarea", span: 2, rows: 3 }
                      ]}
                      items={draftData.rifServices?.screeningSteps}
                      onChange={(nextValue) => updatePath(["rifServices", "screeningSteps"], nextValue)}
                      title="Screening Steps"
                    />
                  )
                }
              ]}
            />
            <button
              className="button"
              disabled={saving === "rifServices"}
              onClick={() => saveSection("rifServices")}
              type="button"
            >
              {saving === "rifServices" ? "Saving..." : "Save RIF Services"}
            </button>
          </div>
        ) : null}

        {activeTab === "legal-pages" ? (
          <div className="admin-section-stack">
            <AdminIndexedSections
              tabId="legal-pages"
              openSections={openSections}
              onToggle={toggleOpenSection}
              panels={legalPageKeys.map((page) => {
                const policy = getByPath(draftData, ["legalPages", page.key]) || buildPolicyContent();

                return {
                  id: page.key.replace(/([A-Z])/g, "-$1").toLowerCase(),
                  label: page.label,
                  content: (
                    <div className="admin-section-stack">
                      <ObjectEditor
                        fields={[
                          { key: "eyebrow", label: "Eyebrow" },
                          { key: "title", label: "Page Title", span: 2 },
                          { key: "description", label: "Description", type: "textarea", span: 2, rows: 4 },
                          { key: "summary", label: "Summary", type: "textarea", span: 2, rows: 3 }
                        ]}
                        onChange={(nextValue) =>
                          updatePath(["legalPages", page.key], {
                            ...policy,
                            ...nextValue
                          })
                        }
                        title={`${page.label} Header Content`}
                        value={policy}
                      />
                      <PolicySectionsEditor
                        items={policy.sections}
                        onChange={(nextValue) => updatePath(["legalPages", page.key, "sections"], nextValue)}
                        title={`${page.label} Sections`}
                      />
                    </div>
                  )
                };
              })}
            />
            <button
              className="button"
              disabled={saving === "legalPages"}
              onClick={() => saveSection("legalPages")}
              type="button"
            >
              {saving === "legalPages" ? "Saving..." : "Save Legal Pages"}
            </button>
          </div>
        ) : null}

        {activeTab === "news-events" ? (
          <div className="admin-section-stack">
            <AdminIndexedSections
              tabId="news-events"
              openSections={openSections}
              onToggle={toggleOpenSection}
              panels={[
                {
                  id: "news",
                  label: "News",
                  content: (
                    <CollectionEditor
                      fields={[
                        { key: "type", label: "Type" },
                        { key: "title", label: "Title", span: 2 },
                        { key: "excerpt", label: "Excerpt", type: "textarea", span: 2, rows: 4 },
                        { key: "publishedAt", label: "Published Date", type: "date" },
                        { key: "link", label: "Link", type: "url", span: 2 },
                        { key: "category", label: "Category" },
                        { key: "author", label: "Author" }
                      ]}
                      items={draftData.news}
                      onChange={(nextValue) => updatePath(["news"], nextValue)}
                      title="News"
                    />
                  )
                },
                {
                  id: "events",
                  label: "Events",
                  content: (
                    <CollectionEditor
                      fields={[
                        { key: "title", label: "Title", span: 2 },
                        { key: "location", label: "Location" },
                        { key: "date", label: "Date", type: "date" },
                        { key: "status", label: "Status" },
                        { key: "link", label: "Link", type: "url", span: 2 },
                        { key: "summary", label: "Summary", type: "textarea", span: 2, rows: 4 }
                      ]}
                      items={draftData.events}
                      onChange={(nextValue) => updatePath(["events"], nextValue)}
                      title="Events"
                    />
                  )
                }
              ]}
            />
            <button className="button" onClick={() => saveMultiple(["news", "events"])} type="button">
              Save News and Events
            </button>
          </div>
        ) : null}

        {activeTab === "gallery" ? (
          <div className="admin-section-stack">
            <AdminIndexedSections
              tabId="gallery"
              openSections={openSections}
              onToggle={toggleOpenSection}
              panels={[
                {
                  id: "gallery-index",
                  label: "Gallery Editors",
                  content: (
                    <section className="admin-panel">
                      <div className="admin-panel-head">
                        <h3>Gallery Editors</h3>
                      </div>
                      <div className="admin-inline-actions">
                        <button
                          className={galleryEditorMode === "heroSlider" ? "button button-small" : "button button-ghost button-small"}
                          onClick={() => setGalleryEditorMode("heroSlider")}
                          type="button"
                        >
                          Hero Slides
                        </button>
                        <button
                          className={galleryEditorMode === "gallery" ? "button button-small" : "button button-ghost button-small"}
                          onClick={() => setGalleryEditorMode("gallery")}
                          type="button"
                        >
                          Image Gallery
                        </button>
                        <button
                          className={galleryEditorMode === "mediaCoverage" ? "button button-small" : "button button-ghost button-small"}
                          onClick={() => setGalleryEditorMode("mediaCoverage")}
                          type="button"
                        >
                          Media Coverage
                        </button>
                      </div>
                    </section>
                  )
                },
                {
                  id: "hero-slides",
                  label: "Hero Slides",
                  content: (
                    <>
                      <MediaCollectionEditor
                        addLabel="Add Hero Slide"
                        blankTitle="New Hero Slide"
                        helper="These images only power the home page hero slider. Uploads save immediately. Use only a short title and the image."
                        items={draftData.heroSlider}
                        onChange={(nextValue) => updatePath(["heroSlider"], nextValue)}
                        onSelectImage={(itemId, file) =>
                          openCropDialog({
                            mode: "media",
                            section: "heroSlider",
                            itemId,
                            file,
                            aspectRatio: 16 / 9,
                            outputWidth: 1920,
                            outputHeight: 1080,
                            helperText: "Crop this image for hero slider format (16:9). Upload saves immediately."
                          })
                        }
                        title="Home Hero Slides"
                        uploadingKey={uploadingTarget.startsWith("heroSlider:") ? uploadingTarget.replace("heroSlider:", "") : ""}
                        withFocalControls
                        captionLabel="Slide Title"
                      />
                      <button
                        className="button"
                        disabled={saving === "heroSlider"}
                        onClick={() => saveSection("heroSlider")}
                        type="button"
                      >
                        {saving === "heroSlider" ? "Saving..." : "Save Home Hero Slides"}
                      </button>
                    </>
                  )
                },
                {
                  id: "image-gallery",
                  label: "Image Gallery",
                  content: (
                    <>
                      <MediaCollectionEditor
                        addLabel="Add Gallery Image"
                        blankTitle=""
                        helper="These images only appear on the gallery page. Uploads save immediately, and captions are optional."
                        items={draftData.gallery}
                        onChange={(nextValue) => updatePath(["gallery"], nextValue)}
                        onSelectImage={(itemId, file) => handleMediaUpload("gallery", itemId, file)}
                        title="Gallery Images"
                        uploadingKey={uploadingTarget.startsWith("gallery:") ? uploadingTarget.replace("gallery:", "") : ""}
                        captionLabel="Caption (Optional)"
                      />
                      <button className="button" disabled={saving === "gallery"} onClick={() => saveSection("gallery")} type="button">
                        {saving === "gallery" ? "Saving..." : "Save Gallery Images"}
                      </button>
                    </>
                  )
                },
                {
                  id: "media-coverage",
                  label: "Media Coverage",
                  content: (
                    <>
                      <MediaCollectionEditor
                        addLabel="Add Media Coverage Item"
                        blankTitle=""
                        helper="These images appear on the Media Coverage page. Use titles and optional descriptions for press highlights."
                        items={draftData.mediaCoverage || []}
                        onChange={(nextValue) => updatePath(["mediaCoverage"], nextValue)}
                        onSelectImage={(itemId, file) => handleMediaUpload("mediaCoverage", itemId, file)}
                        title="Media Coverage"
                        uploadingKey={
                          uploadingTarget.startsWith("mediaCoverage:") ? uploadingTarget.replace("mediaCoverage:", "") : ""
                        }
                        captionLabel="Coverage Title"
                      />
                      <button
                        className="button"
                        disabled={saving === "mediaCoverage"}
                        onClick={() => saveSection("mediaCoverage")}
                        type="button"
                      >
                        {saving === "mediaCoverage" ? "Saving..." : "Save Media Coverage"}
                      </button>
                    </>
                  )
                }
              ]}
            />
          </div>
        ) : null}

        {activeTab === "forms" ? (
          <div className="admin-section-stack">
            <AdminIndexedSections
              tabId="forms"
              openSections={openSections}
              onToggle={toggleOpenSection}
              panels={[
                {
                  id: "form-content",
                  label: "Form Content",
                  content: (
                    <section className="admin-panel">
                      <div className="admin-panel-head">
                        <h3>Form Content</h3>
                      </div>
                      <div className="admin-collection">
                        {["apply", "membership", "enquiry"].map((formKey) => {
                          const formMeta = getByPath(draftData, ["formsMeta", formKey]);

                          return (
                            <article className="admin-card admin-compact-card" key={formKey}>
                              <div>
                                <strong>{formMetaLabels[formKey] || slugLabel(formKey)} Form</strong>
                                <p className="detail-line">{formMeta?.title || "No title set."}</p>
                              </div>
                              <div className="admin-inline-actions">
                                <button className="button button-small" onClick={() => setActiveFormMetaKey(formKey)} type="button">
                                  Edit in Modal
                                </button>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    </section>
                  )
                }
              ]}
            />
            <button className="button" disabled={saving === "formsMeta"} onClick={() => saveSection("formsMeta")} type="button">
              {saving === "formsMeta" ? "Saving..." : "Save Forms"}
            </button>
          </div>
        ) : null}

        {activeTab === "submissions" ? (
          <div className="admin-section-stack">
            <AdminIndexedSections
              tabId="submissions"
              openSections={openSections}
              onToggle={toggleOpenSection}
              panels={[
                {
                  id: "incoming-submissions",
                  label: "Incoming Submissions",
                  content: (
                    <section className="admin-panel">
                      <div className="admin-panel-head">
                        <h3>Incoming Form Submissions</h3>
                        <button className="button button-ghost button-small" onClick={loadSubmissions} type="button">
                          Refresh Submissions
                        </button>
                      </div>
                      <p className="muted-copy">New submissions refresh automatically every 15 seconds while this tab is open.</p>
                    </section>
                  )
                },
                {
                  id: "apply-submissions",
                  label: "Apply Form",
                  content: (
                    <SubmissionTable items={submissions?.apply} onDelete={handleDeleteSubmission} title="Apply Form Submissions" type="apply" />
                  )
                },
                {
                  id: "membership-submissions",
                  label: "Membership Form",
                  content: (
                    <SubmissionTable
                      items={submissions?.membership}
                      onDelete={handleDeleteSubmission}
                      title="Membership Form Submissions"
                      type="membership"
                    />
                  )
                },
                {
                  id: "enquiry-submissions",
                  label: "General Enquiry Form",
                  content: (
                    <SubmissionTable
                      items={submissions?.enquiry}
                      onDelete={handleDeleteSubmission}
                      title="General Enquiry Form Submissions"
                      type="enquiry"
                    />
                  )
                }
              ]}
            />
          </div>
        ) : null}
      </div>
      <ImageCropDialog cropState={cropState} onClose={closeCropDialog} onConfirm={handleCropConfirm} />
      {activeFormMetaKey && activeFormMetaValue ? (
        <AdminDialog title={`Edit ${formMetaLabels[activeFormMetaKey] || slugLabel(activeFormMetaKey)} Form`} onClose={() => setActiveFormMetaKey("")}>
          <div className="admin-section-stack">
            <div className="admin-form-grid">
              {(formMetaFieldSets[activeFormMetaKey] || commonFormMetaFields).map((field) => (
                <label className={field.span === 2 ? "field field-span-2" : "field"} key={field.key}>
                  <span>{field.label}</span>
                  <InputField
                    field={field}
                    value={activeFormMetaValue[field.key]}
                    onChange={(nextValue) =>
                      updatePath(["formsMeta", activeFormMetaKey], {
                        ...activeFormMetaValue,
                        [field.key]: nextValue
                      })
                    }
                  />
                </label>
              ))}
              {(activeFormMetaKey === "apply" || activeFormMetaKey === "membership" || activeFormMetaKey === "enquiry") && (
                <>
                  <label className="field">
                    <span>QR Eyebrow</span>
                    <input
                      type="text"
                      value={activeFormMetaValue.qrCodeLabel || ""}
                      onChange={(event) =>
                        updatePath(["formsMeta", activeFormMetaKey], {
                          ...activeFormMetaValue,
                          qrCodeLabel: event.target.value
                        })
                      }
                    />
                  </label>
                  <label className="field field-span-2">
                    <span>QR Title</span>
                    <input
                      type="text"
                      value={activeFormMetaValue.qrCodeTitle || ""}
                      onChange={(event) =>
                        updatePath(["formsMeta", activeFormMetaKey], {
                          ...activeFormMetaValue,
                          qrCodeTitle: event.target.value
                        })
                      }
                    />
                  </label>
                  <label className="field field-span-2">
                    <span>QR Note</span>
                    <textarea
                      rows="3"
                      value={activeFormMetaValue.qrCodeNote || ""}
                      onChange={(event) =>
                        updatePath(["formsMeta", activeFormMetaKey], {
                          ...activeFormMetaValue,
                          qrCodeNote: event.target.value
                        })
                      }
                    />
                  </label>
                </>
              )}
            </div>
            {(activeFormMetaKey === "apply" || activeFormMetaKey === "membership" || activeFormMetaKey === "enquiry") && (
              <section className="admin-panel form-meta-qr-admin">
                <div className="admin-panel-head">
                  <div>
                    <h3>QR Block</h3>
                    <p className="muted-copy">Upload a square QR image for this form or leave it blank to show the dummy placeholder.</p>
                  </div>
                </div>
                <div className="form-meta-qr-admin-grid">
                  <div className="form-meta-qr-admin-preview">
                    {activeFormMetaValue.qrCodeImageUrl ? (
                      <img
                        alt={activeFormMetaValue.qrCodeTitle || "QR code"}
                        className="form-meta-qr-admin-image"
                        src={resolveMediaUrl(activeFormMetaValue.qrCodeImageUrl, activeFormMetaValue.qrCodeTitle || "QR code")}
                      />
                    ) : (
                      <div className="form-meta-qr-admin-empty">Dummy QR placeholder will show on the public page until you upload the final image.</div>
                    )}
                  </div>
                  <div className="admin-section-stack">
                    <label className="field">
                      <span>Upload QR Image</span>
                      <input
                        accept="image/*"
                        type="file"
                        onChange={(event) => {
                          const file = event.target.files?.[0];

                          if (file) {
                            handleFormMetaQrUpload(activeFormMetaKey, file);
                          }

                          event.target.value = "";
                        }}
                      />
                    </label>
                    <div className="page-hero-panel-admin-actions">
                      <button className="button button-ghost button-small" onClick={() => handleFormMetaQrRemove(activeFormMetaKey)} type="button">
                        Remove QR Image
                      </button>
                    </div>
                    {uploadingTarget === `formMetaQr:${activeFormMetaKey}` ? <p className="form-message">Uploading QR image...</p> : null}
                  </div>
                </div>
              </section>
            )}
          </div>
        </AdminDialog>
      ) : null}
    </section>
  );
}
