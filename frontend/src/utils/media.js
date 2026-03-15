import { API_ORIGIN } from "../api/client.js";

const escapeXml = (value = "") =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const buildPlaceholder = (title = "RIF Gallery") => {
  const safeTitle = escapeXml(title);

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 720">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#1f6ea9"/>
          <stop offset="65%" stop-color="#3f7de0"/>
          <stop offset="100%" stop-color="#d96262"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="720" fill="url(#g)"/>
      <rect x="58" y="58" width="1084" height="604" rx="28" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.22)"/>
      <text x="88" y="596" fill="white" font-family="Arial, sans-serif" font-size="72" font-weight="700">${safeTitle}</text>
      <text x="92" y="648" fill="rgba(255,255,255,0.86)" font-family="Arial, sans-serif" font-size="24">Upload real images from the admin gallery panel</text>
    </svg>`
  )}`;
};

export const resolveMediaUrl = (value, fallbackTitle) => {
  if (!value) {
    return buildPlaceholder(fallbackTitle);
  }

  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("data:")) {
    return value;
  }

  if (value.startsWith("/")) {
    return `${API_ORIGIN}${value}`;
  }

  return `${API_ORIGIN}/${value}`;
};
