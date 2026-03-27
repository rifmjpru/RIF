import { useState } from "react";
import { api } from "../api/client.js";
import { resolveMediaUrl } from "../utils/media.js";

const defaultValueForField = (field) => field.defaultValue || "";

const initialStateFromFields = (fields) =>
  Object.fromEntries(fields.map((field) => [field.name, defaultValueForField(field)]));

const qrConnectUrl = "https://forms.gle/XTdecnwMjBqfrEvHA";

function DummyQrCode({ title }) {
  const label = (title || "RIF").slice(0, 18);

  return (
    <svg aria-label={title || "QR code placeholder"} className="form-qr-image" role="img" viewBox="0 0 160 160">
      <rect fill="#ffffff" height="160" rx="20" width="160" />
      <rect fill="#0f172a" height="34" rx="6" width="34" x="16" y="16" />
      <rect fill="#ffffff" height="16" rx="3" width="16" x="25" y="25" />
      <rect fill="#0f172a" height="34" rx="6" width="34" x="110" y="16" />
      <rect fill="#ffffff" height="16" rx="3" width="16" x="119" y="25" />
      <rect fill="#0f172a" height="34" rx="6" width="34" x="16" y="110" />
      <rect fill="#ffffff" height="16" rx="3" width="16" x="25" y="119" />
      <rect fill="#0f172a" height="10" rx="3" width="10" x="66" y="20" />
      <rect fill="#0f172a" height="10" rx="3" width="10" x="82" y="20" />
      <rect fill="#0f172a" height="10" rx="3" width="10" x="66" y="36" />
      <rect fill="#0f172a" height="10" rx="3" width="10" x="98" y="36" />
      <rect fill="#0f172a" height="10" rx="3" width="10" x="66" y="52" />
      <rect fill="#0f172a" height="10" rx="3" width="10" x="82" y="52" />
      <rect fill="#0f172a" height="10" rx="3" width="10" x="98" y="52" />
      <rect fill="#0f172a" height="10" rx="3" width="10" x="50" y="68" />
      <rect fill="#0f172a" height="10" rx="3" width="10" x="66" y="68" />
      <rect fill="#0f172a" height="10" rx="3" width="10" x="98" y="68" />
      <rect fill="#0f172a" height="10" rx="3" width="10" x="114" y="68" />
      <rect fill="#0f172a" height="10" rx="3" width="10" x="34" y="84" />
      <rect fill="#0f172a" height="10" rx="3" width="10" x="66" y="84" />
      <rect fill="#0f172a" height="10" rx="3" width="10" x="82" y="84" />
      <rect fill="#0f172a" height="10" rx="3" width="10" x="114" y="84" />
      <rect fill="#0f172a" height="10" rx="3" width="10" x="50" y="100" />
      <rect fill="#0f172a" height="10" rx="3" width="10" x="82" y="100" />
      <rect fill="#0f172a" height="10" rx="3" width="10" x="98" y="100" />
      <rect fill="#0f172a" height="10" rx="3" width="10" x="114" y="100" />
      <rect fill="#0f172a" height="10" rx="3" width="10" x="66" y="116" />
      <rect fill="#0f172a" height="10" rx="3" width="10" x="82" y="116" />
      <rect fill="#0f172a" height="10" rx="3" width="10" x="98" y="116" />
      <rect fill="#0f172a" height="10" rx="3" width="10" x="66" y="132" />
      <rect fill="#0f172a" height="10" rx="3" width="10" x="114" y="132" />
      <text fill="#64748b" fontFamily="Arial, Helvetica, sans-serif" fontSize="11" fontWeight="700" textAnchor="middle" x="80" y="152">
        {label}
      </text>
    </svg>
  );
}

