import { getEnquiryConfig, loadLocalEnv } from "../lib/env.js";

loadLocalEnv();

function sendJson(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(body));
}

export async function configHandler(req, res) {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }

  const {
    emailConfigured,
    googleAppsScriptConfigured,
    googleSheetsConfigured,
    storageConfigured,
    enquirySectionEnabled,
    provider,
  } = getEnquiryConfig();

  sendJson(res, 200, {
    emailConfigured,
    googleAppsScriptConfigured,
    googleSheetsConfigured,
    storageConfigured,
    enquirySectionEnabled,
    provider,
  });
}

export default async function handler(req, res) {
  return configHandler(req, res);
}
