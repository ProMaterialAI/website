import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ENV_FILES = [".env", ".env.local"];
const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);
const FALSE_VALUES = new Set(["0", "false", "no", "off"]);
const ENV_LOADER_KEY = Symbol.for("promaterial.envLoaderState");

const globalState = globalThis[ENV_LOADER_KEY] ?? { loaded: false };
globalThis[ENV_LOADER_KEY] = globalState;

export function loadLocalEnv() {
  if (globalState.loaded) {
    return;
  }

  globalState.loaded = true;

  const rootDir = fileURLToPath(new URL("../", import.meta.url));

  for (const filename of ENV_FILES) {
    const filePath = join(rootDir, filename);

    if (!existsSync(filePath)) {
      continue;
    }

    const fileContents = readFileSync(filePath, "utf8");
    applyEnvFile(fileContents);
  }
}

export function getEnquiryConfig() {
  loadLocalEnv();

  const emailProvider = detectEmailProvider();
  const emailConfigured = Boolean(
    emailProvider &&
      getEmailApiKey(emailProvider) &&
      process.env.CONTACT_TO_EMAIL &&
      process.env.CONTACT_FROM_EMAIL,
  );
  const googleAppsScriptConfigured = isGoogleAppsScriptConfigured();
  const googleSheetsConfigured = isGoogleSheetsConfigured();
  const storageConfigured =
    googleAppsScriptConfigured || googleSheetsConfigured || emailConfigured;
  const provider = detectEnquiryStorageProvider();

  const enquirySectionEnabled =
    readBooleanEnv("ENQUIRY_SECTION_ENABLED", storageConfigured) &&
    storageConfigured;

  return {
    emailConfigured,
    googleAppsScriptConfigured,
    googleSheetsConfigured,
    storageConfigured,
    enquirySectionEnabled,
    provider,
  };
}

export function detectEnquiryStorageProvider() {
  loadLocalEnv();

  const explicitProvider = process.env.ENQUIRY_STORAGE_PROVIDER
    ?.trim()
    .toLowerCase();

  if (
    explicitProvider === "google-apps-script" &&
    isGoogleAppsScriptConfigured()
  ) {
    return "google-apps-script";
  }

  if (explicitProvider === "google-sheets" && isGoogleSheetsConfigured()) {
    return "google-sheets";
  }

  if (
    (explicitProvider === "brevo" || explicitProvider === "sendgrid") &&
    isEmailConfigured(explicitProvider)
  ) {
    return explicitProvider;
  }

  if (explicitProvider === "email") {
    const detectedEmailProvider = detectEmailProvider();
    if (detectedEmailProvider && isEmailConfigured(detectedEmailProvider)) {
      return detectedEmailProvider;
    }
  }

  if (isGoogleAppsScriptConfigured()) {
    return "google-apps-script";
  }

  if (isGoogleSheetsConfigured()) {
    return "google-sheets";
  }

  const detectedEmailProvider = detectEmailProvider();
  if (detectedEmailProvider && isEmailConfigured(detectedEmailProvider)) {
    return detectedEmailProvider;
  }

  return null;
}

export function detectEmailProvider() {
  loadLocalEnv();

  const explicitProvider = process.env.EMAIL_PROVIDER?.trim().toLowerCase();

  if (explicitProvider === "sendgrid" || explicitProvider === "brevo") {
    return explicitProvider;
  }

  const brevoKey = process.env.BREVO_API_KEY || process.env.EMAIL_API_KEY;
  if (brevoKey?.trim().startsWith("xkeysib-")) {
    return "brevo";
  }

  const sendGridKey = process.env.SENDGRID_API_KEY || process.env.EMAIL_API_KEY;
  if (sendGridKey?.trim()) {
    return "sendgrid";
  }

  return null;
}

export function getEmailApiKey(provider) {
  loadLocalEnv();

  if (provider === "brevo") {
    return (
      process.env.BREVO_API_KEY ||
      (process.env.EMAIL_API_KEY?.trim().startsWith("xkeysib-")
        ? process.env.EMAIL_API_KEY
        : "")
    );
  }

  if (provider === "sendgrid") {
    return process.env.SENDGRID_API_KEY || process.env.EMAIL_API_KEY || "";
  }

  return "";
}

export function getGoogleSheetsConfig() {
  loadLocalEnv();

  return {
    spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID?.trim() || "",
    sheetName: process.env.GOOGLE_SHEETS_SHEET_NAME?.trim() || "Enquiries",
    serviceAccountEmail:
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim() || "",
    privateKey: readGooglePrivateKey(),
  };
}

export function getGoogleAppsScriptConfig() {
  loadLocalEnv();

  return {
    webhookUrl: process.env.GOOGLE_APPS_SCRIPT_WEBHOOK_URL?.trim() || "",
    sharedSecret:
      process.env.GOOGLE_APPS_SCRIPT_SHARED_SECRET?.trim() || "",
  };
}

export function isGoogleAppsScriptConfigured() {
  const config = getGoogleAppsScriptConfig();
  return Boolean(config.webhookUrl);
}

export function isGoogleSheetsConfigured() {
  const config = getGoogleSheetsConfig();

  return Boolean(
    config.spreadsheetId && config.serviceAccountEmail && config.privateKey,
  );
}

function isEmailConfigured(provider) {
  return Boolean(
    provider &&
      getEmailApiKey(provider) &&
      process.env.CONTACT_TO_EMAIL &&
      process.env.CONTACT_FROM_EMAIL,
  );
}

function readGooglePrivateKey() {
  const base64Value = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_BASE64;
  if (base64Value?.trim()) {
    return Buffer.from(base64Value.trim(), "base64").toString("utf8");
  }

  const rawValue = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (!rawValue?.trim()) {
    return "";
  }

  return rawValue.replace(/\\n/g, "\n");
}

function applyEnvFile(fileContents) {
  const lines = fileContents.split(/\r?\n/);

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    if (!key || process.env[key] !== undefined) {
      continue;
    }

    const rawValue = trimmedLine.slice(separatorIndex + 1).trim();
    process.env[key] = normalizeEnvValue(rawValue);
  }
}

function normalizeEnvValue(rawValue) {
  if (
    (rawValue.startsWith('"') && rawValue.endsWith('"')) ||
    (rawValue.startsWith("'") && rawValue.endsWith("'"))
  ) {
    const unwrapped = rawValue.slice(1, -1);
    return rawValue.startsWith('"')
      ? unwrapped.replace(/\\n/g, "\n").replace(/\\r/g, "\r")
      : unwrapped;
  }

  return rawValue;
}

function readBooleanEnv(key, defaultValue) {
  const value = process.env[key];

  if (value === undefined) {
    return defaultValue;
  }

  const normalized = value.trim().toLowerCase();

  if (TRUE_VALUES.has(normalized)) {
    return true;
  }

  if (FALSE_VALUES.has(normalized)) {
    return false;
  }

  return defaultValue;
}
