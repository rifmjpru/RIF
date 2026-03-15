import { SubmissionForm } from "../components/SubmissionForm.jsx";
import { useSiteData } from "../components/SiteDataProvider.jsx";

const fields = [
  { name: "name", label: "Full Name", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "startupName", label: "Startup Name", required: true },
  { name: "stage", label: "Startup Stage", type: "select", options: ["Idea", "Validation", "Pilot", "Growth"], required: true },
  { name: "teamSize", label: "Team Size" },
  {
    name: "problemStatement",
    label: "Problem Statement",
    type: "textarea",
    required: true,
    span: 2,
    rows: 5
  },
  { name: "traction", label: "Traction So Far", type: "textarea", span: 2, rows: 4 },
  { name: "supportNeeded", label: "Support Needed", type: "textarea", span: 2, rows: 4 }
];

export default function ApplyPage() {
  const meta = useSiteData().siteData?.formsMeta?.apply;

  return <SubmissionForm fields={fields} intro={meta?.intro} points={meta?.points} submitType="apply" title={meta?.title} />;
}

