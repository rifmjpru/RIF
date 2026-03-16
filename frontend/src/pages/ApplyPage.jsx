import { useState } from "react";
import { SubmissionForm } from "../components/SubmissionForm.jsx";
import { useSiteData } from "../components/SiteDataProvider.jsx";

export default function ApplyPage() {
  const [paymentVerified, setPaymentVerified] = useState(false);
  const meta = useSiteData().siteData?.formsMeta?.apply;
  const paymentAmount = meta?.paymentAmount ?? 750;
  const basePaymentModes = ["Online"];
  const normalizedPaymentModes = basePaymentModes.map((mode) => (mode === "Razorpay" ? "Online" : mode));
  const paymentModes = normalizedPaymentModes.includes("Online") ? normalizedPaymentModes : [...normalizedPaymentModes, "Online"];

  const formatPrice = (price) => {
    if (!price && price !== 0) return "";
    const cleaned = String(price).trim().replace(/^₹\s*/, "");
    return cleaned;
  };

  const parseAmountToPaise = (rawAmount) => {
    if (rawAmount === undefined || rawAmount === null) return 0;
    const cleaned = formatPrice(rawAmount).replace(/,/g, "");
    const numeric = Number(cleaned);
    if (!Number.isFinite(numeric) || numeric <= 0) return 0;
    return Math.round(numeric * 100);
  };

  const loadRazorpayScript = () =>
    new Promise((resolve, reject) => {
      if (window.Razorpay) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });

  const handleBeforeSubmit = async ({ formState, setFormState, setStatus, setMessage }) => {
    if (formState.paymentMode !== "Online") return true;
    if (paymentVerified) return true;

    setFormState((current) => ({
      ...current,
      paymentId: "",
      paymentOrderId: "",
      paymentSignature: ""
    }));

    const amountPaise = parseAmountToPaise(paymentAmount);
    if (!amountPaise) {
      setStatus("error");
      setMessage("Payment amount not set. Please contact support.");
      return false;
    }

    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!razorpayKey) {
      setStatus("error");
      setMessage("Razorpay key is missing. Please set VITE_RAZORPAY_KEY_ID in your environment.");
      return false;
    }

    setStatus("loading");

    try {
      await loadRazorpayScript();
    } catch (error) {
      setStatus("error");
      setMessage("Unable to load Razorpay checkout. Check your connection and try again.");
      return false;
    }

    return await new Promise((resolve) => {
      const razorpay = new window.Razorpay({
        key: razorpayKey,
        amount: amountPaise,
        currency: "INR",
        name: "Application Fee",
        description: "Apply",
        prefill: {
          name: formState.name,
          email: formState.email
        },
        notes: {
          startupName: formState.startupName
        },
        handler: (response) => {
          setFormState((current) => ({
            ...current,
            paymentMode: "Online",
            paymentId: response.razorpay_payment_id,
            paymentOrderId: response.razorpay_order_id,
            paymentSignature: response.razorpay_signature
          }));
          setPaymentVerified(true);
          setStatus("idle");
          alert("Payment done. Please submit the form to finish.");
          resolve(false);
        },
        modal: {
          ondismiss: () => {
            setStatus("idle");
            resolve(false);
          }
        }
      });

      razorpay.open();
    });
  };

  const handleFieldChange = (name) => {
    if (paymentVerified && name === "paymentMode") {
      setPaymentVerified(false);
    }
  };

  const handleSuccess = () => {
    setPaymentVerified(false);
  };

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
    }
  ];

  return (
    <SubmissionForm
      beforeSubmit={handleBeforeSubmit}
      onChange={handleFieldChange}
      onSuccess={handleSuccess}
      fields={fields}
      intro={meta?.intro}
      points={meta?.points}
      submitType="apply"
      title={meta?.title}
    />
  );
}
