import { getGoogleAppsScriptConfig, loadLocalEnv } from "./env.js";

loadLocalEnv();

export async function sendEnquiryToGoogleAppsScript(record) {
  const config = getGoogleAppsScriptConfig();

  if (!config.webhookUrl) {
    throw new Error("Google Apps Script webhook is not configured.");
  }

  const response = await fetch(config.webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      secret: config.sharedSecret || undefined,
      submittedAt: record.submittedAt,
      name: record.name,
      email: record.email,
      message: record.message,
      source: record.source,
      ipAddress: record.ipAddress,
      userAgent: record.userAgent,
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

  const payload = await response.json();
  if (payload?.ok === false) {
    throw new Error(
      `Google Apps Script webhook rejected the enquiry: ${payload.error || "unknown error"}`,
    );
  }
}
