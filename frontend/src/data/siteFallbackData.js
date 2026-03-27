import seedSiteData from "../../../backend/data/cms-data.json";

export const createSiteFallbackData = () => {
  const clonedData = structuredClone(seedSiteData);
  const { submissions: _submissions, ...siteData } = clonedData;
  return siteData;
};
