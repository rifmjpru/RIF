import { PageHero } from "../components/PageHero.jsx";
import { useSiteData } from "../components/SiteDataProvider.jsx";

export default function ContactPage() {
  const siteSettings = useSiteData().siteData?.siteSettings;
  const mapAddress = siteSettings?.location || "MJP Rohilkhand University, Pilibhit Bypass Road, Bareilly, Uttar Pradesh 243006";
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(mapAddress)}&output=embed`;

  return (
    <>
      <PageHero
        eyebrow="Need Support"
        panelKey="contact"
        title="Please Feel Free to Contact Us!"
        description="Reach out for incubation programs, partnerships, mentor engagement, memberships, or institutional collaborations."
        primaryAction={{ label: "Send Enquiry", to: "/enquiry" }}
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

      <section className="section">
        <article className="content-card">
          <p className="section-eyebrow">Google Map</p>
          <h3>Find us easily</h3>
          <p className="mb-4">Use the map below to get directions to our campus.</p>
          <div style={{ position: "relative", overflow: "hidden", borderRadius: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.06)" }}>
            <iframe
              src={mapSrc}
              title="Location map"
              width="100%"
              height="380"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </article>
      </section>
    </>
  );
}