export const SubmissionForm = ({
  title,
  intro,
  points,
  fields,
  submitType,
  beforeSubmit,
  onChange,
  onSuccess,
  note,
  submitLabel = "Submit",
  asideVisual = null,
  eyebrow = "Forms Module",
  qrCode = null,
  copyTopContent = null,
  copyFooter = null,
  formLead = null,
  sectionClassName = "",
  copyClassName = "",
  formClassName = ""
}) => {
  const [formState, setFormState] = useState(() => initialStateFromFields(fields));
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const handleChange = (name, value) => {
    setFormState((current) => {
      const next = {
        ...current,
        [name]: value
      };
      if (onChange) {
        onChange(name, value, next, setFormState);
      }
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (beforeSubmit) {
      const shouldContinue = await beforeSubmit({ formState, setFormState, setStatus, setMessage });
      if (!shouldContinue) {
        return;
      }
    }

    try {
      setStatus("loading");
      const result = await api.submitForm(submitType, formState);
      setStatus("success");
      setMessage(result.message);
      setFormState(initialStateFromFields(fields));
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
    }
  };

  return (
    <section className={sectionClassName ? `form-shell ${sectionClassName}` : "form-shell"}>
      <div className={copyClassName ? `form-copy ${copyClassName}` : "form-copy"}>
        <p className="section-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {copyTopContent}
        {note ? <p className="form-note form-note-alert">{note}</p> : null}
        <p>{intro}</p>
        <ul className="bullet-list">
          {points?.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        {qrCode ? (
          <section className="form-qr-card">
            <div className="form-qr-copy">
              <p className="form-qr-label">{qrCode.label || "Quick Scan"}</p>
              <h3>{qrCode.title || "Scan this QR code"}</h3>
              {qrCode.note ? <p>{qrCode.note}</p> : null}
            </div>
            <div className="qr-action-stack">
              <div className="form-qr-preview">
                {qrCode.imageUrl ? (
                  <img
                    alt={qrCode.title || "QR code"}
                    className="form-qr-image"
                    src={resolveMediaUrl(qrCode.imageUrl, qrCode.title || "QR code")}
                  />
                ) : (
                  <DummyQrCode title={qrCode.title} />
                )}
              </div>
              <a className="button button-small qr-connect-action" href={qrConnectUrl} rel="noreferrer" target="_blank">
                Click to Connect
              </a>
            </div>
          </section>
        ) : null}
        {asideVisual ? <div className="form-copy-visual">{asideVisual}</div> : null}
        {copyFooter}
      </div>
      <form className={formClassName ? `form-card ${formClassName}` : "form-card"} onSubmit={handleSubmit}>
        {formLead ? <div className="form-card-lead">{formLead}</div> : null}
        <div className="field-grid">
          {fields.map((field) => (
            <label key={field.name} className={field.span === 2 ? "field field-span-2" : "field"}>
              <span>{field.label}</span>
              {field.type === "textarea" ? (
                <textarea
                  name={field.name}
                  placeholder={field.placeholder}
                  required={field.required}
                  rows={field.rows || 5}
                  value={formState[field.name]}
                  onChange={(event) => handleChange(field.name, event.target.value)}
                />
              ) : field.type === "select" ? (
                <select
                  name={field.name}
                  required={field.required}
                  value={formState[field.name]}
                  onChange={(event) => handleChange(field.name, event.target.value)}
                >
                  <option value="">{field.placeholder || "Select"}</option>
                  {field.options?.map((option) => {
                    const value = typeof option === "object" ? option.value : option;
                    const label = typeof option === "object" ? option.label : option;
                    return (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              ) : (
                <input
                  name={field.name}
                  placeholder={field.placeholder}
                  required={field.required}
                  type={field.type || "text"}
                  value={formState[field.name]}
                  onChange={(event) => handleChange(field.name, event.target.value)}
                />
              )}
            </label>
          ))}
        </div>
        <button className="button" disabled={status === "loading"} type="submit">
          {status === "loading" ? "Submitting..." : submitLabel}
        </button>
        {message ? <p className={`form-message form-message-${status}`}>{message}</p> : null}
      </form>
    </section>
  );
};
