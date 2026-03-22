import sendgrid from "@sendgrid/mail";
import {
  detectEnquiryStorageProvider,
  getEmailApiKey,
  getEnquiryConfig,
  loadLocalEnv,
} from "../lib/env.js";
import { sendEnquiryToGoogleAppsScript } from "../lib/google-apps-script.js";
import { appendEnquiryToGoogleSheet } from "../lib/google-sheets.js";

loadLocalEnv();

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";

    req.on("data", (chunk) => {
      raw += chunk;
    });

    req.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(new Error("Invalid JSON payload."));
      }
    });

    req.on("error", reject);
  });
}

function sendJson(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
  });
  res.end(JSON.stringify(body));
}

export async function contactHandler(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }

  let payload;
  try {
    payload = await parseJsonBody(req);
  } catch (error) {
    sendJson(res, 400, { error: error.message });
    return;
  }

  const name = `${payload.name ?? ""}`.trim();
  const email = `${payload.email ?? ""}`.trim();
  const message = `${payload.message ?? ""}`.trim();

  if (!name || !email || !message) {
    sendJson(res, 400, { error: "Name, email, and message are required." });
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    sendJson(res, 400, { error: "Please provide a valid email address." });
    return;
  }

  const { enquirySectionEnabled } = getEnquiryConfig();
  const provider = detectEnquiryStorageProvider();
  const apiKey =
    provider === "brevo" || provider === "sendgrid"
      ? getEmailApiKey(provider)
      : "";
  const toEmail = process.env.CONTACT_TO_EMAIL;
  const fromEmail = process.env.CONTACT_FROM_EMAIL;

  if (!enquirySectionEnabled) {
    sendJson(res, 503, {
      error: "The enquiry form is currently disabled.",
    });
    return;
  }

  if (!provider) {
    sendJson(res, 500, {
      error: "Enquiry storage is not configured. Add the backend environment variables.",
    });
    return;
  }

  const submittedAt = new Date().toISOString();
  const safeMessage = message.replace(/\r\n/g, "\n");
  const enquiryRecord = {
    name,
    email,
    message: safeMessage,
    submittedAt,
    source: "Website enquiry form",
    ipAddress: getClientIp(req),
    userAgent: `${req.headers["user-agent"] ?? ""}`.trim(),
  };

  try {
    if (provider === "google-apps-script") {
      await sendEnquiryToGoogleAppsScript(enquiryRecord);
    } else if (provider === "google-sheets") {
      await appendEnquiryToGoogleSheet(enquiryRecord);
    } else if (provider === "brevo" || provider === "sendgrid") {
      if (!apiKey || !toEmail || !fromEmail) {
        throw new Error("Email storage is not fully configured.");
      }

      const emailPayload = {
        toEmail,
        fromEmail,
        name,
        email,
        submittedAt,
        safeMessage,
      };

      if (provider === "brevo") {
        await sendWithBrevo(apiKey, emailPayload);
      } else {
        await sendWithSendGrid(apiKey, emailPayload);
      }
    } else {
      throw new Error("Unsupported enquiry storage configuration.");
    }

    sendJson(res, 200, { ok: true });
  } catch (error) {
    console.error("Enquiry storage error:", error);
    sendJson(res, 502, { error: "Unable to save your enquiry right now." });
  }
}

function getClientIp(req) {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return forwardedFor.split(",")[0].trim();
  }

  if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
    return forwardedFor[0].split(",")[0].trim();
  }

  return req.socket?.remoteAddress ?? "";
}

async function sendWithSendGrid(apiKey, payload) {
  sendgrid.setApiKey(apiKey);

  await sendgrid.send({
    to: payload.toEmail,
    from: payload.fromEmail,
    replyTo: payload.email,
    subject: `New ProMaterial demo request from ${payload.name}`,
    text: buildTextBody(payload),
    html: buildHtmlBody(payload),
  });
}

async function sendWithBrevo(apiKey, payload) {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        email: payload.fromEmail,
        name: "ProMaterial Website",
      },
      to: [
        {
          email: payload.toEmail,
          name: "ProMaterial",
        },
      ],
      replyTo: {
        email: payload.email,
        name: payload.name,
      },
      subject: `New ProMaterial demo request from ${payload.name}`,
      textContent: buildTextBody(payload),
      htmlContent: buildHtmlBody(payload),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Brevo API returned ${response.status}: ${errorText}`);
  }
}

function buildTextBody(payload) {
  return [
    "New demo request received from the website.",
    "",
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Submitted: ${payload.submittedAt}`,
    "",
    "Message:",
    payload.safeMessage,
  ].join("\n");
}

function buildHtmlBody(payload) {
  return `
    <h2>New demo request received</h2>
    <p><strong>Name:</strong> ${escapeHtml(payload.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>
    <p><strong>Submitted:</strong> ${escapeHtml(payload.submittedAt)}</p>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(payload.safeMessage).replace(/\n/g, "<br>")}</p>
  `;
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export default async function handler(req, res) {
  return contactHandler(req, res);
}
