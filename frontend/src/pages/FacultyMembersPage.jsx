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

export default function FacultyMembersPage() {
  const facultyMembers = useSiteData().siteData?.facultyMembers;

  return (
    <>
      <PageHero
        eyebrow="Faculty Members"
        panelKey="facultyMembers"
        title="Faculty members supporting research-led innovation and founder development."
        description="Faculty member profiles are editable from the admin dashboard, so the team can keep academic roles and focus areas up to date."
        primaryAction={{ label: "Send Enquiry", to: "/enquiry" }}
        secondaryAction={{ label: "Browse Mentors", to: "/mentors" }}
      />
      <section className="section">
        <div className="card-grid card-grid-3">
          {facultyMembers?.map((member) => (
            <article className="content-card profile-content-card" key={member.id}>
              <div className="profile-image-shell">
                {member.imageUrl ? (
                  <img alt={member.name} className="profile-image" src={resolveMediaUrl(member.imageUrl, member.name)} />
                ) : (
                  <span className="profile-image-fallback">{getInitials(member.name)}</span>
                )}
              </div>
              <p className="meta-line">
                <span>{member.designation}</span>
              </p>
              <h3>{member.name}</h3>
              <p className="detail-line">{member.department}</p>
              <p>{member.focus}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
