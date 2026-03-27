import { Link } from "react-router-dom";
import { PageHero } from "../components/PageHero.jsx";
import { useSiteData } from "../components/SiteDataProvider.jsx";

export default function AboutPage() {
  const about = useSiteData().siteData?.about;

  return (
    <>
      <PageHero
        eyebrow="About"
        panelKey="about"
        title={about?.overview?.title || "About RIF"}
        description={about?.overview?.body || ""}
        primaryAction={{ label: "Explore Leadership", to: "/leadership" }}
        secondaryAction={{ label: "View Documents", to: "/documents" }}
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
        <div className="split-grid">
          <article className="cta-panel">
            <p className="section-eyebrow">Leadership</p>
            <h3>Meet the board and advisory leaders shaping RIF.</h3>
            <p>The leadership section now brings strategic pillars, board oversight, and advisory guidance together in one place.</p>
            <div className="hero-actions">
              <Link className="button" to="/leadership">
                View Leadership
              </Link>
              <Link className="button button-ghost" to="/leadership/board-of-directors">
                Board of Directors
              </Link>
            </div>
          </article>
          <article className="cta-panel">
            <p className="section-eyebrow">Resources</p>
            <h3>Browse RIF documents and public materials.</h3>
            <p>Institution profiles, reports, and downloadable resources stay centrally managed through the admin panel.</p>
            <div className="hero-actions">
              <Link className="button" to="/documents">
                View Documents
              </Link>
              <Link className="button button-ghost" to="/enquiry">
                Send Enquiry
              </Link>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
