import { useState } from "react";
import { PageHero } from "../components/PageHero.jsx";
import { SectionHeading } from "../components/SectionHeading.jsx";
import { useSiteData } from "../components/SiteDataProvider.jsx";
import { resolveMediaUrl } from "../utils/media.js";
import { API_ORIGIN } from "../api/client.js";

const resolveDocumentUrl = (value = "") => {
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/")) return `${API_ORIGIN}${value}`;
  return `${API_ORIGIN}/${value}`;
};

const truncateText = (value = "", limit = 340) => {
  if (!value || value.length <= limit) return value;
  return `${value.slice(0, limit).trim()}...`;
};

export default function AboutPage() {
  const about = useSiteData().siteData?.about;
  const [expanded, setExpanded] = useState(new Set());

  const toggleExpand = (key) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <>
      <PageHero
        eyebrow="About"
        title={about?.overview?.title || "About RIF"}
        description={about?.overview?.body || ""}
        primaryAction={{ label: "View Documents", to: "/documents" }}
        secondaryAction={{ label: "Meet the Team", to: "/team" }}
      />

      <section className="section">
        <div className="split-grid">
          <article className="content-card">
            <p className="section-eyebrow">Mission</p>
            <h3>{about?.overview?.mission}</h3>
          </article>
          <article className="content-card">
            <p className="section-eyebrow">Vision</p>
            <h3>{about?.overview?.vision}</h3>
          </article>
        </div>
      </section>

      <section className="section">
        <SectionHeading eyebrow="Pillars" title="" />
        <div className="pillar-message-list pillar-message-featured">
          {about?.pillars?.map((pillar, index) => (
            <article className="pillar-message-card" key={pillar.title || index}>
              {pillar?.imageUrl ? (
                <div className="pillar-feature-media">
                  <img alt={pillar.title || "Pillar"} src={resolveMediaUrl(pillar.imageUrl, pillar.title || "Pillar")} />
                </div>
              ) : (
                <div className="pillar-feature-placeholder" aria-hidden>
                  {(pillar?.title || "P").charAt(0).toUpperCase()}
                </div>
              )}
              <div className="pillar-message-copy pillar-feature-copy">
                <p className="pillar-message-role">{pillar?.eyebrow || "RIF Strategic Pillar"}</p>
                <h3>{pillar.title}</h3>
                <p className="pillar-feature-body">
                  {expanded.has(index) ? pillar.description : truncateText(pillar.description, 360)}
                </p>
                {pillar?.description?.length > 360 ? (
                  <button className="pillars-readmore" onClick={() => toggleExpand(index)} type="button">
                    {expanded.has(index) ? "Show less" : "Read more"}
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
