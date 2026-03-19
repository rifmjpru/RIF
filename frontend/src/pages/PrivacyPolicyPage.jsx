import { PolicyPage, buildPolicyContent } from "../components/PolicyPage.jsx";
import { useSiteData } from "../components/SiteDataProvider.jsx";
import { legalPageDefaults } from "../data/legalPages.js";

export default function PrivacyPolicyPage() {
  const { siteData } = useSiteData();
  const policy = buildPolicyContent({
    ...legalPageDefaults.privacyPolicy,
    ...(siteData?.legalPages?.privacyPolicy || {})
  });

  return (
    <PolicyPage
      description={policy.description}
      eyebrow={policy.eyebrow}
      sections={policy.sections}
      summary={policy.summary}
      title={policy.title}
    />
  );
}
