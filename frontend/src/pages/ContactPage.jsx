import { PageHero } from "../components/PageHero.jsx";
import { useSiteData } from "../components/SiteDataProvider.jsx";

export default function ContactPage() {
  const siteSettings = useSiteData().siteData?.siteSettings;

  return (
    <>
      <PageHero
        eyebrow="Need Support"
        title="Please Feel Free to Contact Us!"
        description="Reach out for incubation programs, partnerships, mentor engagement, memberships, or institutional collaborations."
        primaryAction={{ label: "Apply Now", to: "/apply" }}
        secondaryAction={{ label: "Membership Form", to: "/membership-register" }}
      />

      <section className="section">
        <div className="split-grid">
          <article className="content-card">
            <p className="section-eyebrow">Email</p>
            <h3>{siteSettings?.contactEmail}</h3>
            <p>Use this for startup applications, partnership discussions, and institutional queries.</p>
            <a className="text-link" href={`mailto:${siteSettings?.contactEmail}`}>
              Send email
            </a>
          </article>
          <article className="content-card">
            <p className="section-eyebrow">Phone</p>
            <h3>{siteSettings?.contactPhone}</h3>
            <p>Available for program enquiries, founder support, and coordination with stakeholders.</p>
            <a className="text-link" href={`tel:${siteSettings?.contactPhone}`}>
              Call now
            </a>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="split-grid">
          <article className="content-card">
            <p className="section-eyebrow">Location</p>
            <h3>{siteSettings?.location}</h3>
            <p>This route gives the navigation a dedicated contact destination like the reference screenshots.</p>
          </article>
          <article className="content-card">
            <p className="section-eyebrow">Digital Channels</p>
            <h3>Stay connected</h3>
            <p>Use the admin dashboard for direct publishing and public updates, and the social links for external reach.</p>
            <div className="stacked-list">
              {Object.entries(siteSettings?.socialLinks || {}).map(([key, value]) => (
                <a className="text-link" href={value} key={key} rel="noreferrer" target="_blank">
                  {key}
                </a>
              ))}
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
