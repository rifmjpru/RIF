import { useState } from "react";
import { api } from "../api/client.js";

const defaultValueForField = (field) => field.defaultValue || "";

const initialStateFromFields = (fields) =>
  Object.fromEntries(fields.map((field) => [field.name, defaultValueForField(field)]));

export const SubmissionForm = ({ title, intro, points, fields, submitType, beforeSubmit, onChange, onSuccess }) => {
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
    <section className="form-shell">
      <div className="form-copy">
        <p className="section-eyebrow">Forms Module</p>
        <h1>{title}</h1>
        <p>{intro}</p>
        <ul className="bullet-list">
          {points?.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </div>
      <form className="form-card" onSubmit={handleSubmit}>
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
          {status === "loading" ? "Submitting..." : "Submit"}
        </button>
        {message ? <p className={`form-message form-message-${status}`}>{message}</p> : null}
      </form>
    </section>
  );
};
