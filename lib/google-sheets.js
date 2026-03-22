import { createSign } from "node:crypto";

import { getGoogleSheetsConfig, loadLocalEnv } from "./env.js";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";

loadLocalEnv();

export async function appendEnquiryToGoogleSheet(record) {
  const config = getGoogleSheetsConfig();

  if (
    !config.spreadsheetId ||
    !config.serviceAccountEmail ||
    !config.privateKey
  ) {
    throw new Error("Google Sheets is not fully configured.");
  }

  const accessToken = await getGoogleAccessToken(config);
  const range = `${config.sheetName}!A:G`;
  const endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(config.spreadsheetId)}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      majorDimension: "ROWS",
      values: [
        [
          record.submittedAt,
          record.name,
          record.email,
          record.message,
          record.source,
          record.ipAddress,
          record.userAgent,
        ],
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Google Sheets API returned ${response.status}: ${errorText}`,
    );
  }
}

async function getGoogleAccessToken(config) {
  const now = Math.floor(Date.now() / 1000);
  const assertion = createJwtAssertion(config, now);
  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion,
  });

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google OAuth returned ${response.status}: ${errorText}`);
  }

  const payload = await response.json();
  return payload.access_token;
}

function createJwtAssertion(config, now) {
  const header = toBase64Url(
    Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })),
  );
  const claims = toBase64Url(
    Buffer.from(
      JSON.stringify({
        iss: config.serviceAccountEmail,
        scope: GOOGLE_SHEETS_SCOPE,
        aud: GOOGLE_TOKEN_URL,
        exp: now + 3600,
        iat: now,
      }),
    ),
  );

  const signingInput = `${header}.${claims}`;
  const signer = createSign("RSA-SHA256");
  signer.update(signingInput);
  signer.end();

  const signature = signer.sign(config.privateKey);
  return `${signingInput}.${toBase64Url(signature)}`;
}

function toBase64Url(value) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}
