export const navigation = [
  {
    id: "home",
    label: "Home",
    to: "/"
  },
  {
    id: "about",
    label: "About Us",
    to: "/about",
    children: [
      { label: "About RIF", to: "/about" },
      { label: "Image Gallery", to: "/gallery" },
      { label: "Documents", to: "/documents" }
    ]
  },
  {
    id: "team",
    label: "RIF Team",
    to: "/team/board-of-directors",
    children: [
      { label: "Board of Directors", to: "/team/board-of-directors" },
      { label: "Advisory Board Members", to: "/team/advisory-board" },
      { label: "Team", to: "/team/core-team" },
      { label: "Incubatees' Profiles", to: "/incubatees" },
      { label: "Mentors' Profiles", to: "/mentors" }
    ]
  },
  {
    id: "services",
    label: "Services",
    to: "/services",
    children: [
      { label: "Membership Plans", to: "/membership-plans" },
      { label: "RIF Services", to: "/rif-services" }
    ]
  },
  {
    id: "news-events",
    label: "News & Events",
    to: "/news-events"
  },
  {
    id: "contact",
    label: "Contact Us",
    to: "/contact"
  }
];

export const applyAction = {
  label: "Apply Now",
  to: "/apply"
};
