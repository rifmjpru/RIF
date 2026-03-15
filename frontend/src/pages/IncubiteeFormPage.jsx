import { SubmissionForm } from "../components/SubmissionForm.jsx";
import { useSiteData } from "../components/SiteDataProvider.jsx";

const fields = [
  { name: "founderName", label: "Founder Name", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "ventureName", label: "Venture Name", required: true },
  { name: "sector", label: "Sector", required: true },
  { name: "stage", label: "Stage", required: true },
  { name: "location", label: "Location / City" },
  { name: "website", label: "Website", type: "url" },
  { name: "supportNeeds", label: "Support Needs", type: "textarea", span: 2, rows: 5 }
];

export default function IncubiteeFormPage() {
  const meta = useSiteData().siteData?.formsMeta?.incubitee;

  return (
    <SubmissionForm fields={fields} intro={meta?.intro} points={meta?.points} submitType="incubitee" title={meta?.title} />
  );
}

