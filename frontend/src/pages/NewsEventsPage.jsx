import { PageHero } from "../components/PageHero.jsx";
import { useSiteData } from "../components/SiteDataProvider.jsx";
import { formatDate } from "../utils/formatters.js";

const isExternalLink = (value = "") => /^https?:\/\//i.test(value);

const RailCard = ({ item, variant }) => {
  const isEvent = variant === "event";
  const href = item.link || "/news-events";

  return (
    <a
      className={isEvent ? "rail-card rail-card-event" : "rail-card"}
      href={href}
      rel={isExternalLink(href) ? "noreferrer" : undefined}
      target={isExternalLink(href) ? "_blank" : undefined}
    >
      <p className="meta-line">
        <span>{isEvent ? item.status : item.type}</span>
        <span>{formatDate(isEvent ? item.date : item.publishedAt)}</span>
      </p>
      <h3>{item.title}</h3>
      <p>{isEvent ? item.summary : item.excerpt}</p>
      <p className="detail-line">{isEvent ? item.location : `${item.category} · ${item.author}`}</p>
    </a>
  );
};

const ContentRail = ({ eyebrow, title, description, items, variant = "news", reverse = false }) => {
  const shouldLoop = (items?.length || 0) > 1;
  const loopItems = shouldLoop ? [...items, ...items] : items || [];

  return (
    <section className="rail-shell">
      <div className="rail-copy">
        <p className="section-eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p className="section-description">{description}</p>
      </div>
      <div className={reverse ? "rail-track rail-track-reverse" : "rail-track"}>
        <div className={shouldLoop ? "rail-lane" : "rail-lane rail-lane-static"}>
          {loopItems.map((item, index) => (
            <RailCard item={item} key={`${variant}-${item.id}-${index}`} variant={variant} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default function NewsEventsPage() {
  const { news, events } = useSiteData().siteData || {};

  return (
    <>
      <PageHero
        eyebrow="News and Events"
        title="A content publishing system for announcements, updates, and event visibility."
        description="Both content collections are editable from the admin dashboard and are designed for regular institutional updates."
        primaryAction={{ label: "Contact RIF", to: "/contact" }}
      />
      <section className="section rail-section">
        <ContentRail
          description="A continuous headline rail for institutional updates. Hover to pause and inspect any card."
          eyebrow="News Line"
          items={news}
          title="Latest announcements moving in one direction like a train line."
          variant="news"
        />
        <ContentRail
          description="Events run on a second lane so the page feels active without becoming cluttered."
          eyebrow="Event Line"
          items={events}
          reverse
          title="Upcoming sessions and public dates move on their own track."
          variant="event"
        />
      </section>
      <section className="section">
        <div className="split-grid">
          <article className="content-card">
            <p className="section-eyebrow">How It Works</p>
            <h3>Admin updates appear here automatically.</h3>
            <p>
              News and event entries added from the admin dashboard feed these rails directly from MongoDB-backed site
              content, so the motion layer stays in sync with the CMS.
            </p>
          </article>
          <article className="content-card">
            <p className="section-eyebrow">Interaction</p>
            <h3>Continuous by default, readable on hover.</h3>
            <p>
              The rails pause on hover, reverse across rows, and respect reduced-motion settings for users who prefer a
              calmer interface.
            </p>
          </article>
        </div>
      </section>
    </>
  );
}
