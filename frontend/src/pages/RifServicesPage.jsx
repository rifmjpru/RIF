import { useSiteData } from "../components/SiteDataProvider.jsx";
import { resolveMediaUrl } from "../utils/media.js";

const defaultRifServices = {
  pageEyebrow: "Our Services",
  pageTitle: "Custom IT solutions for your successful business",
  benefitsEyebrow: "Benefits",
  benefitsTitle: "Benefits to Choose RIF",
  benefits: [],
  otherServicesEyebrow: "Other Services",
  otherServicesTitle: "Custom IT solutions for your successful business",
  serviceTiles: [],
  supportCardTitle: "Call Us For Any Query",
  supportCardDescription: "Please connect with our team for guidance, support, and collaboration enquiries.",
  supportPhone: "+91 8979794345",
  eligibilityTitle: "Eligibility Criteria for Incubatees",
  eligibilityIntro:
    "Entrepreneurs and startups interested in applying for incubation at RIF should review the following criteria.",
  eligibilityPoints: [],
  screeningTitle: "Screening Process for Incubatees",
  screeningSteps: []
};

const normalizeRifServices = (value) => {
  if (Array.isArray(value)) {
    return {
      ...defaultRifServices,
      serviceTiles: value.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        iconUrl: item.imageUrl || "",
        iconAlt: item.title || "Service icon"
      }))
    };
  }

  if (!value || typeof value !== "object") {
    return defaultRifServices;
  }

  return {
    ...defaultRifServices,
    ...value,
    benefits: Array.isArray(value.benefits) ? value.benefits : [],
    serviceTiles: Array.isArray(value.serviceTiles) ? value.serviceTiles : [],
    eligibilityPoints: Array.isArray(value.eligibilityPoints) ? value.eligibilityPoints : [],
    screeningSteps: Array.isArray(value.screeningSteps) ? value.screeningSteps : []
  };
};

const getInitials = (value = "") =>
  value
    .split(" ")
    .map((part) => part.trim()[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

export default function RifServicesPage() {
  const content = normalizeRifServices(useSiteData().siteData?.rifServices);

  return (
    <>
      <section className="section rif-services-section">
        <div className="rif-services-header">
          <p className="section-eyebrow">{content.pageEyebrow}</p>
          <h2>{content.pageTitle}</h2>
        </div>

        <article className="rif-benefits-card">
          <p className="section-eyebrow">{content.benefitsEyebrow}</p>
          <h3>{content.benefitsTitle}</h3>
          <div className="rif-benefits-list">
            {content.benefits.map((item) => (
              <div className="rif-benefit-item" key={item.id || item.title}>
                <h4>{item.title}</h4>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="section rif-services-section">
        <div className="rif-services-subhead">
          <p className="section-eyebrow">{content.otherServicesEyebrow}</p>
          <h3>{content.otherServicesTitle}</h3>
        </div>

        <div className="rif-service-tiles-grid">
          {content.serviceTiles.map((tile) => (
            <article className="rif-service-tile" key={tile.id || tile.title}>
              <div className="rif-service-icon">
                {tile.iconUrl ? (
                  <img alt={tile.iconAlt || tile.title} src={resolveMediaUrl(tile.iconUrl, tile.iconAlt || tile.title)} />
                ) : (
                  <span>{getInitials(tile.title)}</span>
                )}
              </div>
              <h4>{tile.title}</h4>
              <p>{tile.description}</p>
            </article>
          ))}
          <article className="rif-service-tile rif-service-tile-callout">
            <h4>{content.supportCardTitle}</h4>
            <p>{content.supportCardDescription}</p>
            <a className="text-link" href={`tel:${content.supportPhone}`}>
              {content.supportPhone}
            </a>
          </article>
        </div>
      </section>

      <section className="section rif-services-section">
        <article className="rif-criteria-card">
          <h3>{content.eligibilityTitle}</h3>
          <p>{content.eligibilityIntro}</p>
          <ul className="bullet-list">
            {content.eligibilityPoints.map((point, index) => (
              <li key={`${index}-${point}`}>{point}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="section rif-services-section">
        <article className="rif-screening-card">
          <h3>{content.screeningTitle}</h3>
          <div className="rif-screening-list">
            {content.screeningSteps.map((step) => (
              <div className="rif-screening-item" key={step.id || step.title}>
                <h4>{step.title}</h4>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      {!content.serviceTiles.length && !content.benefits.length ? (
        <section className="section">
          <article className="content-card">
            <h3>No services configured yet</h3>
            <p>
              Open Admin Dashboard, go to <strong>RIF Services</strong>, and add benefits, service tiles, eligibility points, and
              screening steps.
            </p>
          </article>
        </section>
      ) : null}
    </>
  );
}
