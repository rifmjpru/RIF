import { useSiteData } from "../components/SiteDataProvider.jsx";
import { resolveMediaUrl } from "../utils/media.js";

export default function MediaCoveragePage() {
  const mediaCoverage = useSiteData().siteData?.mediaCoverage || [];

  const handleImageError = (event, title) => {
    event.target.src = resolveMediaUrl("", title);
  };

  return (
    <section className="section gallery-simple-section">
      <div className="gallery-simple-heading">
        <span aria-hidden className="gallery-simple-accent" />
        <h1>Media Coverage</h1>
        <p className="section-description">Recent newspaper, press, and public visibility highlights for RIF.</p>
        <svg aria-hidden focusable="false" height="22" viewBox="0 0 64 22" width="64" className="heading-illustration">
          <rect x="2" y="9" width="18" height="4" rx="2" fill="var(--primary)" />
          <rect x="24" y="6" width="14" height="10" rx="2" fill="var(--accent)" />
          <rect x="42" y="9" width="20" height="4" rx="2" fill="var(--primary)" />
        </svg>
      </div>
      {mediaCoverage.length ? (
        <div className="media-coverage-grid media-coverage-grid-rows">
          {mediaCoverage.map((item) => (
            <article className="media-coverage-card" key={item.id}>
              <img
                alt={item.altText || item.title}
                className="media-coverage-image"
                src={resolveMediaUrl(item.imageUrl, item.title)}
                loading="lazy"
                onError={(event) => handleImageError(event, item.title)}
              />
              <p className="media-coverage-caption">{item.title}</p>
              {item.description ? <p className="detail-line">{item.description}</p> : null}
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>No media coverage items added yet.</h3>
        </div>
      )}
    </section>
  );
}
