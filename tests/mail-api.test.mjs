import assert from "node:assert/strict";
import { request as httpRequest } from "node:http";
import test from "node:test";

import { buildMessage, createMailServer, createRateLimiter } from "../mail-api/server.mjs";

const env = {
  SMTP_USER: "merchendices@gmail.com",
  MAIL_TO: "merchendices@gmail.com",
  ALLOWED_ORIGIN: "https://merchendice.com",
};

const validPayload = {
  name: "Alex Creator",
  email: "alex@example.com",
  youtube: "https://youtube.com/@alex",
  instagram: "@alex",
  tiktok: "alexclips",
  otherPlatforms: "Twitch: alexlive",
  message: "A bright summer drop.",
  website: "",
};

function send(server, { method = "POST", path = "/contact", headers = {}, body } = {}) {
  const address = server.address();
  return new Promise((resolve, reject) => {
    const request = httpRequest(
      { host: "127.0.0.1", port: address.port, method, path, headers },
      (response) => {
        let output = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => { output += chunk; });
        response.on("end", () => resolve({ status: response.statusCode, body: JSON.parse(output || "{}") }));
      },
    );
    request.on("error", reject);
    if (body !== undefined) request.write(JSON.stringify(body));
    request.end();
  });
}

async function withServer(options, callback) {
  const server = createMailServer({ env, ...options });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    return await callback(server);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
}

test("health endpoint reports that the mail API is available", async () => {
  await withServer({ transport: { sendMail: async () => {} } }, async (server) => {
    const response = await send(server, { method: "GET", path: "/healthz" });
    assert.deepEqual(response, { status: 200, body: { ok: true } });
  });
});

test("valid contact submission sends the expected Gmail message", async () => {
  let sent;
  await withServer({ transport: { sendMail: async (message) => { sent = message; } } }, async (server) => {
    const response = await send(server, {
      headers: {
        "content-type": "application/json",
        "content-length": Buffer.byteLength(JSON.stringify(validPayload)),
        origin: "https://merchendice.com",
      },
      body: validPayload,
    });
    assert.deepEqual(response, { status: 200, body: { ok: true } });
  });

  assert.deepEqual(sent, buildMessage(validPayload, { from: env.SMTP_USER, to: env.MAIL_TO }));
  assert.equal(sent.from, "merchendices@gmail.com");
  assert.equal(sent.to, "merchendices@gmail.com");
  assert.equal(sent.replyTo, "alex@example.com");
  assert.match(sent.text, /Project brief: A bright summer drop\./);
});

test("missing or invalid required fields return 400 without sending", async () => {
  let sends = 0;
  await withServer({ transport: { sendMail: async () => { sends += 1; } } }, async (server) => {
    const response = await send(server, {
      headers: { "content-type": "application/json", origin: "https://merchendice.com" },
      body: { ...validPayload, name: "", email: "not-an-email", message: "" },
    });
    assert.equal(response.status, 400);
    assert.match(response.body.error, /valid email.*project brief/i);
  });
  assert.equal(sends, 0);
});

test("malformed field types return 400 and do not stop the server", async () => {
  let sends = 0;
  await withServer({ transport: { sendMail: async () => { sends += 1; } } }, async (server) => {
    const malformed = await send(server, {
      headers: { "content-type": "application/json", origin: "https://merchendice.com" },
      body: { ...validPayload, name: { toString: 1 } },
    });
    assert.equal(malformed.status, 400);

    const healthy = await send(server, {
      headers: { "content-type": "application/json", origin: "https://merchendice.com" },
      body: validPayload,
    });
    assert.equal(healthy.status, 200);
  });
  assert.equal(sends, 1);
});

test("a filled honeypot returns 400 without sending", async () => {
  let sends = 0;
  await withServer({ transport: { sendMail: async () => { sends += 1; } } }, async (server) => {
    const response = await send(server, {
      headers: { "content-type": "application/json", origin: "https://merchendice.com" },
      body: { ...validPayload, website: "https://spam.example" },
    });
    assert.deepEqual(response, { status: 400, body: { error: "Unable to process this submission." } });
  });
  assert.equal(sends, 0);
});

test("a disallowed origin returns 403 without sending", async () => {
  let sends = 0;
  await withServer({ transport: { sendMail: async () => { sends += 1; } } }, async (server) => {
    const response = await send(server, {
      headers: { "content-type": "application/json", origin: "https://evil.example" },
      body: validPayload,
    });
    assert.deepEqual(response, { status: 403, body: { error: "Origin not allowed." } });
  });
  assert.equal(sends, 0);
});

test("rate-limited clients receive 429 without sending", async () => {
  let sends = 0;
  await withServer({
    transport: { sendMail: async () => { sends += 1; } },
    rateLimiter: { allow: () => false },
  }, async (server) => {
    const response = await send(server, {
      headers: { "content-type": "application/json", origin: "https://merchendice.com" },
      body: validPayload,
    });
    assert.deepEqual(response, { status: 429, body: { error: "Too many requests. Please try again later." } });
  });
  assert.equal(sends, 0);
});

test("rate limiting uses the trusted client identity instead of forwarded spoofing", async () => {
  let sends = 0;
  await withServer({
    transport: { sendMail: async () => { sends += 1; } },
    rateLimiter: createRateLimiter({ limit: 5, windowMs: 60_000 }),
  }, async (server) => {
    const statuses = [];
    for (let index = 0; index < 6; index += 1) {
      const response = await send(server, {
        headers: {
          "content-type": "application/json",
          origin: "https://merchendice.com",
          "x-real-ip": "203.0.113.10",
          "x-forwarded-for": `spoof-${index}`,
        },
        body: validPayload,
      });
      statuses.push(response.status);
    }
    assert.deepEqual(statuses, [200, 200, 200, 200, 200, 429]);
  });
  assert.equal(sends, 5);
});

test("transport failures return a generic 502 response", async () => {
  await withServer({
    transport: { sendMail: async () => { throw new Error("SMTP password leaked in this error"); } },
  }, async (server) => {
    const response = await send(server, {
      headers: { "content-type": "application/json", origin: "https://merchendice.com" },
      body: validPayload,
    });
    assert.deepEqual(response, { status: 502, body: { error: "Unable to send your enquiry." } });
    assert.doesNotMatch(JSON.stringify(response.body), /SMTP password/i);
  });
});
