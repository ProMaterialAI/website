import { createHmac } from "node:crypto";

import { getGoogleAppsScriptConfig, loadLocalEnv } from "./env.js";

loadLocalEnv();

export async function sendEnquiryToGoogleAppsScript(record) {
  const config = getGoogleAppsScriptConfig();

  if (!config.webhookUrl) {
    throw new Error("Google Apps Script webhook is not configured.");
  }

  const timestamp = new Date().toISOString();
  const payload = {
    submittedAt: record.submittedAt,
    name: record.name,
    email: record.email,
    message: record.message,
    source: record.source,
    ipAddress: record.ipAddress,
    userAgent: record.userAgent,
    timestamp,
  };

  const signature = config.signingSecret
    ? signAppsScriptPayload(payload, config.signingSecret)
    : "";

  const response = await fetch(config.webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      secret: config.sharedSecret || undefined,
      ...payload,
      signature: signature || undefined,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Google Apps Script webhook returned ${response.status}: ${errorText}`,
    );
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return;
  }

  const responsePayload = await response.json();
  if (responsePayload?.ok === false) {
    throw new Error(
      `Google Apps Script webhook rejected the enquiry: ${responsePayload.error || "unknown error"}`,
    );
  }
}

function signAppsScriptPayload(payload, secret) {
  return createHmac("sha256", secret)
    .update(buildCanonicalPayload(payload))
    .digest("hex");
}

function buildCanonicalPayload(payload) {
  return [
    payload.timestamp || "",
    payload.submittedAt || "",
    payload.name || "",
    payload.email || "",
    payload.message || "",
    payload.source || "",
    payload.ipAddress || "",
    payload.userAgent || "",
  ].join("\n");
}
