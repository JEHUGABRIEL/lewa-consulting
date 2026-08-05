import { Resend } from "resend";
import { DEFAULT_EMAIL_TEMPLATES, type EmailTemplate } from "./constants";
import { readStore } from "./store";

const API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.ADMIN_INVITE_FROM_EMAIL || "onboarding@resend.dev";

const resend = API_KEY ? new Resend(API_KEY) : null;

type EmailVars = Record<string, string>;

// Substitue les placeholders {key} puis échappe le HTML (les valeurs saisies
// par l'admin ou provenant des demandes ne doivent jamais casser la mise en
// page de l'email — en particulier le <style> dans la balise <head>).
function renderTemplate(template: EmailTemplate, vars: EmailVars): {
  subject: string;
  html: string;
} {
  const apply = (text: string) =>
    text.replace(/\{([a-zA-Z]+)\}/g, (m, key: string) => {
      const v = vars[key];
      return v === undefined ? m : v;
    });

  const subject = apply(template.subject);
  const paragraphs = apply(template.body)
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, " ").trim())
    .filter(Boolean);
  const bodyHtml = paragraphs
    .map(
      (p) =>
        `<p style="color:#374151;font-size:14px;line-height:1.6">${escapeHtml(p)}</p>`,
    )
    .join("\n      ");
  return { subject, html: shell(subject, bodyHtml) };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Retrouve le modèle personnalisé (dashboard) ou le modèle par défaut.
async function getTemplate(kind: keyof typeof DEFAULT_EMAIL_TEMPLATES): Promise<EmailTemplate> {
  try {
    const store = await readStore();
    const t = store.emailTemplates?.[kind];
    if (t?.subject && t.body) return t;
  } catch {
    // Store indisponible → modèle par défaut.
  }
  return DEFAULT_EMAIL_TEMPLATES[kind];
}

export function emailConfigured(): boolean {
  return resend !== null;
}

export type EmailResult = {
  delivered: boolean;
  preview?: { subject: string; html: string };
};

type EmailPayload = { to: string; subject: string; html: string };

const BRAND_STYLE =
  "font-family:Arial,Helvetica,sans-serif;background:#F4F2EC;padding:32px 16px";

async function send(payload: EmailPayload): Promise<EmailResult> {
  if (!resend) {
    console.log(
      "[admin-email] RESEND_API_KEY absent — email NON envoyé. Aperçu du contenu :",
      JSON.stringify({ to: payload.to, subject: payload.subject }, null, 2),
    );
    return { delivered: false, preview: payload };
  }
  try {
    await resend.emails.send({
      from: FROM,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    });
    return { delivered: true };
  } catch (err) {
    console.error("[admin-email] Échec de l'envoi via Resend :", err);
    return { delivered: false };
  }
}

function shell(title: string, body: string): string {
  return `
    <div style="${BRAND_STYLE}">
      <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #E5E0D4">
        <div style="background:#0C2340;padding:20px 28px">
          <p style="margin:0;color:#C99A2E;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:700">COSI LEWA Consulting</p>
        </div>
        <div style="padding:28px">
          <h1 style="margin:0 0 12px;color:#0C2340;font-size:20px;font-family:Arial,Helvetica,sans-serif">${title}</h1>
          ${body}
        </div>
        <div style="padding:14px 28px;background:#F4F2EC;color:#6b7280;font-size:11px">
          Cet email a été généré automatiquement par le site lewa-consulting.
        </div>
      </div>
    </div>
  `;
}

export async function sendInvitationEmail(
  to: string,
  inviteLink: string,
): Promise<EmailResult> {
  const subject = "Invitation — Espace d'administration COSI LEWA";
  const html = shell(
    "Vous avez été invité",
    `
      <p style="color:#374151;font-size:14px;line-height:1.6">Bonjour,</p>
      <p style="color:#374151;font-size:14px;line-height:1.6">
        Un administrateur du cabinet COSI LEWA vous a invité à rejoindre
        l'<strong>espace d'administration</strong> du site.
      </p>
      <p style="color:#374151;font-size:14px;line-height:1.6">
        Cliquez sur le bouton ci-dessous pour créer votre compte :
      </p>
      <p style="text-align:center;margin:24px 0">
        <a href="${inviteLink}" style="display:inline-block;background:#C99A2E;color:#0C2340;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:700;font-size:14px">
          Créer mon compte administrateur
        </a>
      </p>
      <p style="color:#9ca3af;font-size:12px">
        Lien valable 7 jours. Si le bouton ne fonctionne pas, copiez ce lien :
        <a href="${inviteLink}" style="color:#0C2340">${inviteLink}</a>
      </p>
    `,
  );
  return send({ to, subject, html });
}

export async function sendEnrollmentConfirmationEmail(
  to: string,
  input: { name: string; formation: string },
): Promise<EmailResult> {
  const template = await getTemplate("confirmation");
  const { subject, html } = renderTemplate(template, input);
  return send({ to, subject, html });
}

export async function sendEnrollmentReminderEmail(
  to: string,
  input: { name: string; formation: string; startDate: string },
): Promise<EmailResult> {
  const template = await getTemplate("reminder");
  const formatted = new Date(input.startDate).toLocaleString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const { subject, html } = renderTemplate(template, {
    name: input.name,
    formation: input.formation,
    startDate: formatted,
  });
  return send({ to, subject, html });
}

export async function sendOtpEmail(
  to: string,
  otp: string,
  verifyLink: string,
): Promise<EmailResult> {
  const subject = "Votre code de vérification — Espace d'administration COSI LEWA";
  const html = shell(
    "Vérification de votre compte",
    `
      <p style="color:#374151;font-size:14px;line-height:1.6">Bonjour,</p>
      <p style="color:#374151;font-size:14px;line-height:1.6">
        Pour finaliser la création de votre compte administrateur, saisissez le
        code de vérification suivant :
      </p>
      <p style="text-align:center;margin:20px 0">
        <span style="display:inline-block;background:#0C2340;color:#ffffff;padding:14px 28px;border-radius:8px;font-size:26px;font-weight:700;letter-spacing:8px;font-family:monospace">${otp}</span>
      </p>
      <p style="color:#374151;font-size:14px;line-height:1.6">
        … ou cliquez sur ce lien pour valider automatiquement :
      </p>
      <p style="text-align:center;margin:20px 0">
        <a href="${verifyLink}" style="display:inline-block;background:#C99A2E;color:#0C2340;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:700;font-size:14px">
          Valider mon compte
        </a>
      </p>
      <p style="color:#9ca3af;font-size:12px">
        Ce code expire dans 10 minutes. Si vous n'êtes pas à l'origine de cette
        demande, ignorez cet email.
      </p>
    `,
  );
  return send({ to, subject, html });
}
