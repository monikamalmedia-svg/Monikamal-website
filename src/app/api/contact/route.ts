import { Resend } from "resend";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  brand?: unknown;
  package?: unknown;
  budget?: unknown;
  message?: unknown;
  website_url?: unknown;
};

function asTrimmedString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function row(label: string, value: string) {
  if (!value) return "";
  return `<tr>
    <td style="padding:8px 0;color:#A8949B;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;width:140px;vertical-align:top;">${label}</td>
    <td style="padding:8px 0;color:#EDE6E8;font-size:15px;white-space:pre-wrap;">${escapeHtml(value)}</td>
  </tr>`;
}

export async function POST(request: Request) {
  let payload: ContactPayload;

  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = asTrimmedString(payload.name);
  const email = asTrimmedString(payload.email);
  const brand = asTrimmedString(payload.brand);
  const selectedPackage = asTrimmedString(payload.package) || asTrimmedString(payload.budget);
  const message = asTrimmedString(payload.message);
  const websiteUrl = asTrimmedString(payload.website_url);

  if (websiteUrl) {
    return Response.json({ ok: true });
  }

  if (!name || !email || !message) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!EMAIL_RE.test(email)) {
    return Response.json({ error: "Invalid email" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Email is not configured" }, { status: 500 });
  }

  const resend = new Resend(apiKey);

  // Default Resend sender works without a verified domain.
  // After buying a domain, verify it in Resend and switch to "hello@monikamalmedia.com".
  const from = "Monika Mal <onboarding@resend.dev>";
  const sentAt = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const subject = `[Inquiry] ${name || "Client"} — ${brand || "New Project"} (${sentAt})`;

  const html = `
    <div style="background:#1E040C;color:#EDE6E8;font-family:Georgia,serif;padding:32px;">
      <p style="margin:0 0 8px;color:#D4AF37;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;">Monika Mal</p>
      <h1 style="margin:0 0 24px;font-size:28px;font-weight:500;">Новая заявка с сайта</h1>
      <table style="width:100%;border-collapse:collapse;">
        ${row("Имя", name)}
        ${row("Email", email)}
        ${row("Бренд", brand)}
        ${row("Интересующий пакет", selectedPackage || "Custom request")}
        ${row("Сообщение", message)}
      </table>
    </div>
  `;

  const { error } = await resend.emails.send({
    from,
    to: "monikamalmedia@gmail.com",
    replyTo: email,
    subject,
    html,
  });

  if (error) {
    return Response.json({ error: "Failed to send email" }, { status: 500 });
  }

  return Response.json({ ok: true });
}
