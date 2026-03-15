import { Link, useParams } from "react-router-dom";
import { useMemo } from "react";
import { useSiteData } from "../components/SiteDataProvider.jsx";
import { resolveMediaUrl } from "../utils/media.js";

const slugify = (value = "") =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .trim();

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((part) => part.trim()[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const SOCIAL_ICON_META = {
  linkedin: {
    label: "LinkedIn",
    viewBox: "0 0 24 24",
    path: "M22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.226.792 24 1.771 24h20.451C23.2 24 24 23.226 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003zM7.059 20.452H3.577V9h3.482zM5.318 7.433a2.018 2.018 0 110-4.036 2.018 2.018 0 010 4.036zm15.134 13.019h-3.48v-5.567c0-1.328-.027-3.039-1.853-3.039-1.855 0-2.139 1.45-2.139 2.947v5.659H9.5V9h3.343v1.561h.048c.466-.883 1.603-1.814 3.297-1.814 3.525 0 4.264 2.32 4.264 5.336z",
  },
  twitter: {
    label: "X / Twitter",
    viewBox: "0 0 24 24",
    path: "M3 3h4.5l4.63 6.19L16.74 3H21l-6.52 8.38L21 21h-4.5l-4.97-6.62L6.54 21H3l6.77-8.74z",
  },
  youtube: {
    label: "YouTube",
    viewBox: "0 0 24 24",
    path: "M21.8 8.26s-.2-1.41-.82-2.03c-.78-.82-1.66-.83-2.06-.88C16.97 5.11 12 5.11 12 5.11s-4.97 0-6.92.24c-.4.05-1.28.06-2.06.88-.62.62-.82 2.03-.82 2.03S2 9.74 2 11.23v1.54c0 1.49.18 2.97.18 2.97s.2 1.41.82 2.03c.78.82 1.8.8 2.26.89 1.64.17 6.74.22 6.74.22s4.97-.01 6.92-.25c.4-.05 1.28-.06 2.06-.88.62-.62.82-2.03.82-2.03S22 14.26 22 12.77v-1.54c0-1.49-.2-2.97-.2-2.97zM10 15.02V8.98l5.2 3.02z",
  },
  facebook: {
    label: "Facebook",
    viewBox: "0 0 24 24",
    path: "M22.675 0H1.325C.593 0 0 .593 0 1.326v21.348C0 23.408.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.894-4.788 4.659-4.788 1.325 0 2.464.099 2.795.143v3.24l-1.918.001c-1.504 0-1.796.715-1.796 1.763v2.312h3.59l-.467 3.622h-3.123V24h6.116C23.407 24 24 23.408 24 22.674V1.326C24 .593 23.407 0 22.675 0z",
  },
  instagram: {
    label: "Instagram",
    viewBox: "0 0 24 24",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 1.17.056 1.97.24 2.427.403a4.92 4.92 0 011.78 1.155 4.92 4.92 0 011.155 1.779c.163.457.347 1.258.403 2.428.058 1.265.07 1.645.07 4.849s-.012 3.584-.07 4.85c-.056 1.17-.24 1.97-.403 2.427a4.92 4.92 0 01-1.155 1.78 4.92 4.92 0 01-1.779 1.155c-.457.163-1.258.347-2.428.403-1.265.058-1.645.07-4.849.07s-3.584-.012-4.85-.07c-1.17-.056-1.97-.24-2.427-.403a4.92 4.92 0 01-1.78-1.155 4.92 4.92 0 01-1.155-1.779c-.163-.457-.347-1.258-.403-2.428C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.85c.056-1.17.24-1.97.403-2.427a4.92 4.92 0 011.155-1.78 4.92 4.92 0 011.779-1.155c.457-.163 1.258-.347 2.428-.403C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.775.13 4.897.304 4.158.555a7.075 7.075 0 00-2.57 1.671A7.075 7.075 0 00-.083 4.897c-.25.739-.424 1.617-.483 2.894C-0.017 8.332 0 8.741 0 12c0 3.259-.013 3.668.072 4.948.059 1.277.233 2.155.483 2.894a7.075 7.075 0 001.671 2.57 7.075 7.075 0 002.57 1.671c.739.25 1.617.424 2.894.483C8.332 23.987 8.741 24 12 24c3.259 0 3.668-.013 4.948-.072 1.277-.059 2.155-.233 2.894-.483a7.075 7.075 0 002.57-1.671 7.075 7.075 0 001.671-2.57c.25-.739.424-1.617.483-2.894.059-1.28.072-1.689.072-4.948 0-3.259-.013-3.668-.072-4.948-.059-1.277-.233-2.155-.483-2.894a7.075 7.075 0 00-1.671-2.57A7.075 7.075 0 0019.842.555c-.739-.25-1.617-.424-2.894-.483C15.668.013 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a3.999 3.999 0 110-7.998 3.999 3.999 0 010 7.998zm7.2-11.682a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z",
  },
};

const SOCIAL_KEYS = Object.keys(SOCIAL_ICON_META);

const buildInfoRows = (company) =>
  [
    { label: "Name of the start-up", value: company.name },
    { label: "Establishment Year", value: company.establishmentYear || company.year },
    { label: "Objectives of the start-up", value: company.objectives || company.summary },
    { label: "Directors Details", value: company.directors || company.founder },
    { label: "Mobile", value: company.phone },
    { label: "Email", value: company.email },
    { label: "Stage", value: company.stage },
    { label: "Sector", value: company.sector },
    { label: "Location", value: company.location }
  ].filter((item) => item.value);

export default function IncubateeProfilePage() {
  const { incubateeId = "" } = useParams();
  const { siteData, status } = useSiteData();
  const incubatees = siteData?.incubatees || [];

  const incubatee = useMemo(
    () =>
      incubatees.find(
        (item) =>
          item.id === incubateeId ||
          item.slug === incubateeId ||
          slugify(item.name) === incubateeId
      ) || null,
    [incubatees, incubateeId]
  );

  if (status === "loading") {
    return (
      <section className="section">
        <div className="content-card">
          <p className="muted-copy">Loading incubatee profile…</p>
        </div>
      </section>
    );
  }

  if (!incubatee) {
    return (
      <section className="section">
        <div className="content-card">
          <h3>Incubatee not found</h3>
          <p>This profile may have moved or been unpublished.</p>
          <div className="hero-actions">
            <Link className="button" to="/incubatees">
              Back to Incubatees
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const profileUrl = resolveMediaUrl(incubatee.imageUrl, incubatee.name);
  const photos = incubatee.photoUrls || [];
  const infoRows = buildInfoRows(incubatee);
  const socialLinks =
    typeof incubatee.socialLinks === "string"
      ? (() => {
          try {
            return JSON.parse(incubatee.socialLinks);
          } catch {
            return {};
          }
        })()
      : incubatee.socialLinks || {};
  const normalizedSocialLinks = Object.entries(socialLinks || {}).reduce((acc, [key, value]) => {
    const safeKey = key.toLowerCase();
    if (SOCIAL_ICON_META[safeKey]) {
      acc[safeKey] = value;
    }
    return acc;
  }, {});
  const allowedSocialLinks = SOCIAL_KEYS.filter((key) => normalizedSocialLinks?.[key]);
  const hasSocialLinks = allowedSocialLinks.length > 0;

  const renderSocialIcon = (key) => {
    const meta = SOCIAL_ICON_META[key];
    if (!meta) return null;
    return (
      <svg aria-hidden="true" className="incubatee-social-icon" focusable="false" viewBox={meta.viewBox}>
        <path d={meta.path} />
      </svg>
    );
  };

  return (
    <>
      <section className="incubatee-hero">
        <div className="incubatee-hero-inner">
          <div className="incubatee-identity">
            <div className="incubatee-avatar-shell">
              {incubatee.imageUrl ? (
                <img alt={incubatee.name} src={profileUrl} />
              ) : (
                <span>{getInitials(incubatee.name)}</span>
              )}
              <span className="incubatee-status" aria-label="Active" />
            </div>
            <div>
              <p className="section-eyebrow">Incubatee</p>
              <h1 className="incubatee-title">{incubatee.name}</h1>
              {incubatee.tagline ? <p className="incubatee-subtitle">{incubatee.tagline}</p> : null}
              {incubatee.founder ? (
                <p className="incubatee-subtitle">
                  <strong className="incubatee-founder-label">Founder &amp; CEO:</strong>{" "}
                  <span className="incubatee-founder-name">{incubatee.founder}</span>
                </p>
              ) : null}
              {incubatee.summary ? <p className="incubatee-summary">{incubatee.summary}</p> : null}
              <div className="incubatee-pills">
                {incubatee.stage ? <span className="incubatee-pill">{incubatee.stage}</span> : null}
                {incubatee.sector ? <span className="incubatee-pill">{incubatee.sector}</span> : null}
                {incubatee.location ? <span className="incubatee-pill">{incubatee.location}</span> : null}
              </div>
              {hasSocialLinks ? (
                <div className="incubatee-social-links">
                  {allowedSocialLinks.map((key) => {
                    const href = normalizedSocialLinks[key];
                    const label = SOCIAL_ICON_META[key].label;
                    return (
                      <a
                        key={key}
                        aria-label={label}
                        className="incubatee-social-link"
                        data-network={key}
                        href={href}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <span className="sr-only">{label}</span>
                        {renderSocialIcon(key)}
                      </a>
                    );
                  })}
                </div>
              ) : null}
              <div className="hero-actions">
                {incubatee.website ? (
                  <a className="button" href={incubatee.website} rel="noreferrer" target="_blank">
                    Visit Website
                  </a>
                ) : null}
                <Link className="button button-ghost" to="/incubatees">
                  Back to directory
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section incubatee-detail">
        <div className="incubatee-overview-card">
          <div className="incubatee-contact">
            <div>
              <h2>Profile Snapshot</h2>
              <p className="muted-copy">Key facts about this venture.</p>
            </div>
            <div className="incubatee-contact-actions">
              {incubatee.email ? (
                <a className="button button-ghost" href={`mailto:${incubatee.email}`}>
                  {incubatee.email}
                </a>
              ) : null}
              {incubatee.phone ? (
                <a className="button button-ghost" href={`tel:${incubatee.phone}`}>
                  {incubatee.phone}
                </a>
              ) : null}
            </div>
          </div>
          <div className="incubatee-info-grid">
            {infoRows.map((row) => (
              <div className="incubatee-info" key={row.label}>
                <p className="muted-copy">{row.label}</p>
                <p className="incubatee-info-value">{row.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="incubatee-content-grid">
          <article className="content-card incubatee-description">
            <h3>Description</h3>
            <p>{incubatee.description || incubatee.summary || "No description provided yet."}</p>
          </article>

          {photos.length ? (
            <article className="content-card incubatee-gallery">
              <div className="incubatee-gallery-head">
                <div>
                  <p className="section-eyebrow">Photos</p>
                  <h3>What they are building</h3>
                </div>
              </div>
              <div className="incubatee-gallery-grid">
                {photos.map((url, index) => (
                  <div className="incubatee-gallery-item" key={`${incubatee.id}-photo-${index}`}>
                    <img alt={`${incubatee.name} gallery ${index + 1}`} src={resolveMediaUrl(url, incubatee.name)} />
                  </div>
                ))}
              </div>
            </article>
          ) : null}
        </div>
      </section>
    </>
  );
}
