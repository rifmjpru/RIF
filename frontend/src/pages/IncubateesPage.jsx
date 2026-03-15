import { Link } from "react-router-dom";
import { PageHero } from "../components/PageHero.jsx";
import { useSiteData } from "../components/SiteDataProvider.jsx";
import { resolveMediaUrl } from "../utils/media.js";

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((part) => part.trim()[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const slugify = (value = "") =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .trim();

export default function IncubateesPage() {
  const incubatees = useSiteData().siteData?.incubatees;

  return (
    <>
      <PageHero
        eyebrow="Incubatees"
        title="A public directory of ventures being supported by RIF."
        description="Profiles can be updated from the admin dashboard, making it easy to keep the portfolio current."
        primaryAction={{ label: "Register as Incubitee", to: "/incubitee-register" }}
      />
      <section className="section">
        <div className="card-grid card-grid-3">
          {incubatees?.map((company) => (
            <article className="content-card profile-content-card incubatee-card" key={company.id}>
              <div className="incubatee-card-row">
                <div className="profile-image-shell incubatee-avatar">
                  {company.imageUrl ? (
                    <img alt={company.name} className="profile-image" src={resolveMediaUrl(company.imageUrl, company.name)} />
                  ) : (
                    <span className="profile-image-fallback">{getInitials(company.name)}</span>
                  )}
                </div>
                <div className="incubatee-card-body">
                  <p className="meta-line">
                    <span>{company.sector}</span>
                    <span>{company.stage}</span>
                  </p>
                  <h3>{company.name}</h3>
                  {company.tagline ? <p className="detail-line">{company.tagline}</p> : null}
                  <p>{company.summary}</p>
                  <p className="detail-line">Founder: {company.founder}</p>
                  <p className="detail-line">Location: {company.location}</p>
                  <div className="incubatee-actions">
                    <Link className="button button-gradient" to={`/incubatees/${company.id || slugify(company.name)}`}>
                      Read More
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
