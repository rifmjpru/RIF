import { SubmissionForm } from "../components/SubmissionForm.jsx";
import { useSiteData } from "../components/SiteDataProvider.jsx";

export default function EnquiryPage() {
  const siteData = useSiteData().siteData;
  const meta = siteData?.formsMeta?.enquiry || siteData?.formsMeta?.incubatee;

  const fields = [
    { name: "name", label: "Full Name", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "phone", label: "Phone Number", required: true },
    { name: "organization", label: "Organization / Startup" },
    {
      name: "topic",
      label: "Enquiry Topic",
      type: "select",
      required: true,
      options: ["General Query", "Incubation Support", "Partnership", "Mentorship", "Membership", "Other"]
    },
    { name: "city", label: "City" },
    { name: "website", label: "Website", type: "url" },
    { name: "message", label: "Message", type: "textarea", span: 2, rows: 6, required: true },
    { name: "supportNeeds", label: "Specific Support Needed", type: "textarea", span: 2, rows: 4 }
  ];

  return (
    <SubmissionForm
      fields={fields}
      intro={meta?.intro}
      points={meta?.points}
      qrCode={{
        label: meta?.qrCodeLabel || "Quick Connect",
        title: meta?.qrCodeTitle || "General Enquiry QR",
        note:
          meta?.qrCodeNote ||
          "Dummy QR for now. You can later replace it from the admin panel with the final enquiry QR or WhatsApp/contact QR.",
        imageUrl: meta?.qrCodeImageUrl || ""
      }}
      submitLabel="Send Enquiry"
      submitType="enquiry"
      title={meta?.title}
    />
  );
}
