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
      {
        label: "Leadership",
        to: "/leadership",
        children: [
          { label: "Board of Directors", to: "/leadership/board-of-directors" },
          { label: "Advisory Board Members", to: "/leadership/advisory-board" }
        ]
      },
      {
        label: "RIF Team",
        to: "/team/core-team",
        children: [
          { label: "Core Team", to: "/team/core-team" },
          { label: "Faculty Members", to: "/faculty-members" },
          { label: "Mentors' Profiles", to: "/mentors" },
          { label: "Incubatees' Profiles", to: "/incubatees" }
        ]
      }
    ]
  },
  {
    id: "gallery-documents",
    label: "Gallery & Documents",
    to: "/gallery",
    children: [
      { label: "Gallery", to: "/gallery" },
      { label: "Media Coverage", to: "/media-coverage" },
      { label: "Documents", to: "/documents" }
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
  label: "Enquiry",
  to: "/enquiry"
};
