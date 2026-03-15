import { Link } from "react-router-dom";

export const PageHero = ({ eyebrow, title, description, primaryAction, secondaryAction }) => (
  <section className="page-hero">
    <div>
      <p className="section-eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="section-description">{description}</p>
      <div className="hero-actions">
        {primaryAction ? (
          <Link className="button" to={primaryAction.to}>
            {primaryAction.label}
          </Link>
        ) : null}
        {secondaryAction ? (
          <Link className="button button-ghost" to={secondaryAction.to}>
            {secondaryAction.label}
          </Link>
        ) : null}
      </div>
    </div>
    <div className="page-hero-card">
      <span className="eyebrow-chip">Content-managed</span>
      <p>
        Edit the page content from the admin dashboard, publish updates quickly, and keep the public site aligned
        with institutional priorities.
      </p>
    </div>
  </section>
);

