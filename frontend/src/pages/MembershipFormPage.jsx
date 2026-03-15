import { SubmissionForm } from "../components/SubmissionForm.jsx";
import { useSiteData } from "../components/SiteDataProvider.jsx";

const fields = [
  { name: "name", label: "Full Name", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "organization", label: "Organization", required: true },
  {
    name: "planName",
    label: "Membership Plan",
    type: "select",
    options: ["Community", "Builder", "Institutional Partner"],
    required: true
  },
  { name: "role", label: "Role / Designation" },
  {
    name: "engagementGoal",
    label: "How do you want to engage?",
    type: "textarea",
    required: true,
    span: 2,
    rows: 5
  },
  { name: "notes", label: "Additional Notes", type: "textarea", span: 2, rows: 4 }
];

export default function MembershipFormPage() {
  const meta = useSiteData().siteData?.formsMeta?.membership;

  return (
    <SubmissionForm fields={fields} intro={meta?.intro} points={meta?.points} submitType="membership" title={meta?.title} />
  );
}

