import { Link } from "react-router-dom";
import { useSiteData } from "../components/SiteDataProvider.jsx";

export default function MembershipPage() {
  const siteData = useSiteData().siteData;
  const plans = siteData?.membershipPlans || [];
  const siteSettings = siteData?.siteSettings;
  const mapQuery = encodeURIComponent(siteSettings?.location || "Rohilkhand Incubation Foundation");

  return (
    <>
      <section className="section membership-offer-section">
        <div className="membership-offer-heading">
          <p className="section-eyebrow">Membership</p>
          <h2>We are offering vast facilities under one roof</h2>
        </div>
        <div className="membership-offer-grid">
          {plans.map((plan, index) => (
            <article className="membership-plan-card" key={plan.id || index}>
              <h3>{plan.name}</h3>
              <p className="membership-plan-frequency">{plan.frequency}</p>
              <strong>{plan.price}</strong>
              <span>/member</span>
              {plan.description ? <p className="membership-plan-description">{plan.description}</p> : null}
            </article>
          ))}
        </div>
        <div className="hero-actions membership-offer-actions">
          <Link className="button" to="/membership-register">
            Register for Membership
          </Link>
          <Link className="button button-ghost" to="/contact">
            Talk to RIF Team
          </Link>
        </div>
      </section>

      <section className="section membership-support-section">
        <div className="membership-support-grid">
          <article className="membership-support-card">
            <p className="section-eyebrow">Need Support</p>
            <h3>Please feel free to contact us</h3>
            <ul className="bullet-list bullet-list-tight membership-support-list">
              <li>Reply within 24 hours</li>
              <li>Direct call support for urgent queries</li>
              <li>
                Email:{" "}
                <a className="text-link" href={`mailto:${siteSettings?.contactEmail}`}>
                  {siteSettings?.contactEmail}
                </a>
              </li>
              <li>
                Phone:{" "}
                <a className="text-link" href={`tel:${siteSettings?.contactPhone}`}>
                  {siteSettings?.contactPhone}
                </a>
              </li>
            </ul>
            <div className="membership-map-shell">
              <iframe
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                title="RIF Location Map"
              />
            </div>
          </article>

          <article className="membership-support-form-card">
            <h3>Quick Query</h3>
            <form className="membership-quick-form" onSubmit={(event) => event.preventDefault()}>
              <input placeholder="Your Name" type="text" />
              <input placeholder="Your Email" type="email" />
              <select defaultValue="">
                <option disabled value="">
                  Select a Query
                </option>
                <option>Membership Plans</option>
                <option>Institutional Partnership</option>
                <option>General Support</option>
              </select>
              <textarea placeholder="Message" rows={4} />
              <Link className="button" to="/contact">
                Send
              </Link>
            </form>
          </article>
        </div>
      </section>
    </>
  );
}
