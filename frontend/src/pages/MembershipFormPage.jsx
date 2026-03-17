import { SubmissionForm } from "../components/SubmissionForm.jsx";
import { useSiteData } from "../components/SiteDataProvider.jsx";
import { useState } from "react";

export default function MembershipFormPage() {
  const [paymentVerified, setPaymentVerified] = useState(false);
  const siteData = useSiteData().siteData;
  const meta = siteData?.formsMeta?.membership;
  const paymentAmount = meta?.paymentAmount;
  const offlinePaymentNote =
    "For cheque or ECS payments, please contact the RIF team or visit the RIF office before proceeding.";

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

  const membershipPlanOptions = (siteData?.membershipPlans || [])
    .map((plan) => {
      if (!plan?.name) return null;
      const price = formatPrice(plan.price);
      return {
        value: plan.name,
        label: price ? `${plan.name} (₹${price})` : plan.name
      };
    })
    .filter(Boolean);
  const planOptions =
    membershipPlanOptions.length > 0
      ? membershipPlanOptions
      : [
          { value: "Community", label: "Community" },
          { value: "Builder", label: "Builder" },
          { value: "Institutional Partner", label: "Institutional Partner" }
        ];

  const basePaymentModes = meta?.paymentModes?.length ? meta.paymentModes : ["Online"];
  const cleanedPaymentModes = basePaymentModes.filter((mode) => (mode || "").toLowerCase() !== "cheque");
  const normalizedPaymentModes = cleanedPaymentModes.map((mode) => (mode === "Razorpay" ? "Online" : mode));
  const paymentModes = normalizedPaymentModes.includes("Online") ? normalizedPaymentModes : [...normalizedPaymentModes, "Online"];

  const fields = [
    { name: "name", label: "Full Name", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "organization", label: "Organization", required: true },
    {
      name: "planName",
      label: "Membership Plan",
      type: "select",
      options: planOptions,
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
    {
      name: "paymentMode",
      label: paymentAmount ? `Mode of Payment (Fee: ₹${paymentAmount})` : "Mode of Payment",
      type: "select",
      options: paymentModes,
      required: true
    },
    { name: "notes", label: "Additional Notes", type: "textarea", span: 2, rows: 4 }
  ];

  const getSelectedPlanAmountPaise = (planName) => {
    const selectedPlan = (siteData?.membershipPlans || []).find((plan) => plan?.name === planName);
    const amountSource = selectedPlan?.price ?? paymentAmount;
    return parseAmountToPaise(amountSource);
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

    if (paymentVerified) {
      return true;
    }

    // Clear any stale payment identifiers when starting a new payment attempt.
    setFormState((current) => ({
      ...current,
      paymentId: "",
      paymentOrderId: "",
      paymentSignature: ""
    }));

    const amountPaise = getSelectedPlanAmountPaise(formState.planName);
    if (!amountPaise) {
      setStatus("error");
      setMessage("Select a membership plan with a valid amount before paying online.");
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
        name: "Membership Fee",
        description: formState.planName || "Membership",
        prefill: {
          name: formState.name,
          email: formState.email
        },
        notes: {
          plan: formState.planName,
          organization: formState.organization
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
          resolve(false); // wait for user to submit the form after successful payment
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
    if (paymentVerified && (name === "paymentMode" || name === "planName")) {
      setPaymentVerified(false);
    }
  };

  const handleSuccess = () => {
    setPaymentVerified(false);
  };

  return (
    <SubmissionForm
      beforeSubmit={handleBeforeSubmit}
      onChange={handleFieldChange}
      onSuccess={handleSuccess}
      fields={fields}
      intro={meta?.intro}
      points={meta?.points}
      submitType="membership"
      title={meta?.title}
      note={offlinePaymentNote}
    />
  );
}
