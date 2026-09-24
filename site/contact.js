const RECIPIENT = "merchendices@gmail.com";

function clean(value) {
  return String(value ?? "").trim() || "Not provided";
}

export function buildContactMailto(values = {}) {
  const name = clean(values.name);
  const body = [
    `Name: ${name}`,
    `Email: ${clean(values.email)}`,
    `YouTube: ${clean(values.youtube)}`,
    `Instagram: ${clean(values.instagram)}`,
    `TikTok: ${clean(values.tiktok)}`,
    `Other platforms: ${clean(values.otherPlatforms)}`,
    "",
    `Project brief: ${clean(values.message)}`,
  ].join("\n");
  const subject = `Merchendice creator enquiry — ${name}`;
  return `mailto:${RECIPIENT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

if (typeof document !== "undefined") {
  const form = document.querySelector("[data-contact-form]");
  const status = document.querySelector("[data-form-status]");
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(form).entries());
    const required = ["name", "email", "message"];
    const missing = required.filter((key) => !String(values[key] ?? "").trim());
    if (missing.length || !form.querySelector('[name="email"]').checkValidity()) {
      status.textContent = "Please add your name, a valid email, and a short project brief.";
      status.dataset.state = "error";
      form.querySelector(`[name="${missing[0] || "email"}"]`)?.focus();
      return;
    }
    status.textContent = "Opening your email app…";
    status.dataset.state = "ready";
    window.location.href = buildContactMailto(values);
  });
}
