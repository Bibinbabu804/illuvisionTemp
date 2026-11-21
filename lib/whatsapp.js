import { site } from "../data/site.js";

/**
 * Retrieve the single configured business WhatsApp number from site config.
 */
export function getBusinessWhatsAppNumber() {
  return site.contact?.whatsapp ?? null;
}

/**
 * Normalize a configured business WhatsApp phone number to E.164 digits only (no + or spaces).
 * Returns null if missing or invalid — never introduces a hardcoded fallback number.
 */
export function normalizeWhatsAppNumber(rawNumber) {
  if (rawNumber == null) return null;
  const digits = String(rawNumber).replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) {
    return null;
  }
  return digits;
}

/**
 * Sanitize user-supplied text for clean WhatsApp message rendering.
 * Strips control characters while preserving normal punctuation, Unicode, and newlines.
 */
export function sanitizeWhatsAppText(value) {
  if (value == null) return "";
  return String(value)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
}

function appendLine(lines, label, value) {
  const clean = sanitizeWhatsAppText(value);
  if (clean) {
    lines.push(`${label}: ${clean}`);
  }
}

/**
 * Build a standard WhatsApp Web / mobile deep link:
 * https://wa.me/{business_number}?text={encoded_message}
 */
export function buildWhatsAppUrl(rawNumber, message) {
  const normalized = normalizeWhatsAppNumber(rawNumber);
  if (!normalized) {
    return {
      ok: false,
      url: null,
      error: "WhatsApp business number is not configured. Please contact us directly.",
    };
  }

  const trimmedMessage = sanitizeWhatsAppText(message);
  if (!trimmedMessage) {
    return {
      ok: false,
      url: null,
      error: "Unable to prepare WhatsApp enquiry message.",
    };
  }

  return {
    ok: true,
    phone: normalized,
    url: `https://wa.me/${normalized}?text=${encodeURIComponent(trimmedMessage)}`,
    error: null,
  };
}

/**
 * Build a WhatsApp click-to-chat URL using the website's configured business number.
 */
export function buildBusinessWhatsAppUrl(message) {
  return buildWhatsAppUrl(getBusinessWhatsAppNumber(), message);
}

/**
 * General / Contact inquiry message template.
 */
export function buildContactInquiryMessage({ name, company, email, phone, topic, message }) {
  const lines = ["Hello, I would like to make an inquiry.", ""];
  appendLine(lines, "Name", name);
  appendLine(lines, "Company", company);
  appendLine(lines, "Email", email);
  appendLine(lines, "Phone", phone);
  appendLine(lines, "Subject", topic);
  appendLine(lines, "Message", message);
  lines.push("", "Please contact me regarding this inquiry.");
  return lines.join("\n");
}

/**
 * Product inquiry message template.
 */
export function buildProductInquiryMessage({
  productName,
  productUrl,
  variantLabel,
  pricingTier,
  quantity,
  deliveryLocation,
  name,
  company,
  email,
  phone,
  message,
}) {
  const lines = ["Hello, I am interested in the following product.", ""];
  appendLine(lines, "Product", productName);
  appendLine(lines, "Product URL", productUrl);
  appendLine(lines, "Selected Option", variantLabel);
  appendLine(lines, "Pricing Plan", pricingTier === "outright" ? "Buy Outright" : pricingTier === "founding" ? "Founding Partner" : pricingTier);
  if (quantity) appendLine(lines, "Quantity", String(quantity));
  appendLine(lines, "Delivery Location", deliveryLocation);
  lines.push("");
  appendLine(lines, "Name", name);
  appendLine(lines, "Company", company);
  appendLine(lines, "Email", email);
  appendLine(lines, "Phone", phone);
  appendLine(lines, "Message", message);
  lines.push("", "Please share more information.");
  return lines.join("\n");
}

/**
 * Advertising campaign inquiry message template.
 */
export function buildAdvertisingInquiryMessage({
  location,
  budget,
  currency,
  durationLabel,
  preferences,
  name,
  company,
  email,
  phone,
}) {
  const lines = ["Hello, I am interested in advertising opportunities.", ""];
  appendLine(lines, "City / Country", location);
  if (budget !== "" && budget != null) {
    appendLine(lines, "Budget", `${currency || "INR"} ${budget}`);
  }
  appendLine(lines, "Campaign Duration", durationLabel);
  if (sanitizeWhatsAppText(preferences)) {
    lines.push("", "Campaign Details:", sanitizeWhatsAppText(preferences));
  }
  lines.push("");
  appendLine(lines, "Name", name);
  appendLine(lines, "Business / Company", company);
  appendLine(lines, "Email", email);
  appendLine(lines, "Phone", phone);
  lines.push("", "Please contact me regarding the advertising options.");
  return lines.join("\n");
}

/**
 * Advertising Screen Map single-screen inquiry message template.
 */
export function buildScreenMapInquiryMessage({ screenName, screenType, venue, area, pageUrl }) {
  const lines = ["Hello, I would like to enquire about advertising on this screen.", ""];
  appendLine(lines, "Screen", screenName);
  appendLine(lines, "Format", screenType);
  appendLine(lines, "Location", [venue, area].filter(Boolean).join(" · "));
  appendLine(lines, "Page", pageUrl);
  lines.push("", "Please share availability and advertising options.");
  return lines.join("\n");
}

/**
 * Quick direct WhatsApp message for non-form contact buttons (Contact page, Footer).
 */
export function buildQuickWhatsAppMessage(context = "general") {
  if (context === "advertising") {
    return "Hello Illuvision team, I would like to enquire about advertising on your digital screen network.";
  }
  if (context === "screens") {
    return "Hello Illuvision team, I would like to enquire about buying digital display screens.";
  }
  return "Hello Illuvision team, I would like to make an inquiry regarding your digital screens and advertising services.";
}
