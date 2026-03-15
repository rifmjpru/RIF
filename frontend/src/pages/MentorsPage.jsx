import { PageHero } from "../components/PageHero.jsx";
import { useSiteData } from "../components/SiteDataProvider.jsx";
import { resolveMediaUrl } from "../utils/media.js";

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((part) => part.trim()[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

export default function MentorsPage() {
  const mentors = useSiteData().siteData?.mentors;

  return (
    <>
      <PageHero
        eyebrow="Mentors"
        title="Experts founders can rely on across product, growth, and finance."
        description="Mentor records are editable from the admin dashboard, so the team can keep expertise and company information up to date."
        primaryAction={{ label: "Apply to Programs", to: "/apply" }}
      />
      <section className="section">
        <div className="card-grid card-grid-3">
          {mentors?.map((mentor) => (
            <article className="content-card profile-content-card" key={mentor.id}>
              <div className="profile-image-shell">
                {mentor.imageUrl ? (
                  <img alt={mentor.name} className="profile-image" src={resolveMediaUrl(mentor.imageUrl, mentor.name)} />
                ) : (
                  <span className="profile-image-fallback">{getInitials(mentor.name)}</span>
                )}
              </div>
              <p className="meta-line">
                <span>{mentor.expertise}</span>
              </p>
              <h3>{mentor.name}</h3>
              <p className="detail-line">{mentor.company}</p>
              <p>{mentor.focus}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
