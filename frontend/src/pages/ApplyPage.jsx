import { useState } from "react";
import { SubmissionForm } from "../components/SubmissionForm.jsx";
import { useSiteData } from "../components/SiteDataProvider.jsx";

function formatFee(amount) {
  return amount ? `Rs. ${amount}` : "Online payment";
}

function ApplySidebarTop({ paymentAmount }) {
  return (
    <>
      <div className="apply-premium-badges">
        <span>Founder-first review</span>
        <span>Institution-backed</span>
        <span>Confidential submission</span>
      </div>
      <div className="apply-premium-proof-grid">
        <article className="apply-premium-proof-card">
          <strong>{formatFee(paymentAmount)}</strong>
          <span>Application fee</span>
        </article>
        <article className="apply-premium-proof-card">
          <strong>3 steps</strong>
          <span>Screening process</span>
        </article>
        <article className="apply-premium-proof-card">
          <strong>20 min</strong>
          <span>Typical completion</span>
        </article>
      </div>
    </>
  );
}

function ApplySidebarFooter() {
  const processSteps = [
    {
      id: "01",
      title: "Tell us your story",
      description: "Share your venture, traction, and the kind of incubation support you are looking for."
    },
    {
      id: "02",
      title: "Internal review",
      description: "Our team screens the submission for program fit, readiness, and follow-up requirements."
    },
    {
      id: "03",
      title: "Next-step outreach",
      description: "Shortlisted founders are contacted for discussion, validation, and the next round of evaluation."
    }
  ];

  return (
    <div className="apply-premium-process">
      <div className="apply-premium-process-head">
        <p>What happens next</p>
        <h3>A clean, professional intake that moves quickly from form to review.</h3>
      </div>
      <div className="apply-premium-process-list">
        {processSteps.map((step) => (
          <article className="apply-premium-process-card" key={step.id}>
            <span className="apply-premium-process-index">{step.id}</span>
            <div>
              <h4>{step.title}</h4>
              <p>{step.description}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function ApplyFormLead({ paymentAmount }) {
  return (
    <div className="apply-premium-form-lead">
      <div className="apply-premium-form-headline">
        <div>
          <p className="apply-premium-form-kicker">Founder Intake</p>
          <h2>Complete your application with clear venture details.</h2>
        </div>
        <div className="apply-premium-form-fee">{formatFee(paymentAmount)}</div>
      </div>
      <div className="apply-premium-form-meta">
        <span>Use official startup details where available</span>
        <span>Keep traction and problem statements concise</span>
        <span>Online payment happens before final submission</span>
      </div>
    </div>
  );
}

function ApplyFormIllustration() {
  return (
    <div aria-hidden="true" className="apply-form-illustration">
      <div className="apply-form-illustration-badges">
        <span>Pitch ready</span>
        <span>Mentor backed</span>
        <span>Go to launch</span>
      </div>
      <svg
        className="apply-form-illustration-graphic"
        fill="none"
        viewBox="0 0 420 280"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="applySky" x1="50" x2="350" y1="24" y2="252" gradientUnits="userSpaceOnUse">
            <stop stopColor="#EFF5FF" />
            <stop offset="1" stopColor="#D9E8FF" />
          </linearGradient>
          <linearGradient id="applyRocketBody" x1="172" x2="256" y1="60" y2="186" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFF8F5" />
            <stop offset="1" stopColor="#FFD8D0" />
          </linearGradient>
          <linearGradient id="applyTrail" x1="184" x2="154" y1="184" y2="242" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFB05C" />
            <stop offset="1" stopColor="#FFF1D8" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        <rect fill="url(#applySky)" height="280" rx="34" width="420" />
        <circle cx="334" cy="70" fill="#FFF4C4" r="28" />
        <circle cx="100" cy="78" fill="#FFFFFF" opacity="0.8" r="20" />
        <circle cx="126" cy="82" fill="#FFFFFF" opacity="0.8" r="15" />
        <circle cx="84" cy="84" fill="#FFFFFF" opacity="0.8" r="13" />
        <path
          d="M118 220C118 198.461 135.461 181 157 181H263C284.539 181 302 198.461 302 220V221H118V220Z"
          fill="#F4F8FF"
          stroke="#B9CCF4"
          strokeWidth="2"
        />
        <path d="M176 181H244V221H176V181Z" fill="#FFFFFF" stroke="#B9CCF4" strokeWidth="2" />
        <path d="M196 146L159 186H188L210 163L232 186H261L224 146H196Z" fill="#1F4DA7" opacity="0.12" />
        <path d="M210 70C236 88 254 117 256 152L210 184L164 152C166 117 184 88 210 70Z" fill="url(#applyRocketBody)" />
        <path d="M210 70C236 88 254 117 256 152L210 184V70Z" fill="#FFD0C6" />
        <path d="M210 70C236 88 254 117 256 152L210 184L164 152C166 117 184 88 210 70Z" stroke="#1F4DA7" strokeWidth="4" />
        <circle cx="210" cy="126" fill="#1F4DA7" r="16" />
        <circle cx="210" cy="126" fill="#8FC3FF" r="9" />
        <path d="M180 154L154 179L180 183L196 164L180 154Z" fill="#CE2026" stroke="#1F4DA7" strokeWidth="4" />
        <path d="M240 154L266 179L240 183L224 164L240 154Z" fill="#CE2026" stroke="#1F4DA7" strokeWidth="4" />
        <path d="M194 182H226L210 211L194 182Z" fill="#1F4DA7" />
        <path d="M210 183L184 241H236L210 183Z" fill="url(#applyTrail)" />
        <path d="M163 111C148 115 136 124 128 138" stroke="#89A9EB" strokeLinecap="round" strokeWidth="6" />
        <path d="M257 111C272 115 284 124 292 138" stroke="#89A9EB" strokeLinecap="round" strokeWidth="6" />
        <circle cx="154" cy="58" fill="#CE2026" opacity="0.12" r="12" />
        <circle cx="280" cy="102" fill="#1F4DA7" opacity="0.12" r="10" />
        <path
          d="M150 232C158.284 232 165 225.284 165 217C165 208.716 158.284 202 150 202C141.716 202 135 208.716 135 217C135 225.284 141.716 232 150 232Z"
          fill="#FFFFFF"
          stroke="#B9CCF4"
          strokeWidth="2"
        />
        <path d="M144 217L149 222L157 212" stroke="#0EA568" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
        <path d="M278 212H332" stroke="#1F4DA7" strokeLinecap="round" strokeWidth="6" />
        <path d="M278 228H316" stroke="#8AA5DA" strokeLinecap="round" strokeWidth="6" />
        <path d="M278 244H302" stroke="#CEDAF4" strokeLinecap="round" strokeWidth="6" />
      </svg>
      <p className="apply-form-illustration-caption">
        Share your startup story, and we will route it toward mentoring, incubation support, and the next milestone.
      </p>
    </div>
  );
}

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
    { name: "dpittNumber", label: "DPIIT No. ", required: true },
    { name: "incorporationNumber", label: "Incorporation Reg. No." , required:true },
    { name: "incorporationDate", label: "Incorporation Reg. Date", type: "date" , required:true },
    { name: "address", label: "Official Address", span: 2 , required:true },
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
    { name: "teamSize", label: "Team Size" , type:"number",required:true},
    { name: "traction", label: "Traction So Far (optional)", type: "textarea", span: 2, rows: 4 },
    { name: "supportNeeded", label: "Support Needed (optional)", type: "textarea", span: 2, rows: 4 },
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
      asideVisual={<ApplyFormIllustration />}
      beforeSubmit={handleBeforeSubmit}
      copyClassName="form-copy-apply-premium"
      copyFooter={<ApplySidebarFooter />}
      copyTopContent={<ApplySidebarTop paymentAmount={paymentAmount} />}
      onChange={handleFieldChange}
      onSuccess={handleSuccess}
      eyebrow="Apply Now"
      fields={fields}
      formClassName="form-card-apply-premium"
      formLead={<ApplyFormLead paymentAmount={paymentAmount} />}
      intro={meta?.intro}
      points={meta?.points}
      qrCode={{
        label: meta?.qrCodeLabel || "Scan to Pay",
        title: meta?.qrCodeTitle || "Application Payment QR",
        note: meta?.qrCodeNote || "Dummy QR for now. Replace this from the admin panel whenever the final payment QR is ready.",
        imageUrl: meta?.qrCodeImageUrl || ""
      }}
      sectionClassName="form-shell-apply-premium"
      submitType="apply"
      title={meta?.title}
    />
  );
}
