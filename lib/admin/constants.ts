








export const API_PATH = "/api/admin";

// Domaine public du site (emails, liens d'invitation, OTP). En développement
// local, `req.nextUrl.origin` vaut http://localhost:3000 — inutilisable par un
// destinataire externe. On utilise donc le domaine de production, surchargeable
// via SITE_URL (ex. tunnel de prévisualisation).
// NB : ce fichier est aussi importé côté client (boutons « Copier le lien ») —
// la garde `typeof process` évite tout crash navigateur, et un SITE_URL vide
// (falsy) retombe sur le domaine de production.
export const PUBLIC_BASE_URL = (
  typeof process !== "undefined" && process.env.SITE_URL
    ? process.env.SITE_URL
    : "https://www.lewaconsultingroup.com"
).replace(/\/+$/, "");

export function publicInviteLink(token: string, code?: string): string {
  const qs = code ? `?code=${encodeURIComponent(code)}` : "";
  return `${PUBLIC_BASE_URL}/admin/invite/${token}${qs}`;
}



export type FormationItem = {
  slug: string;
  category: string;
  image: string;
  price: string;
  level?: string;

  name?: string;


  updatedAt?: string;
  // Soft delete : posé quand l'admin déplace l'élément dans la corbeille.
  deletedAt?: string;
};

export type ServiceItem = {
  slug: string;
  icon: string;
  image: string;
  name?: string;
  // Soft delete : posé quand l'admin déplace l'élément dans la corbeille.
  deletedAt?: string;
};

export type PostItem = {
  slug: string;
  category: string;
  image: string;
  name?: string;


  updatedAt?: string;
  // Soft delete : posé quand l'admin déplace l'élément dans la corbeille.
  deletedAt?: string;
};

export type PartnerItem = {
  name: string;
  tagline: string;
  image: string;
  imageAlt: string;
  // Soft delete : posé quand l'admin déplace l'élément dans la corbeille.
  deletedAt?: string;
};

export type TestimonialItem = {
  name: string;
  image: string;
  imageAlt: string;
  // Soft delete : posé quand l'admin déplace l'élément dans la corbeille.
  deletedAt?: string;
};

export type EnrollmentStatus = "pending" | "confirmed";

export type EnrollmentRequest = {
  id: string;
  formation: string;
  name: string;
  phone: string;
  // Indicatif pays choisi au formulaire (ex. « +236 ») — permet de normaliser
  // le numéro au format E.164 pour l'envoi WhatsApp Business (rappels J-48h).
  countryCode?: string;
  email?: string;
  availability?: string;
  status: EnrollmentStatus;
  createdAt: string;
  confirmedAt?: string;
  // Date/heure de début de la session, saisie par l'admin à la confirmation.
  // Déclenche le rappel automatique 48 h avant (endpoint /api/cron/reminders).
  startDate?: string;
  // Horodatage de l'envoi du rappel automatique (une seule fois par demande).
  reminderSentAt?: string;
  // Soft delete : posé quand l'admin déplace la demande dans la corbeille.
  deletedAt?: string;
};


export type ActivityAction =
  | "create"
  | "update"
  | "delete"
  | "content"
  | "login"
  | "logout";






export type ActivityEvent = {

  id: string;

  at: string;

  username: string;
  action: ActivityAction;

  entity?: string;

  label?: string;

  ip?: string;
};







export type ActivityEventInput = {
  action: "create" | "update" | "delete" | "content";
  entity?: string;
  label?: string;
};

export type EmailTemplate = {
  subject: string;
  body: string;
};

// Modèles des emails envoyés automatiquement (personnalisables depuis le
// dashboard). Le corps est du texte avec des placeholders : {name} pour le
// prénom du demandeur, {formation} pour le nom de la formation et {startDate}
// pour la date de début (email de rappel uniquement).
export type EmailTemplates = {
  confirmation: EmailTemplate;
  reminder: EmailTemplate;
};

export const DEFAULT_EMAIL_TEMPLATES: EmailTemplates = {
  confirmation: {
    subject: "Confirmation de votre demande d'inscription — COSI LEWA",
    body: [
      "Bonjour {name},",
      "",
      "Nous avons bien reçu votre demande d'inscription à la formation « {formation} » auprès du Cabinet COSI LEWA Consulting.",
      "",
      "Notre équipe va vous recontacter très rapidement pour finaliser votre inscription (démarrage de la session, modalités de paiement, documents).",
      "",
      "Merci de votre confiance et à très bientôt.",
    ].join("\n"),
  },
  reminder: {
    subject: "Rappel : votre formation approche — COSI LEWA",
    body: [
      "Bonjour {name},",
      "",
      "Ceci est un rappel automatique : votre formation « {formation} » commence le {startDate}.",
      "",
      "N'oubliez pas de finaliser votre inscription et le règlement des frais de formation si ce n'est pas déjà fait. Notre équipe reste à votre disposition pour toute question.",
      "",
      "À très bientôt au Cabinet COSI LEWA Consulting.",
    ].join("\n"),
  },
};

export type AdminStore = {
  formations: FormationItem[];
  services: ServiceItem[];
  posts: PostItem[];
  partners: PartnerItem[];
  testimonials: TestimonialItem[];

  enrollments?: EnrollmentRequest[];

  emailTemplates?: Partial<EmailTemplates>;

  content?: { fr: Record<string, string>; en: Record<string, string> };

  activity?: ActivityEvent[];
  updatedAt?: string;
};







export const CONTENT_LABEL_KEY_RE =
  /^(formations\.items\.[^.]+\.name|formations\.featured\d+Name|services\.items\.[^.]+\.title|posts\.[^.]+\.title)$/;


export const formationCategories = [
  { value: "compta", label: "Comptabilité & Finance" },
  { value: "bureautique", label: "Bureautique & Développement" },
];

export const formationLevels = [
  { value: "debutant", label: "Débutant" },
  { value: "intermediaire", label: "Intermédiaire" },
  { value: "avance", label: "Avancé" },
];

export const serviceIcons = [
  { value: "audit", label: "Audit" },
  { value: "compta", label: "Comptabilité" },
  { value: "conseil", label: "Conseil" },
  { value: "formation", label: "Formation" },
  { value: "briefcase", label: "Entreprises" },
  { value: "event", label: "Événements" },
];

export const postCategories = [
  { value: "formations", label: "Formations" },
  { value: "audit", label: "Audit" },
  { value: "evenement", label: "Événement" },
];


export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['()]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase()
    .replace(/^-+|-+$/g, "");
}
