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

  const trimmedMessage = String(message || "").trim();
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
