import { Resend } from "resend";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Caps keep oversized/bot payloads out of the inbox.
const MAX_SHORT = 300;
const MAX_LONG = 5000;
const MAX_PLATFORMS = 10;

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  brand?: unknown;
  package?: unknown;
  budget?: unknown;
  message?: unknown;
  website_url?: unknown;
  social?: unknown;
  contentType?: unknown;
  platforms?: unknown;
  product?: unknown;
  /** Legacy name (before product names were allowed); still accepted. */
  productUrl?: unknown;
};

function asTrimmedString(value: unknown, max = MAX_SHORT) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function asStringList(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, MAX_PLATFORMS)
    .map((item) => asTrimmedString(item))
    .filter(Boolean);
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
  const message = asTrimmedString(payload.message, MAX_LONG);
  const websiteUrl = asTrimmedString(payload.website_url);
  const social = asTrimmedString(payload.social);
  const contentType = asTrimmedString(payload.contentType);
  const platforms = asStringList(payload.platforms);
  // Product name or link, free text.
  const product =
    asTrimmedString(payload.product, 1000) || asTrimmedString(payload.productUrl, 1000);
  // Demo requests come from the multi-step form, where the note is optional.
  const isDemoRequest = Boolean(contentType || product);

  if (websiteUrl) {
    return Response.json({ ok: true });
  }

  if (!name || !email || (!isDemoRequest && !message)) {
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
  const subject = `${isDemoRequest ? "[Gratis demo]" : "[Inquiry]"} ${name || "Client"} — ${brand || "New Project"} (${sentAt})`;

  const html = `
    <div style="background:#1E040C;color:#EDE6E8;font-family:Georgia,serif;padding:32px;">
      <p style="margin:0 0 8px;color:#D4AF37;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;">Monika Mal</p>
      <h1 style="margin:0 0 24px;font-size:28px;font-weight:500;">${isDemoRequest ? "Заявка на бесплатное демо" : "Новая заявка с сайта"}</h1>
      <table style="width:100%;border-collapse:collapse;">
        ${row("Тип контента", contentType)}
        ${row("Платформы", platforms.join(", "))}
        ${row("Product / link", product)}
        ${row("Имя", name)}
        ${row("Бренд", brand)}
        ${row("Email", email)}
        ${row("Instagram / сайт", social)}
        ${row("Интересующий пакет", selectedPackage || (isDemoRequest ? "" : "Custom request"))}
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
