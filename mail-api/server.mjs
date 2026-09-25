import { createServer } from "node:http";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_BODY_BYTES = 32 * 1024;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FIELDS = ["name", "email", "youtube", "instagram", "tiktok", "otherPlatforms", "message", "website"];

function trimValue(value) {
  return String(value ?? "").trim();
}

function json(res, status, body, origin) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (origin) res.setHeader("Access-Control-Allow-Origin", origin);
  res.end(JSON.stringify(body));
}

export function validateSubmission(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { ok: false, status: 400, error: "Please provide a valid JSON submission." };
  }

  const value = Object.fromEntries(FIELDS.map((field) => [field, trimValue(payload[field])]));
  if (value.website) return { ok: false, status: 400, error: "Unable to process this submission." };
  if (!value.name || !value.email || !value.message || !EMAIL_PATTERN.test(value.email)) {
    return { ok: false, status: 400, error: "Please add your name, a valid email, and a short project brief." };
  }
  return { ok: true, value };
}

export function buildMessage(value, { from, to }) {
  const display = (field) => value[field] || "Not provided";
  return {
    from,
    to,
    replyTo: value.email,
    subject: `Merchendice creator enquiry — ${value.name}`,
    text: [
      `Name: ${value.name}`,
      `Email: ${value.email}`,
      `YouTube: ${display("youtube")}`,
      `Instagram: ${display("instagram")}`,
      `TikTok: ${display("tiktok")}`,
      `Other platforms: ${display("otherPlatforms")}`,
      "",
      `Project brief: ${value.message}`,
    ].join("\n"),
  };
}

export function createRateLimiter({ limit = 5, windowMs = 10 * 60 * 1000 } = {}) {
  const buckets = new Map();
  return {
    allow(ip) {
      const now = Date.now();
      const recent = (buckets.get(ip) || []).filter((timestamp) => now - timestamp < windowMs);
      if (recent.length >= limit) {
        buckets.set(ip, recent);
        return false;
      }
      recent.push(now);
      buckets.set(ip, recent);
      return true;
    },
  };
}

function readJson(req) {
  return new Promise((resolveBody, reject) => {
    const chunks = [];
    let size = 0;
    let tooLarge = false;
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      size += Buffer.byteLength(chunk);
      if (size > MAX_BODY_BYTES) {
        tooLarge = true;
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      if (tooLarge) {
        reject(Object.assign(new Error("Request too large"), { status: 413 }));
        return;
      }
      try {
        resolveBody(JSON.parse(chunks.join("")));
      } catch {
        reject(Object.assign(new Error("Invalid JSON"), { status: 400 }));
      }
    });
    req.on("error", reject);
  });
}

export function createMailServer({ transport, env = process.env, rateLimiter = createRateLimiter() }) {
  if (!transport || typeof transport.sendMail !== "function") {
    throw new TypeError("A mail transport with sendMail is required");
  }

  const allowedOrigin = trimValue(env.ALLOWED_ORIGIN);
  const from = trimValue(env.SMTP_USER);
  const to = trimValue(env.MAIL_TO || env.SMTP_USER);

  return createServer(async (req, res) => {
    const origin = trimValue(req.headers.origin);
    if (origin && origin !== allowedOrigin) {
      json(res, 403, { error: "Origin not allowed." });
      return;
    }

    if (req.method === "OPTIONS") {
      if (origin) res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      res.statusCode = 204;
      res.end();
      return;
    }

    if (req.method === "GET" && req.url === "/healthz") {
      json(res, 200, { ok: true });
      return;
    }

    if (req.method !== "POST" || req.url !== "/contact") {
      json(res, 404, { error: "Not found." });
      return;
    }

    const ip = String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown").split(",")[0].trim();
    if (!rateLimiter.allow(ip)) {
      json(res, 429, { error: "Too many requests. Please try again later." }, origin);
      return;
    }

    let payload;
    try {
      payload = await readJson(req);
    } catch (error) {
      json(res, error.status || 400, { error: error.status === 413 ? "Submission is too large." : "Please provide a valid JSON submission." }, origin);
      return;
    }

    const validation = validateSubmission(payload);
    if (!validation.ok) {
      json(res, validation.status, { error: validation.error }, origin);
      return;
    }

    try {
      await transport.sendMail(buildMessage(validation.value, { from, to }));
    } catch {
      console.error("Mail delivery failed");
      json(res, 502, { error: "Unable to send your enquiry." }, origin);
      return;
    }

    json(res, 200, { ok: true }, origin);
  });
}

async function start() {
  const smtpUser = trimValue(process.env.SMTP_USER);
  const appPassword = trimValue(process.env.SMTP_APP_PASSWORD);
  const mailTo = trimValue(process.env.MAIL_TO || smtpUser);
  const allowedOrigin = trimValue(process.env.ALLOWED_ORIGIN);
  if (!smtpUser || !appPassword || !mailTo || !allowedOrigin) {
    throw new Error("SMTP_USER, SMTP_APP_PASSWORD, MAIL_TO, and ALLOWED_ORIGIN are required");
  }

  const { default: nodemailer } = await import("nodemailer");
  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: { user: smtpUser, pass: appPassword },
  });
  const server = createMailServer({
    transport,
    env: { SMTP_USER: smtpUser, MAIL_TO: mailTo, ALLOWED_ORIGIN: allowedOrigin },
  });
  const port = Number(process.env.PORT || 3000);
  server.listen(port, "0.0.0.0", () => console.log(`Mail API listening on ${port}`));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  start().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
