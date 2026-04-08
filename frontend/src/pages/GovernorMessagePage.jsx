import { useState } from "react";
import { Link } from "react-router-dom";
import { useSiteData } from "../components/SiteDataProvider.jsx";
import { resolveMediaUrl } from "../utils/media.js";

const splitMessage = (value = "") =>
  value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

export default function GovernorMessagePage() {
  const [expanded, setExpanded] = useState(false);
  const { team } = useSiteData().siteData || {};
  const leadershipContent = team?.leadershipContent || {};
  const governorMessage = leadershipContent?.governorMessage || {};
  const paragraphs = splitMessage(governorMessage.message);
  const messageText = paragraphs.join("\n\n");
  const hasMoreContent = messageText.length > 260;
  const imageAlt = governorMessage.imageAlt || governorMessage.name || "Governor message";
  const imageSrc = resolveMediaUrl(governorMessage.imageUrl, imageAlt);
  const letterImageAlt = governorMessage.letterImageAlt || "Governor message letter";
  const letterImageSrc = resolveMediaUrl(governorMessage.letterImageUrl, letterImageAlt);

  return (
    <>
      <section className="section">
        <div className="section-heading">
          <p className="section-eyebrow">{governorMessage.pageEyebrow || "Leadership Message"}</p>
          <h1>{governorMessage.pageTitle || "Message from Governor"}</h1>
        </div>
        <article className="governor-message-page-card">
          {imageSrc ? (
            <div className="governor-message-page-media">
              <img alt={imageAlt} src={imageSrc} />
            </div>
          ) : (
            <div className="governor-message-page-media-placeholder" aria-hidden="true">
              <span>{(governorMessage.name || "G").charAt(0).toUpperCase()}</span>
            </div>
          )}
          <div className="governor-message-page-copy">
            <div className="governor-message-page-quote" aria-hidden="true">
              <svg viewBox="0 0 64 64" role="presentation">
                <path d="M27.2 16C16.6 21.2 11 30 11 41.8 11 50.2 16.8 56 24.6 56c7 0 12.4-5.2 12.4-12.2 0-6.6-4.4-11-10.8-11.8 1.4-4.4 4.8-8.6 10.8-13.2L27.2 16Zm25.4 0C42 21.2 36.4 30 36.4 41.8 36.4 50.2 42.2 56 50 56c7 0 12.4-5.2 12.4-12.2 0-6.6-4.4-11-10.8-11.8 1.4-4.4 4.8-8.6 10.8-13.2L52.6 16Z" />
              </svg>
            </div>
            <div className="governor-message-page-meta" aria-hidden="true">
              <span>{governorMessage.pageEyebrow || "Leadership Message"}</span>
              <span>Crystal edition</span>
            </div>
            <h2>{governorMessage.name || "Anandiben Patel"}</h2>
            <div className={`governor-message-page-body${expanded ? " governor-message-page-body-expanded" : ""}`}>
              <div className="governor-message-page-paragraph">
                <p className="governor-message-page-text">
                  {messageText || "Add the full governor message from the admin panel to show it here."}
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
              <p className="governor-letter-card-label">{governorMessage.letterSectionLabel || "Official Letter"}</p>
              <h3>{governorMessage.letterSectionTitle || "View the signed governor message"}</h3>
              <p>
                {governorMessage.letterSectionDescription ||
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
