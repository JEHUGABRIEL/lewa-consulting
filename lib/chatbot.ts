/** Données et utilitaires du chatbot */

export type QuickReply = {
  label: string;
  answer: string;
};

export const knowledge: QuickReply[] = [
  {
    label: "Nos services",
    answer:
      "Le Cabinet COSI Lewa-Consulting Group intervient dans six grands domaines d'expertise :\n\n1. Audit et Assurance — Audit financier, comptable, organisationnel, interne, de conformité, évaluation du contrôle interne et gestion des risques.\n2. Expertise Comptable et Finance — Tenue comptable, états financiers, assistance fiscale, digitalisation et déploiement de logiciels de gestion (SAGE et ERP).\n3. Conseil en Gouvernance et Développement Organisationnel — Diagnostic institutionnel, manuels de procédures, planification stratégique, suivi-évaluation.\n4. Formation et Renforcement des Capacités — Formations en audit, comptabilité, finance, informatique, bureautique, SAGE, gestion des ONG et gestion de projets.\n5. Accompagnement des Entreprises et Entrepreneurs — Création d'entreprises, business plans, études de faisabilité et recherche de financement.\n6. Organisation d'Événements Professionnels — Forums économiques, conférences internationales, séminaires, ateliers et salons.",
  },
  {
    label: "Tarifs formations",
    answer:
      "Nos formations sont accessibles à partir de 30 000 FCFA (Art oratoire) jusqu'à 75 000 FCFA (Comptabilité bancaire, SYCEBNL).\n\nLe paiement est possible par tranches, chaque semaine. Les sessions sont flexibles : en semaine, le soir ou le week-end.\n\nConsultez notre grille complète sur la page Formations.",
  },
  {
    label: "Nous contacter",
    answer:
      "Vous pouvez nous joindre par :\n\nTéléphone : +236 72 69 67 00 / +236 75 34 37 19\nEmail : cabinetcosi29@gmail.com\nSiège : Avenue des Martyrs — SOCATEL, en face du Stade 20 000 Places, Bangui\n\nOu utilisez notre formulaire de contact en ligne.",
  },
  {
    label: "Horaires",
    answer:
      "Nos formations et services sont accessibles en semaine, ainsi qu'en soirée et le week-end pour s'adapter à votre emploi du temps.\n\nContactez-nous pour convenir d'un rendez-vous.",
  },
  {
    label: "À propos",
    answer:
      "Le Cabinet COSI Lewa-Consulting Group, basé à Bangui (République Centrafricaine), accompagne depuis plus de 10 ans les entreprises, ONG et particuliers dans leurs besoins en audit, comptabilité et formation professionnelle.\n\nNotre équipe de professionnels met un point d'honneur à allier rigueur technique et proximité humaine.",
  },
];

export const fallback =
  "Je suis désolé, je n'ai pas encore la réponse à cette question. N'hésitez pas à nous contacter directement par téléphone au +236 72 69 67 00 ou au +236 75 34 37 19, ou par email à cabinetcosi29@gmail.com pour une réponse personnalisée.";

export function normalize(str: string): string {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function findAnswer(input: string): string | null {
  const q = normalize(input);
  if (q.includes("service") || q.includes("audit") || q.includes("comptab") || q.includes("formation"))
    return knowledge[0].answer;
  if (q.includes("tarif") || q.includes("prix") || q.includes("cout") || q.includes("combien") || q.includes("frais") || q.includes("paye"))
    return knowledge[1].answer;
  if (q.includes("contact") || q.includes("telephone") || q.includes("email") || q.includes("adresse") || q.includes("joindre"))
    return knowledge[2].answer;
  if (q.includes("horaire") || q.includes("heure") || q.includes("quand") || q.includes("semaine") || q.includes("jour"))
    return knowledge[3].answer;
  if (q.includes("propos") || q.includes("cabinet") || q.includes("qui") || q.includes("present") || q.includes("histoire"))
    return knowledge[4].answer;
  return null;
}
