"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import BtnIcon from "@/components/ui/BtnIcon";
import { submitEnquiry, validate } from "@/lib/enquiry";
import { readPlanner, onPlannerChange } from "@/lib/plannerStore";
import { currencies, durations, objectives } from "@/data/planner";
import { screenTypes } from "@/data/network";
import { site } from "@/data/site";
import { track, EVENTS } from "@/lib/analytics";
import styles from "./EnquiryForm.module.css";

/**
 * One form, three variants: "advertising" | "product" | "contact".
 * Without a configured endpoint it runs in preview mode (nothing is sent).
 */
const SOURCES = ["Search engine", "Social media", "Referral", "Saw a screen", "Other"];
const TOPICS = ["Buying screens", "Advertising", "Support", "Partnership", "Other"];

const RULES = {
  advertising: {
    name: ["required"], company: ["required"], email: ["required", "email"], phone: ["phone"],
    location: ["required"], budget: ["required"], consent: ["checked"],
  },
  product: {
    name: ["required"], email: ["required", "email"], phone: ["phone"],
    deliveryLocation: ["required"], quantity: ["required"], consent: ["checked"],
  },
  contact: {
    name: ["required"], email: ["required", "email"], phone: ["phone"],
    message: ["required"], consent: ["checked"],
  },
};

function briefFromPlanner(p) {
  if (!p) return "";
  const lines = [];
  const dur = durations.find((d) => d.id === p.duration)?.label;
  const obj = objectives.find((o) => o.id === p.objective)?.label;
  const types = (p.types || []).map((t) => screenTypes.find((s) => s.id === t)?.label).filter(Boolean);
  if (p.area && p.area !== "any") lines.push(`Preferred area: ${p.area}`);
  if (types.length) lines.push(`Screen types: ${types.join(", ")}`);
  if (p.screens?.length) lines.push(`Screens of interest: ${p.screens.join(", ")}`);
  if (obj) lines.push(`Objective: ${obj}`);
  if (dur && !p.duration?.startsWith("custom")) lines.push(`Duration: ${dur}`);
  if (p.startDate) lines.push(`Preferred start: ${p.startDate}`);
  return lines.join("\n");
}

