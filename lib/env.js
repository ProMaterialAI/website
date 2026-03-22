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

  const provider = detectEmailProvider();
  const emailConfigured = Boolean(
    provider &&
      getEmailApiKey(provider) &&
      process.env.CONTACT_TO_EMAIL &&
      process.env.CONTACT_FROM_EMAIL,
  );

  const enquirySectionEnabled =
    readBooleanEnv("ENQUIRY_SECTION_ENABLED", emailConfigured) && emailConfigured;

  return {
    emailConfigured,
    enquirySectionEnabled,
    provider,
  };
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
