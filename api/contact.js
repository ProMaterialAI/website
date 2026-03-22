import sendgrid from "@sendgrid/mail";

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

  const apiKey = process.env.SENDGRID_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  const fromEmail = process.env.CONTACT_FROM_EMAIL;

  if (!apiKey || !toEmail || !fromEmail) {
    sendJson(res, 500, {
      error: "Email service is not configured. Add SendGrid environment variables.",
    });
    return;
  }

  sendgrid.setApiKey(apiKey);

  const submittedAt = new Date().toISOString();
  const safeMessage = message.replace(/\r\n/g, "\n");

  try {
    await sendgrid.send({
      to: toEmail,
      from: fromEmail,
      replyTo: email,
      subject: `New ProMaterial demo request from ${name}`,
      text: [
        "New demo request received from the website.",
        "",
        `Name: ${name}`,
        `Email: ${email}`,
        `Submitted: ${submittedAt}`,
        "",
        "Message:",
        safeMessage,
      ].join("\n"),
      html: `
        <h2>New demo request received</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Submitted:</strong> ${escapeHtml(submittedAt)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(safeMessage).replace(/\n/g, "<br>")}</p>
      `,
    });

    sendJson(res, 200, { ok: true });
  } catch (error) {
    console.error("SendGrid error:", error);
    sendJson(res, 502, { error: "Unable to send email right now." });
  }
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