export default function EnquiryForm({ variant = "contact", product, defaults = {}, title, compact = false }) {
  const id = useId();
  const formRef = useRef(null);
  const [values, setValues] = useState(() => ({
    name: "", company: "", email: "", phone: "", location: "", message: "",
    budget: "", currency: "USD", duration: "1m", preferences: "",
    quantity: 1, deliveryLocation: "", topic: TOPICS[0], source: "", consent: false,
    ...defaults,
  }));
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | done | error
  const [result, setResult] = useState(null);
  const [fromPlanner, setFromPlanner] = useState(false);

  // Advertising: preserve planner selections (restored + live updates).
  useEffect(() => {
    if (variant !== "advertising") return;
    const apply = (p) => {
      if (!p) return;
      setFromPlanner(true);
      setValues((v) => ({
        ...v,
        budget: p.budget ?? v.budget,
        currency: p.currency ?? v.currency,
        duration: p.duration ?? v.duration,
        preferences: briefFromPlanner(p) || v.preferences,
      }));
    };
    apply(readPlanner());
    return onPlannerChange(apply);
  }, [variant]);

  useEffect(() => {
    if (defaults.quantity != null || defaults.deliveryLocation != null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync with product page selectors
      setValues((v) => ({ ...v, ...defaults }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaults.quantity, defaults.deliveryLocation]);

  const set = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (status === "sending") return; // prevent repeat submissions
    const errs = validate(values, RULES[variant]);
    setErrors(errs);
    const firstError = Object.keys(errs).find((k) => errs[k]);
    if (firstError) {
      formRef.current?.querySelector(`[name="${firstError}"]`)?.focus();
      return;
    }
    setStatus("sending");
    try {
      const payload = { ...values, enquirySource: values.source || "website", ...(product && { sku: product.sku, product: product.name }) };
      const res = await submitEnquiry(variant, payload);
      setResult(res);
      setStatus("done");
      const event = { advertising: EVENTS.AD_ENQUIRY, product: EVENTS.PRODUCT_ENQUIRY, contact: EVENTS.CONTACT_SUBMIT }[variant];
      // No personal data in analytics.
      track(event, { section: "enquiry", ...(product && { sku: product.sku }), ...(variant === "advertising" && { currency: values.currency, duration: values.duration }) });
    } catch {
      setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <div className={styles.success} role="status" tabIndex={-1} ref={(el) => el?.focus()}>
        <span className={styles.successIcon}><Icon name="check" size={28} strokeWidth={2.4} /></span>
        <h3>Thanks, {values.name.split(" ")[0] || "we've got it"}.</h3>
        {result?.preview ? (
          <p>
            Your enquiry passed all checks. <strong>Preview mode:</strong> this website is not yet
            connected to Illuvision&rsquo;s enquiry system, so nothing has been sent or stored.
          </p>
        ) : (
          <p>The Illuvision team will review your {variant === "advertising" ? "brief" : "enquiry"} and get back to you.</p>
        )}
        {variant === "advertising" && (
          <p className="muted">Submitting this form does not reserve or book a campaign.</p>
        )}
        <button type="button" className="text-link" onClick={() => { setStatus("idle"); setResult(null); }}>
          Send another enquiry
        </button>
      </div>
    );
  }

  const fieldId = (name) => (name === "name" && variant === "advertising" ? "enquiry-name" : `${id}-${name}`);

  const inputProps = (name, extra = {}) => ({
    id: fieldId(name),
    name,
    className: "input",
    value: values[name],
    onChange: set(name),
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${id}-${name}-err` : undefined,
    ...extra,
  });

  const field = (name, label, input, { hint, wide } = {}) => (
    <div className="field" style={wide ? { gridColumn: "1 / -1" } : undefined}>
      <label htmlFor={fieldId(name)}>{label}</label>
      {input}
      {hint && <span className="hint">{hint}</span>}
      {errors[name] && (
        <span className="field-error" id={`${id}-${name}-err`}>{errors[name]}</span>
      )}
    </div>
  );

  return (
    <form ref={formRef} className={`${styles.form} ${compact ? styles.compact : ""}`} onSubmit={onSubmit} noValidate>
      {title && <h3 className={styles.title}>{title}</h3>}

      {variant === "advertising" && fromPlanner && (
        <p className={styles.prefill}>
          <Icon name="check" size={16} /> Your planner selections have been added below.
        </p>
      )}

      <div className={styles.grid}>
        {field("name", "Full name *", <input {...inputProps("name", { autoComplete: "name" })} />)}
        {field("company", variant === "advertising" ? "Business / company *" : "Company", <input {...inputProps("company", { autoComplete: "organization" })} />)}
        {field("email", "Email *", <input {...inputProps("email", { type: "email", autoComplete: "email", inputMode: "email" })} />)}
        {field("phone", "Phone", <input {...inputProps("phone", { type: "tel", autoComplete: "tel", inputMode: "tel" })} />)}

        {variant === "advertising" && (
          <>
            {field("location", "Your city / country *", <input {...inputProps("location", { autoComplete: "country-name" })} />)}
            <div className={`field ${styles.budget}`}>
              <label htmlFor={fieldId("budget")}>Budget *</label>
              <div className={styles.budgetRow}>
                <select className="input" aria-label="Currency" value={values.currency} onChange={set("currency")} name="currency">
                  {currencies.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}
                </select>
                <input {...inputProps("budget", { type: "number", min: 0, inputMode: "numeric" })} />
              </div>
              {errors.budget && <span className="field-error" id={`${id}-budget-err`}>{errors.budget}</span>}
            </div>
            {field("duration", "Campaign duration", <select {...inputProps("duration")}>
                {durations.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
              </select>)}
            {field("source", "How did you hear about us?", <select {...inputProps("source")}>
                <option value="">Select an option</option>
                {SOURCES.map((s) => <option key={s}>{s}</option>)}
              </select>)}
            {field("preferences", "Preferred screens, locations or other details", <textarea {...inputProps("preferences", { rows: 5 })} />, { wide: true })}
          </>
        )}

        {variant === "product" && (
          <>
            {field("quantity", "Quantity *", <input {...inputProps("quantity", { type: "number", min: 1, inputMode: "numeric" })} />)}
            {field("deliveryLocation", "Delivery location *", <input {...inputProps("deliveryLocation", { autoComplete: "country-name" })} />, { hint:"City and country" })}
            {field("message", "Project details", <textarea {...inputProps("message", { rows: 4, placeholder: "Where will the screen be installed? Any size or timing requirements?" })} />, { wide: true })}
          </>
        )}

        {variant === "contact" && (
          <>
            {field("topic", "Topic", <select {...inputProps("topic")}>
                {TOPICS.map((t) => <option key={t}>{t}</option>)}
              </select>, { wide: true })}
            {field("message", "Message *", <textarea {...inputProps("message", { rows: 5 })} />, { wide: true })}
          </>
        )}
      </div>

      <div className={styles.consent}>
        <label className="check">
          <input
            type="checkbox"
            name="consent"
            checked={values.consent}
            onChange={set("consent")}
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? `${id}-consent-err` : undefined}
          />
          <span>
            I agree that Illuvision may contact me about this enquiry and process my details as
            described in the <Link href="/privacy" className="text-link">privacy notice</Link>. *
          </span>
        </label>
        {errors.consent && <span className="field-error" id={`${id}-consent-err`}>{errors.consent}</span>}
      </div>

      {status === "error" && (
        <p className="notice" role="alert">
          <Icon name="info" />
          <span>Something went wrong sending your enquiry. Please try again.</span>
        </p>
      )}

      <div className={styles.actions}>
        <button type="submit" className="btn" disabled={status === "sending"} aria-busy={status === "sending"}>
          {status === "sending" ? (
            <BtnIcon>
              <span className={styles.spinner} />
            </BtnIcon>
          ) : (
            <BtnIcon name="arrow" />
          )}
          <span>
            {status === "sending"
              ? "Sending…"
              : variant === "advertising"
                ? "Send campaign enquiry"
                : variant === "product"
                  ? "Request quote"
                  : "Send message"}
          </span>
        </button>
        {!site.enquiryEndpoint && (
          <p className={styles.previewNote}>
            Preview mode: form submission is not yet connected to a backend.
          </p>
        )}
      </div>
    </form>
  );
}
