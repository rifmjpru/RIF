import { PolicyPage, buildPolicyContent } from "../components/PolicyPage.jsx";
import { useSiteData } from "../components/SiteDataProvider.jsx";
import { legalPageDefaults } from "../data/legalPages.js";

export default function RefundPolicyPage() {
  const { siteData } = useSiteData();
  const policy = buildPolicyContent({
    ...legalPageDefaults.refundPolicy,
    ...(siteData?.legalPages?.refundPolicy || {})
  });

  return (
    <PolicyPage
      description={policy.description}
      eyebrow={policy.eyebrow}
      panelKey="refundPolicy"
      sections={policy.sections}
      summary={policy.summary}
      title={policy.title}
    />
  );
}
