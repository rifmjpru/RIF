import { PageHero } from "./PageHero.jsx";
import { useSiteData } from "./SiteDataProvider.jsx";

const formatUpdatedDate = () =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date());

export const PolicyPage = ({ eyebrow, title, description, summary, sections, panelKey = "" }) => {
  const siteSettings = useSiteData().siteData?.siteSettings;
  const organisationName = siteSettings?.fullName || "Rohilkhand Incubation Foundation";
  const contactEmail = siteSettings?.contactEmail || "hello@rif.org.in";
  const location = siteSettings?.location || "Bareilly, Uttar Pradesh";

  const resolvedSections = sections.map((section) => ({
    ...section,
    paragraphs: section.paragraphs.map((paragraph) =>
      paragraph
        .replaceAll("{organisationName}", organisationName)
        .replaceAll("{contactEmail}", contactEmail)
        .replaceAll("{location}", location)
    )
  }));

  return (
    <>
      <PageHero
        eyebrow={eyebrow}
        panelKey={panelKey}
        title={title}
        description={description}
        primaryAction={{ label: "Contact Us", to: "/contact" }}
        secondaryAction={{ label: "Send Enquiry", to: "/enquiry" }}
      />

      <section className="section">
        <div className="legal-shell">
          <article className="legal-summary-card">
            <p className="section-eyebrow">Important Notice</p>
            <h2>{summary}</h2>
            <p>
              This page is intended to communicate the standard website and service terms currently followed by
              {` ${organisationName}`}. Last updated on {formatUpdatedDate()}.
            </p>
          </article>

          <div className="legal-sections">
            {resolvedSections.map((section) => (
              <article className="legal-section-card" key={section.heading}>
                <h3>{section.heading}</h3>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export const buildPolicyContent = (overrides = {}) => ({
  eyebrow: "Legal",
  title: "",
  description: "",
  summary: "",
  sections: [],
  ...overrides
});
