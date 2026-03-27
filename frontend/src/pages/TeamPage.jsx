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

const sectionConfig = {
  boardOfDirectors: {
    id: "board-of-directors",
    panelKey: "boardOfDirectors",
    title: "Board of Directors",
    eyebrow: "Leadership",
    description: "Leadership pages now sit under About Us so governance and advisory information stay grouped together.",
    primaryAction: { label: "Advisory Board", to: "/leadership/advisory-board" },
    secondaryAction: { label: "Send Enquiry", to: "/enquiry" },
    style: "profile"
  },
  advisoryBoard: {
    id: "advisory-board",
    panelKey: "advisoryBoard",
    title: "Advisory Board Members",
    eyebrow: "Leadership",
    description: "Leadership pages now sit under About Us so governance and advisory information stay grouped together.",
    primaryAction: { label: "Board of Directors", to: "/leadership/board-of-directors" },
    secondaryAction: { label: "Send Enquiry", to: "/enquiry" },
    style: "advisory"
  },
  coreTeam: {
    id: "core-team",
    panelKey: "coreTeam",
    title: "Core Team",
    eyebrow: "Team",
    description: "Use the RIF Team menu to switch between the core team, incubatee profiles, and mentor profiles.",
    primaryAction: { label: "Browse Mentors", to: "/mentors" },
    secondaryAction: { label: "View Incubatees", to: "/incubatees" },
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

export default function TeamPage({ sectionKey = "coreTeam" }) {
  const team = useSiteData().siteData?.team;
  const activeSection = sectionConfig[sectionKey] || sectionConfig.coreTeam;
  const sectionItems = team?.[sectionKey] || team?.coreTeam || [];

  return (
    <>
      <PageHero
        eyebrow={activeSection.eyebrow}
        panelKey={activeSection.panelKey}
        title={activeSection.title}
        description={activeSection.description}
        primaryAction={activeSection.primaryAction}
        secondaryAction={activeSection.secondaryAction}
      />
      <TeamSection id={activeSection.id} items={sectionItems} style={activeSection.style} title={activeSection.title} />
    </>
  );
}
