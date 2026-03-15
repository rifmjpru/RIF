import { PageHero } from "../components/PageHero.jsx";
import { SectionHeading } from "../components/SectionHeading.jsx";
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

const teamSectionConfig = {
  boardOfDirectors: {
    id: "board-of-directors",
    title: "Board of Directors",
    style: "profile"
  },
  advisoryBoard: {
    id: "advisory-board",
    title: "Advisory Board Members",
    style: "advisory"
  },
  coreTeam: {
    id: "core-team",
    title: "Core Team",
    style: "advisory"
  }
};

const TeamSection = ({ id, title, items, style }) => (
  <section className="section" id={id}>
    <SectionHeading eyebrow="People" title={title} compact />
    <div className={style === "advisory" ? "advisory-board-grid" : "card-grid card-grid-3"}>
      {items?.map((member) => (
        <article className={style === "advisory" ? "advisory-member-card" : "content-card profile-content-card"} key={member.id}>
          <div className={style === "advisory" ? "advisory-member-avatar" : "profile-image-shell"}>
            {member.imageUrl ? (
              <img
                alt={member.name}
                className={style === "advisory" ? undefined : "profile-image"}
                src={resolveMediaUrl(member.imageUrl, member.name)}
              />
            ) : (
              <span className={style === "advisory" ? undefined : "profile-image-fallback"}>{getInitials(member.name)}</span>
            )}
          </div>
          {style === "advisory" ? (
            <>
              <h3>{member.name}</h3>
              <p>{member.role}</p>
            </>
          ) : (
            <>
              <p className="meta-line">
                <span>{member.role}</span>
              </p>
              <h3>{member.name}</h3>
              <p>{member.bio}</p>
            </>
          )}
        </article>
      ))}
    </div>
  </section>
);

export default function TeamPage({ sectionKey = "boardOfDirectors" }) {
  const team = useSiteData().siteData?.team;
  const activeSection = teamSectionConfig[sectionKey] || teamSectionConfig.boardOfDirectors;
  const sectionItems = team?.[sectionKey] || team?.boardOfDirectors;

  return (
    <>
      <PageHero
        eyebrow="Team"
        title={activeSection.title}
        description="Each team group now has a dedicated page. Use the RIF Team menu to switch between sections."
        primaryAction={{ label: "Browse Mentors", to: "/mentors" }}
        secondaryAction={{ label: "View Incubatees", to: "/incubatees" }}
      />
      <TeamSection id={activeSection.id} items={sectionItems} style={activeSection.style} title={activeSection.title} />
    </>
  );
}
