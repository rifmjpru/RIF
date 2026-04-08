import { useState } from "react";
import { Link } from "react-router-dom";
import { useSiteData } from "../components/SiteDataProvider.jsx";
import { resolveMediaUrl } from "../utils/media.js";

const splitMessage = (value = "") =>
  value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

const messageFallbacks = {
  governorMessage: {
    eyebrow: "Governor, Uttar Pradesh",
    name: "Anandiben Patel",
    pageEyebrow: "Leadership Message",
    pageTitle: "Message from Governor",
    imageAlt: "Governor of Uttar Pradesh",
    letterSectionLabel: "Official Letter",
    letterSectionTitle: "View the signed governor message",
    letterSectionDescription: "Upload the scanned hard-copy letter here so visitors can preview it in full screen or download it directly.",
    letterImageAlt: "Signed governor message letter",
    message:
      "I feel extremely proud to know that Mahatma Jyotiba Phule Rohilkhand University, Bareilly, is sharing the promotional brochure of the Rohilkhand Incubation Foundation, established under the State Government of Uttar Pradesh to promote entrepreneurship."
  },
  chiefMinisterMessage: {
    eyebrow: "Chief Minister, Uttar Pradesh",
    name: "Yogi Adityanath",
    pageEyebrow: "Leadership Message",
    pageTitle: "Message from Chief Minister",
    imageAlt: "Chief Minister of Uttar Pradesh",
    letterSectionLabel: "Official Letter",
    letterSectionTitle: "View the signed chief minister message",
    letterSectionDescription: "Upload the scanned hard-copy letter here so visitors can preview it in full screen or download it directly.",
    letterImageAlt: "Signed chief minister message letter",
    message:
      "Innovation, entrepreneurship, and institutional collaboration can create transformative opportunities for young founders across Uttar Pradesh. Initiatives that connect education, incubation, and industry help build a stronger startup ecosystem for the state."
  },
  viceChancellorMessage: {
    eyebrow: "Vice Chancellor",
    name: "Vice Chancellor",
    pageEyebrow: "Leadership Message",
    pageTitle: "Message from Vice Chancellor",
    imageAlt: "Vice Chancellor message",
    letterSectionLabel: "Official Letter",
    letterSectionTitle: "View the signed vice chancellor message",
    letterSectionDescription: "Upload the scanned hard-copy letter here so visitors can preview it in full screen or download it directly.",
    letterImageAlt: "Signed vice chancellor message letter",
    message:
      "Rohilkhand Incubation Foundation reflects our commitment to nurture research, innovation, and entrepreneurship together. We aim to support students, researchers, and founders with an ecosystem that helps promising ideas become impactful ventures."
  }
};

export default function LeadershipMessagePage({ messageKey = "governorMessage" }) {
  const [expanded, setExpanded] = useState(false);
  const { team } = useSiteData().siteData || {};
  const leadershipContent = team?.leadershipContent || {};
  const messageConfig = {
    ...(messageFallbacks[messageKey] || messageFallbacks.governorMessage),
    ...(leadershipContent?.[messageKey] || {})
  };
  const paragraphs = splitMessage(messageConfig.message);
  const messageText = paragraphs.join("\n\n");
  const hasMoreContent = messageText.length > 260;
  const imageAlt = messageConfig.imageAlt || messageConfig.name || "Leadership message";
  const imageSrc = resolveMediaUrl(messageConfig.imageUrl, imageAlt);
  const letterImageAlt = messageConfig.letterImageAlt || "Leadership message letter";
  const letterImageSrc = resolveMediaUrl(messageConfig.letterImageUrl, letterImageAlt);

  return (
    <>
      <section className="section">
        <div className="section-heading">
          <p className="section-eyebrow">{messageConfig.pageEyebrow || "Leadership Message"}</p>
          <h1>{messageConfig.pageTitle || "Leadership Message"}</h1>
        </div>
        <article className="governor-message-page-card">
          {imageSrc ? (
            <div className="governor-message-page-media">
              <img alt={imageAlt} src={imageSrc} />
            </div>
          ) : (
            <div className="governor-message-page-media-placeholder" aria-hidden="true">
              <span>{(messageConfig.name || "L").charAt(0).toUpperCase()}</span>
            </div>
          )}
          <div className="governor-message-page-copy">
            <div className="governor-message-page-quote" aria-hidden="true">
              <svg viewBox="0 0 64 64" role="presentation">
                <path d="M27.2 16C16.6 21.2 11 30 11 41.8 11 50.2 16.8 56 24.6 56c7 0 12.4-5.2 12.4-12.2 0-6.6-4.4-11-10.8-11.8 1.4-4.4 4.8-8.6 10.8-13.2L27.2 16Zm25.4 0C42 21.2 36.4 30 36.4 41.8 36.4 50.2 42.2 56 50 56c7 0 12.4-5.2 12.4-12.2 0-6.6-4.4-11-10.8-11.8 1.4-4.4 4.8-8.6 10.8-13.2L52.6 16Z" />
              </svg>
            </div>
            <div className="governor-message-page-meta" aria-hidden="true">
              <span>{messageConfig.eyebrow || "Leadership Message"}</span>
              <span>Crystal edition</span>
            </div>
            <h2>{messageConfig.name || "Leadership Message"}</h2>
            <div className={`governor-message-page-body${expanded ? " governor-message-page-body-expanded" : ""}`}>
              <div className="governor-message-page-paragraph">
                <p className="governor-message-page-text">
                  {messageText || "Add the full leadership message from the admin panel to show it here."}
                </p>
              </div>
            </div>
            <div className="governor-message-page-actions">
              {hasMoreContent ? (
                <button className="pillars-readmore governor-message-readmore" onClick={() => setExpanded((value) => !value)} type="button">
                  {expanded ? "Read less" : "Read more"}
                </button>
              ) : null}
              <Link className="button button-ghost governor-message-backlink" to="/leadership">
                Back to Leadership
              </Link>
            </div>
          </div>
        </article>
      </section>

      {letterImageSrc ? (
        <section className="section">
          <article className="governor-letter-card">
            <div className="governor-letter-card-media">
              <img alt={letterImageAlt} src={letterImageSrc} />
            </div>
            <div className="governor-letter-card-copy">
              <p className="governor-letter-card-label">{messageConfig.letterSectionLabel || "Official Letter"}</p>
              <h3>{messageConfig.letterSectionTitle || "View the signed message"}</h3>
              <p>
                {messageConfig.letterSectionDescription ||
                  "Upload the scanned hard-copy letter here so visitors can preview it in full screen or download it directly."}
              </p>
              <div className="governor-letter-card-meta" aria-hidden="true">
                <span>Signed copy</span>
                <span>Glass preview</span>
              </div>
              <div className="hero-actions governor-letter-card-actions">
                <a className="button" href={letterImageSrc} rel="noreferrer" target="_blank">
                  Preview Full Screen
                </a>
              </div>
            </div>
          </article>
        </section>
      ) : null}
    </>
  );
}
