import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHero } from "../components/PageHero.jsx";
import { SectionHeading } from "../components/SectionHeading.jsx";
import { useSiteData } from "../components/SiteDataProvider.jsx";
import { resolveMediaUrl } from "../utils/media.js";

const truncateText = (value = "", limit = 340) => {
  if (!value || value.length <= limit) return value;
  return `${value.slice(0, limit).trim()}...`;
};

export default function LeadershipPage() {
  const { about, team } = useSiteData().siteData || {};
  const [expanded, setExpanded] = useState(new Set());
  const leadershipContent = team?.leadershipContent || {};
  const leadershipMessages = useMemo(
    () => [
      {
        key: "governorMessage",
        fallbackEyebrow: "Governor, Uttar Pradesh",
        fallbackName: "Anandiben Patel",
        fallbackButtonLabel: "Message from Governor",
        fallbackButtonLink: "/leadership/message-from-governor",
        fallbackImageAlt: "Governor message"
      },
      {
        key: "chiefMinisterMessage",
        fallbackEyebrow: "Chief Minister, Uttar Pradesh",
        fallbackName: "Yogi Adityanath",
        fallbackButtonLabel: "Message from Chief Minister",
        fallbackButtonLink: "/leadership/message-from-chief-minister",
        fallbackImageAlt: "Chief Minister message"
      },
      {
        key: "viceChancellorMessage",
        fallbackEyebrow: "Vice Chancellor",
        fallbackName: "Vice Chancellor",
        fallbackButtonLabel: "Message from Vice Chancellor",
        fallbackButtonLink: "/leadership/message-from-vice-chancellor",
        fallbackImageAlt: "Vice Chancellor message"
      }
    ].map((item) => {
      const message = leadershipContent?.[item.key] || {};

      return {
        ...item,
        ...message,
        preview: truncateText(message.message, 360)
      };
    }),
    [leadershipContent]
  );
  const featuredLeadershipMessages = leadershipMessages.filter((message) => message.key !== "viceChancellorMessage");
  const viceChancellorMessage = leadershipMessages.find((message) => message.key === "viceChancellorMessage");

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
        eyebrow={leadershipContent.eyebrow || "Leadership"}
        panelKey="leadership"
        title={leadershipContent.title || "Leadership that guides governance, direction, and founder confidence."}
        description={
          leadershipContent.description ||
          "Explore the strategic pillars behind RIF along with the board and advisory leaders who shape institutional momentum."
        }
        primaryAction={{
          label: leadershipContent.primaryCtaLabel || "Board of Directors",
          to: leadershipContent.primaryCtaLink || "/leadership/board-of-directors"
        }}
        secondaryAction={{
          label: leadershipContent.secondaryCtaLabel || "Send Enquiry",
          to: leadershipContent.secondaryCtaLink || "/enquiry"
        }}
      />

      <section className="section leadership-messages-section">
        <SectionHeading
          eyebrow="Leadership Messages"
          title="Guidance from the leaders shaping RIF's direction and momentum."
          description="Read the featured messages from the Governor and Chief Minister in one polished leadership space."
        />
        <div className="pillar-message-list pillar-message-featured">
          {featuredLeadershipMessages.map((message) => (
            <article className="pillar-message-card governor-message-card" key={message.key}>
              {message?.imageUrl ? (
                <div className="pillar-feature-media governor-message-media">
                  <img
                    alt={message.imageAlt || message.name || message.fallbackImageAlt}
                    src={resolveMediaUrl(message.imageUrl, message.imageAlt || message.name || message.fallbackImageAlt)}
                  />
                </div>
              ) : (
                <div className="pillar-feature-placeholder governor-message-placeholder" aria-hidden>
                  {(message?.name || "L").charAt(0).toUpperCase()}
                </div>
              )}
              <div className="pillar-message-copy pillar-feature-copy">
                <p className="pillar-message-role leadership-card-eyebrow">{message?.eyebrow || message.fallbackEyebrow}</p>
                <h3 className="leadership-card-name">{message?.name || message.fallbackName}</h3>
                <p className="pillar-feature-body">{message.preview}</p>
                <Link className="message-link-button" to={message?.buttonLink || message.fallbackButtonLink}>
                  <span>{message?.buttonLabel || message.fallbackButtonLabel}</span>
                  <span aria-hidden>&rarr;</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeading
          eyebrow={leadershipContent.pillarsEyebrow || "Leadership Pillars"}
          title={leadershipContent.pillarsTitle || "The principles guiding how RIF builds trust and momentum."}
          description={
            leadershipContent.pillarsDescription ||
            "These pillars now sit within Leadership so governance, advisory support, and strategic direction are presented together."
          }
        />
        <div className="pillar-message-list">
          {about?.pillars?.map((pillar, index) => (
            <article className="pillar-message-card" key={pillar.id || pillar.title || index}>
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
                <p className="pillar-message-role leadership-card-eyebrow">{pillar?.eyebrow || "RIF Strategic Pillar"}</p>
                <h3 className="leadership-card-name">{pillar.title}</h3>
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

      {viceChancellorMessage ? (
        <section className="section leadership-vice-section">
          <div className="pillar-message-list pillar-message-featured leadership-vice-list">
            <article className="pillar-message-card governor-message-card" key={viceChancellorMessage.key}>
              {viceChancellorMessage?.imageUrl ? (
                <div className="pillar-feature-media governor-message-media">
                  <img
                    alt={
                      viceChancellorMessage.imageAlt ||
                      viceChancellorMessage.name ||
                      viceChancellorMessage.fallbackImageAlt
                    }
                    src={resolveMediaUrl(
                      viceChancellorMessage.imageUrl,
                      viceChancellorMessage.imageAlt || viceChancellorMessage.name || viceChancellorMessage.fallbackImageAlt
                    )}
                  />
                </div>
              ) : (
                <div className="pillar-feature-placeholder governor-message-placeholder" aria-hidden>
                  {(viceChancellorMessage?.name || "L").charAt(0).toUpperCase()}
                </div>
              )}
              <div className="pillar-message-copy pillar-feature-copy">
                <p className="pillar-message-role leadership-card-eyebrow">
                  {viceChancellorMessage?.eyebrow || viceChancellorMessage.fallbackEyebrow}
                </p>
                <h3 className="leadership-card-name">
                  {viceChancellorMessage?.name || viceChancellorMessage.fallbackName}
                </h3>
                <p className="pillar-feature-body">{viceChancellorMessage.preview}</p>
                <Link
                  className="message-link-button"
                  to={viceChancellorMessage?.buttonLink || viceChancellorMessage.fallbackButtonLink}
                >
                  <span>{viceChancellorMessage?.buttonLabel || viceChancellorMessage.fallbackButtonLabel}</span>
                  <span aria-hidden>&rarr;</span>
                </Link>
              </div>
            </article>
          </div>
        </section>
      ) : null}

      <section className="section">
        <div className="split-grid">
          <article className="cta-panel">
            <p className="section-eyebrow">Governance</p>
            <h3>Board of Directors</h3>
            <p>Review the leadership team responsible for governance, direction, and institutional oversight.</p>
            <Link className="button" to="/leadership/board-of-directors">
              View Board of Directors
            </Link>
          </article>
          <article className="cta-panel">
            <p className="section-eyebrow">Advisory</p>
            <h3>Advisory Board Members</h3>
            <p>Meet the advisors supporting growth, ecosystem alignment, and founder decision-making across functions.</p>
            <Link className="button" to="/leadership/advisory-board">
              View Advisory Board
            </Link>
          </article>
        </div>
      </section>
    </>
  );
}
