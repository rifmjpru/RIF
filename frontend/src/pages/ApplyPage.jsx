import { SubmissionForm } from "../components/SubmissionForm.jsx";
import { useSiteData } from "../components/SiteDataProvider.jsx";

export default function ApplyPage() {
  const meta = useSiteData().siteData?.formsMeta?.apply;
  const paymentAmount = meta?.paymentAmount;
  const paymentModes = meta?.paymentModes?.length ? meta.paymentModes : ["Cheque", "ECS", "Online Transfer"];

  const fields = [
    { name: "name", label: "Full Name", required: true },
    { name: "mobile", label: "Mobile Number", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "startupName", label: "Startup Name", required: true },
    { name: "industry", label: "Industry", required: true },
    { name: "sector", label: "Sector" },
    { name: "category", label: "Category" },
    { name: "dpittNumber", label: "DPIIT No. (optional)" },
    { name: "incorporationNumber", label: "Incorporation Reg. No." },
    { name: "incorporationDate", label: "Incorporation Reg. Date", type: "date" },
    { name: "address", label: "Official Address", span: 2 },
    { name: "funding", label: "Funding / Grants (if any)", span: 2 },
    {
      name: "stage",
      label: "Current Stage",
      type: "select",
      options: ["Ideation", "Validation", "Scaling", "Early Traction"],
      required: true
    },
    {
      name: "problemStatement",
      label: "Problem Statement",
      type: "textarea",
      required: true,
      span: 2,
      rows: 5
    },
    {
      name: "businessConcept",
      label: "Brief on the Business Concept (optional, letterhead accepted)",
      type: "textarea",
      required: false,
      span: 2,
      rows: 5
    },
    { name: "teamSize", label: "Team Size" },
    { name: "traction", label: "Traction So Far", type: "textarea", span: 2, rows: 4 },
    { name: "supportNeeded", label: "Support Needed", type: "textarea", span: 2, rows: 4 },
    {
      name: "paymentMode",
      label: paymentAmount ? `Mode of Payment (Fee: ₹${paymentAmount})` : "Mode of Payment",
      type: "select",
      options: paymentModes,
      required: true
    },
    { name: "paymentReference", label: "Payment Reference / Notes", placeholder: "Txn ID, cheque no., etc." }
  ];

  return <SubmissionForm fields={fields} intro={meta?.intro} points={meta?.points} submitType="apply" title={meta?.title} />;
}
