import { PageHero } from "../components/PageHero.jsx";
import { SectionHeading } from "../components/SectionHeading.jsx";
import { useSiteData } from "../components/SiteDataProvider.jsx";
import { resolveMediaUrl } from "../utils/media.js";

export default function AboutPage() {
  const about = useSiteData().siteData?.about;

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
        <div className="pillar-message-list">
          {about?.pillars?.map((pillar, index) => (
            <article className="pillar-message-card" key={pillar.title || index}>
              <div className="pillar-message-avatar" aria-hidden>
                {pillar?.imageUrl ? (
                  <img alt={pillar.title || "Pillar"} src={resolveMediaUrl(pillar.imageUrl, pillar.title || "Pillar")} />
                ) : (
                  <span>{(pillar?.title || "P").charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="pillar-message-copy">
                <p className="pillar-message-role">{pillar?.eyebrow || "RIF Strategic Pillar"}</p>
                <h3>{pillar.title}</h3>
                <p>{pillar.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
