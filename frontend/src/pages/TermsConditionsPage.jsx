import { PolicyPage, buildPolicyContent } from "../components/PolicyPage.jsx";
import { useSiteData } from "../components/SiteDataProvider.jsx";
import { legalPageDefaults } from "../data/legalPages.js";

export default function TermsConditionsPage() {
  const { siteData } = useSiteData();
  const policy = buildPolicyContent({
    ...legalPageDefaults.termsConditions,
    ...(siteData?.legalPages?.termsConditions || {})
  });

  return (
    <PolicyPage
      description={policy.description}
      eyebrow={policy.eyebrow}
      panelKey="termsConditions"
      sections={policy.sections}
      summary={policy.summary}
      title={policy.title}
    />
  );
}
