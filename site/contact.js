const CONTACT_ADDRESS = "hello@merchendices.com";

export function buildContactMailto(values) {
  const clean = Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, String(value ?? "").trim()]),
  );
  const subject = `New creator enquiry — ${clean.name}`;
  const body = [
    `Name: ${clean.name}`,
    `Email: ${clean.email}`,
    `Channel: ${clean.channel || "Not provided"}`,
    `Audience: ${clean.audience}`,
    "",
    "Project:",
    clean.message,
  ].join("\n");

  return `mailto:${CONTACT_ADDRESS}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function setupContactForm() {
  const form = document.querySelector("[data-contact-form]");
  const status = document.querySelector("[data-form-status]");
  if (!form || !status) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      form.querySelector(":invalid")?.focus();
      status.textContent = "Please complete the required fields.";
      return;
    }

    const values = Object.fromEntries(new FormData(form).entries());
    status.textContent = "Opening your email app with the project details…";
    window.location.href = buildContactMailto(values);
  });
}

if (typeof document !== "undefined") setupContactForm();
