export const SectionHeading = ({ eyebrow, title, description, compact = false }) => (
  <div className={compact ? "section-heading section-heading-compact" : "section-heading"}>
    {eyebrow ? <p className="section-eyebrow">{eyebrow}</p> : null}
    <h2>{title}</h2>
    {description ? <p className="section-description">{description}</p> : null}
  </div>
);

