export const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }).format(new Date(value))
    : "";

export const slugLabel = (value) =>
  value
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (character) => character.toUpperCase())
    .trim();

