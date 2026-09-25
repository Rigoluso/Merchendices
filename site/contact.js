const CONTACT_FIELDS = [
  "name",
  "email",
  "youtube",
  "instagram",
  "tiktok",
  "otherPlatforms",
  "message",
  "website",
];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function trimValue(value) {
  return String(value ?? "").trim();
}

export function buildContactPayload(values = {}) {
  return Object.fromEntries(CONTACT_FIELDS.map((field) => [field, trimValue(values[field])]));
}

export function validateContactValues(values = {}) {
  const payload = buildContactPayload(values);
  const missing = [];
  if (!payload.name) missing.push("name");
  if (!payload.email || !EMAIL_PATTERN.test(payload.email)) missing.push("email");
  if (!payload.message) missing.push("message");
  return { valid: missing.length === 0, missing };
}

if (typeof document !== "undefined") {
  const form = document.querySelector("[data-contact-form]");
  const status = document.querySelector("[data-form-status]");
  const submitButton = form?.querySelector('button[type="submit"]');

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(form).entries());
    const payload = buildContactPayload(values);
    const validation = validateContactValues(payload);

    if (!validation.valid) {
      status.textContent =
        "Please add your name, a valid email, and a short project brief.";
      status.dataset.state = "error";
      form.querySelector(`[name="${validation.missing[0]}"]`)?.focus();
      return;
    }

    submitButton?.setAttribute("disabled", "disabled");
    status.textContent = "Sending your enquiry…";
    status.dataset.state = "ready";

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || "Unable to send your enquiry.");
      }
      status.textContent = "Message sent. We will reply by email.";
      status.dataset.state = "success";
    } catch {
      status.textContent = "We could not send the message. Please try again shortly.";
      status.dataset.state = "error";
    } finally {
      submitButton?.removeAttribute("disabled");
    }
  });
}
