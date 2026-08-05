#!/usr/bin/env node







































import { spawn } from "node:child_process";
import crypto from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const NEXT_BIN = path.join(ROOT, "node_modules", "next", "dist", "bin", "next");
const HOST = "127.0.0.1";
const PORT = 3100 + Math.floor(Math.random() * 500);
const BASE = `http://${HOST}:${PORT}`;





const USERNAME = process.env.ADMIN_USERNAME || "admin";
const PASSWORD = process.env.ADMIN_PASSWORD || "admin123";


const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET || crypto.randomBytes(32).toString("hex");

// Secret du cron de rappels J-48h (l'endpoint refuse sans lui).
const CRON_SECRET = "e2e-cron-secret";


const CLIENT_IP = `10.${100 + Math.floor(Math.random() * 100)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;

let failures = 0;


const serverLogs = [];
const ok = (label) => console.log(`  ✓ ${label}`);
const fail = (label, detail) => {
  failures++;
  console.error(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`);
};


async function req(pathname, { method = "GET", body, cookie } = {}) {
  const headers = { "x-forwarded-for": CLIENT_IP };
  if (cookie) headers["cookie"] = `lewa_admin_session=${cookie}`;
  if (body) headers["content-type"] = "application/json";
  return fetch(`${BASE}${pathname}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    redirect: "manual",


    signal: AbortSignal.timeout(60_000),
  });
}


function sessionCookie(res) {
  const hit = res.headers.getSetCookie().find((c) => c.startsWith("lewa_admin_session="));
  if (!hit) return null;
  return hit.split(";")[0].split("=").slice(1).join("=");
}


async function waitForServer(timeoutMs = 180_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${BASE}/admin/login`, {
        redirect: "manual",
        signal: AbortSignal.timeout(5_000),
      });
      if (res.status === 200) return;
    } catch {

    }
    await new Promise((r) => setTimeout(r, 2_000));
  }
  throw new Error(
    `Le serveur n'a pas répondu sur ${BASE} — un autre serveur tourne-t-il sur ce port ? Compilation trop lente ?`,
  );
}

















async function pollPublicPage(pathname, predicate, timeoutMs = 15_000) {
  let last = { status: 0, text: "" };
  let deadline = 0;
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await req(pathname);
      last = { status: res.status, text: await res.text() };
    } catch {
      last = { status: 0, text: "" };
    }
    if (predicate(last.status, last.text)) return last;
    if (attempt === 0) {
      deadline = Date.now() + timeoutMs;
    } else if (Date.now() >= deadline) {
      return last;
    }
    await new Promise((r) => setTimeout(r, 1_000));
  }
}

async function main() {
  console.log(`Test E2E du parcours admin — ${BASE}\n`);



  const server = spawn(
    process.execPath,
    [NEXT_BIN, "dev", "-p", String(PORT), "-H", HOST],
    {
      cwd: ROOT,
      env: {
        ...process.env,
        ADMIN_USERNAME: USERNAME,
        ADMIN_PASSWORD: PASSWORD,
        ADMIN_SESSION_SECRET: SESSION_SECRET,
        CRON_SECRET,
        // Mode démo forcé : sans Resend, les envois sont « marqués livrés » de
        // façon déterministe (aucune dépendance à un vrai envoi ni rejet de
        // domaines réservés comme example.com dans les tests).
        RESEND_API_KEY: "",
      },
      detached: true,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  server.stdout.on("data", (d) => serverLogs.push(String(d)));
  server.stderr.on("data", (d) => serverLogs.push(String(d)));

  try {
    await waitForServer();


    let res = await req("/admin");
    if (res.status === 307 && res.headers.get("location")?.endsWith("/admin/login")) {
      ok("GET /admin (sans session) → 307 vers /admin/login");
    } else {
      fail(
        "GET /admin (sans session) → 307 vers /admin/login",
        `statut ${res.status}, location « ${res.headers.get("location")} »`,
      );
    }


    res = await req("/admin/login");
    const loginHtml = await res.text();
    if (res.status === 200 && loginHtml.includes("Se connecter")) {
      ok("GET /admin/login → 200, formulaire de connexion rendu");
    } else {
      fail("GET /admin/login → 200, formulaire de connexion rendu", `statut ${res.status}`);
    }


    res = await req("/api/admin/login", {
      method: "POST",
      body: { username: USERNAME, password: PASSWORD },
    });
    const loginBody = await res.json().catch(() => null);
    const cookie = sessionCookie(res);
    if (res.status === 200 && loginBody?.ok === true && cookie) {
      ok(`POST /api/admin/login → 200, session créée (utilisateur « ${loginBody.user} »)`);
    } else {
      fail(
        "POST /api/admin/login → 200 + cookie de session",
        `statut ${res.status}, body ${JSON.stringify(loginBody)}, cookie ${cookie ? "présent" : "absent"}`,
      );
    }


    res = await req("/admin", { cookie });
    if (res.status === 200) {
      ok("GET /admin (session) → 200, dashboard accessible");
    } else {
      fail("GET /admin (session) → 200, dashboard accessible", `statut ${res.status}`);
    }


    res = await req("/api/admin", { cookie });
    const store = await res.json().catch(() => null);
    if (res.status === 200 && store && Array.isArray(store.formations)) {
      ok(
        `GET /api/admin (session) → 200, store chargé (${store.formations.length} formation(s), ${store.posts.length} article(s))`,
      );
    } else {
      fail("GET /api/admin (session) → 200 + store JSON", `statut ${res.status}`);
    }


    if (
      res.status === 200 &&
      Array.isArray(store?.activity) &&
      store.activity.some((e) => e.action === "login" && e.username === USERNAME)
    ) {
      ok("Journal d'activité → connexion enregistrée dans le journal");
    } else {
      fail("Journal d'activité → connexion enregistrée", "événement « login » absent du store");
    }



    // — Modèles d'emails personnalisables (section « Emails ») —

    const E2E_SUBJECT = "E2E Confirmation personnalisée";
    const originalTemplates = store?.emailTemplates;
    res = await req("/api/admin", {
      method: "POST",
      body: {
        ...store,
        emailTemplates: {
          confirmation: {
            subject: E2E_SUBJECT,
            body: "Bonjour {name},\n\nMerci pour votre inscription à « {formation} ».",
          },
          reminder: {
            subject: "E2E Rappel {formation}",
            body: "Bonjour {name}, la formation « {formation} » commence le {startDate}.",
          },
        },
      },
      cookie,
    });
    const tplSaved = await res.json().catch(() => null);
    if (
      res.status === 200 &&
      tplSaved?.emailTemplates?.confirmation?.subject === E2E_SUBJECT
    ) {
      ok("POST /api/admin (modèles d'emails) → 200, templates personnalisés enregistrés");
    } else {
      fail(
        "POST /api/admin (modèles d'emails) → 200",
        `statut ${res.status}, subject ${tplSaved?.emailTemplates?.confirmation?.subject ?? "absent"}`,
      );
    }

    res = await req("/api/admin", { cookie });
    const tplStore = await res.json().catch(() => null);
    if (
      res.status === 200 &&
      tplStore?.emailTemplates?.confirmation?.subject === E2E_SUBJECT
    ) {
      ok("GET /api/admin → templates personnalisés persistés (sujet + corps)");
    } else {
      fail("GET /api/admin → templates persistés", `statut ${res.status}`);
    }







    const testSlug = `e2e-formation-${Date.now().toString(36)}`;
    const testName = `Formation E2E ${Date.now().toString(36)}`;
    // Base des POST de création/suppression : on réutilise le store re-fetché
    // APRÈS la sauvegarde des modèles d'emails — sinon ces POST renverraient les
    // anciens templates dans le corps et écraseraient les templates E2E avant
    // que le cron de rappel ne les lise.
    const originalStore = tplStore ?? store;
    const createdStore = {
      ...originalStore,
      formations: [
        ...originalStore.formations,
        {
          slug: testSlug,
          category: "compta",
          image:
            "https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/rapport-financier.avif",
          price: "99 999",
          level: "debutant",
          name: testName,
        },
      ],
    };



    try {



      res = await req("/api/admin", {
        method: "POST",
        body: {
          ...createdStore,
          activityEvent: { action: "create", entity: "formations", label: testSlug },
        },
        cookie,
      });
      const saved = await res.json().catch(() => null);
      if (
        res.status === 200 &&
        Array.isArray(saved?.formations) &&
        saved.formations.some((f) => f.slug === testSlug)
      ) {
        ok(`POST /api/admin (création) → 200, formation « ${testSlug} » dans le store`);
      } else {
        fail(
          "POST /api/admin (création) → 200, formation dans le store",
          `statut ${res.status}`,
        );
      }


      if (
        Array.isArray(saved?.activity) &&
        saved.activity.some(
          (e) => e.action === "create" && e.entity === "formations" && e.label === testSlug,
        )
      ) {
        ok("Journal d'activité → événement « création » enregistré");
      } else {
        fail("Journal d'activité → événement « création » enregistré", "absent de la réponse POST");
      }




      res = await req("/api/admin", { cookie });
      const persisted = await res.json().catch(() => null);
      if (
        res.status === 200 &&
        Array.isArray(persisted?.formations) &&
        persisted.formations.some((f) => f.slug === testSlug)
      ) {
        ok("GET /api/admin (persistance) → 200, la formation est bien relue du store");
      } else {
        fail(
          "GET /api/admin (persistance) → 200, formation relue du store",
          `statut ${res.status}`,
        );
      }


      const published = await pollPublicPage(
        `/fr/formations/${testSlug}`,
        (status, html) => status === 200 && html.includes(testName),
      );
      if (published && published.status === 200) {
        ok(`GET /fr/formations/${testSlug} → 200, la formation est publiée`);
      } else {
        fail(
          `GET /fr/formations/${testSlug} → 200 + nom affiché`,
          `dernier statut ${published ? published.status : "aucune réponse"}`,
        );
      }




      const inCategory = await pollPublicPage(
        "/fr/formations/comptabilite-finance",
        (status, html) => status === 200 && html.includes(testName),
      );
      if (inCategory && inCategory.status === 200) {
        ok("GET /fr/formations/comptabilite-finance → 200, la formation apparaît dans sa catégorie");
      } else {
        fail(
          "GET /fr/formations/comptabilite-finance → 200 + nom affiché",
          `dernier statut ${inCategory ? inCategory.status : "aucune réponse"}`,
        );
      }


      // Soft delete : la formation part en corbeille (deletedAt) — plus visible
      // sur le site, mais toujours présente dans le store (restaurable).
      const trashList = (saved?.formations ?? []).map((f) =>
        f.slug === testSlug ? { ...f, deletedAt: new Date().toISOString() } : f,
      );
      res = await req("/api/admin", {
        method: "POST",
        body: {
          ...saved,
          formations: trashList,
          activityEvent: { action: "delete", entity: "formations", label: testSlug },
        },
        cookie,
      });
      const softDeleted = await res.json().catch(() => null);
      if (
        res.status === 200 &&
        Array.isArray(softDeleted?.formations) &&
        softDeleted.formations.some((f) => f.slug === testSlug && f.deletedAt)
      ) {
        ok(`POST /api/admin (suppression) → 200, formation « ${testSlug} » en corbeille (deletedAt)`);
      } else {
        fail(
          "POST /api/admin (suppression) → 200, formation en corbeille",
          `statut ${res.status}`,
        );
      }


      if (
        Array.isArray(softDeleted?.activity) &&
        softDeleted.activity.some(
          (e) => e.action === "delete" && e.entity === "formations" && e.label === testSlug,
        )
      ) {
        ok("Journal d'activité → événement « suppression » (corbeille) enregistré");
      } else {
        fail("Journal d'activité → événement « suppression » (corbeille)", "absent de la réponse POST");
      }

      // Public : la formation en corbeille n'est plus visible (fiche + catégorie).
      const gone = await pollPublicPage(
        `/fr/formations/${testSlug}`,
        (status) => status === 404,
      );
      if (gone && gone.status === 404) {
        ok(`GET /fr/formations/${testSlug} → 404, la formation en corbeille n'est plus publique`);
      } else {
        fail(
          `GET /fr/formations/${testSlug} → 404 après suppression`,
          `dernier statut ${gone ? gone.status : "aucune réponse"}`,
        );
      }

      const goneFromCategory = await pollPublicPage(
        "/fr/formations/comptabilite-finance",
        (status, html) => status === 200 && !html.includes(testName),
      );
      if (goneFromCategory && goneFromCategory.status === 200) {
        ok("GET /fr/formations/comptabilite-finance → 200, la formation a disparu de sa catégorie");
      } else {
        fail(
          "GET /fr/formations/comptabilite-finance → 200 sans la formation en corbeille",
          `dernier statut ${goneFromCategory ? goneFromCategory.status : "aucune réponse"}`,
        );
      }

      // Restauration : la formation réapparaît dans le store puis sur le site.
      const restoredList = (softDeleted?.formations ?? []).map((f) =>
        f.slug === testSlug ? { ...f, deletedAt: undefined } : f,
      );
      res = await req("/api/admin", {
        method: "POST",
        body: {
          ...softDeleted,
          formations: restoredList,
          activityEvent: { action: "update", entity: "formations", label: testSlug },
        },
        cookie,
      });
      const restored = await res.json().catch(() => null);
      if (
        res.status === 200 &&
        Array.isArray(restored?.formations) &&
        restored.formations.some((f) => f.slug === testSlug && !f.deletedAt)
      ) {
        ok(`POST /api/admin (restauration) → 200, formation « ${testSlug} » restaurée (deletedAt retiré)`);
      } else {
        fail("POST /api/admin (restauration) → 200", `statut ${res.status}`);
      }

      const republished = await pollPublicPage(
        `/fr/formations/${testSlug}`,
        (status, html) => status === 200 && html.includes(testName),
      );
      if (republished && republished.status === 200) {
        ok(`GET /fr/formations/${testSlug} → 200 après restauration (republiée)`);
      } else {
        fail(
          `GET /fr/formations/${testSlug} → 200 après restauration`,
          `dernier statut ${republished ? republished.status : "aucune réponse"}`,
        );
      }

      // Purge définitive : la formation disparaît réellement du store.
      const purgedList = (restored?.formations ?? []).filter((f) => f.slug !== testSlug);
      res = await req("/api/admin", {
        method: "POST",
        body: {
          ...restored,
          formations: purgedList,
          activityEvent: {
            action: "delete",
            entity: "formations",
            label: `${testSlug} (définitif)`,
          },
        },
        cookie,
      });
      const purgedStore = await res.json().catch(() => null);
      if (
        res.status === 200 &&
        Array.isArray(purgedStore?.formations) &&
        !purgedStore.formations.some((f) => f.slug === testSlug)
      ) {
        ok(`POST /api/admin (purge) → 200, formation « ${testSlug} » supprimée définitivement`);
      } else {
        fail("POST /api/admin (purge) → 200, formation purgée", `statut ${res.status}`);
      }

      const goneAfterPurge = await pollPublicPage(
        `/fr/formations/${testSlug}`,
        (status) => status === 404,
      );
      if (goneAfterPurge && goneAfterPurge.status === 404) {
        ok(`GET /fr/formations/${testSlug} → 404 après purge définitive`);
      } else {
        fail(
          `GET /fr/formations/${testSlug} → 404 après purge`,
          `dernier statut ${goneAfterPurge ? goneAfterPurge.status : "aucune réponse"}`,
        );
      }
    } finally {
      // Nettoyage : quoi qu'il arrive, la formation de test ne doit plus être
      // présente dans le store (le store d'origine ne la contient pas).
      try {
        const cur = await req("/api/admin", { cookie });
        const curStore = await cur.json().catch(() => null);
        if (curStore && (curStore.formations ?? []).some((f) => f.slug === testSlug)) {
          await req("/api/admin", { method: "POST", body: originalStore, cookie });
          console.warn("  ! store d'origine restauré (étape échouée avant la purge)");
        }
      } catch (e) {
        console.error(`  ! restauration du store impossible : ${e.message}`);
      }
    }



























    const testEnrollName = `Demande E2E ${Date.now().toString(36)}`;

    const testEnrollPhone = `+22507${Date.now().toString().slice(-8)}`;
    let enrollId = null;
    let enrollStore = null;
    let enrollRemoved = false;
    try {



      res = await req("/api/enroll", {
        method: "POST",
        body: {
          formation: "Comptabilité bancaire",
          name: testEnrollName,
          phone: testEnrollPhone,
          countryCode: "+225",
          email: "e2e@example.com",
          availability: "Week-end",
        },
      });
      const enrollRes = await res.json().catch(() => null);
      if (res.status === 201 && enrollRes?.ok === true && enrollRes.id) {
        enrollId = enrollRes.id;
        ok("POST /api/enroll (public, sans session) → 201, demande d'inscription créée");
      } else {
        fail(
          "POST /api/enroll → 201 + id",
          `statut ${res.status}, body ${JSON.stringify(enrollRes)}`,
        );
      }



      res = await req("/api/enroll", {
        method: "POST",
        body: { formation: "X", name: "", phone: "123" },
      });
      if (res.status === 400) {
        ok("POST /api/enroll (payload invalide) → 400, validation rejetée");
      } else {
        fail("POST /api/enroll (payload invalide) → 400", `statut ${res.status}`);
      }

      res = await req("/api/enroll", {
        method: "POST",
        body: {
          formation: "Comptabilité bancaire",
          name: "Indicatif invalide",
          phone: "75000000",
          countryCode: "236",
        },
      });
      if (res.status === 400) {
        ok("POST /api/enroll (indicatif sans « + ») → 400, validation rejetée");
      } else {
        fail("POST /api/enroll (indicatif invalide) → 400", `statut ${res.status}`);
      }



      res = await req("/api/admin", { cookie });
      enrollStore = await res.json().catch(() => null);
      if (
        res.status === 200 &&
        enrollId &&
        Array.isArray(enrollStore?.enrollments) &&
        enrollStore.enrollments.some(
          (e) =>
            e.id === enrollId &&
            e.name === testEnrollName &&
            e.status === "pending" &&
            e.countryCode === "+225",
        )
      ) {
        ok("GET /api/admin → 200, la demande apparaît dans le store (statut « pending » + indicatif +225)");
      } else {
        fail(
          "GET /api/admin → demande présente dans le store",
          `statut ${res.status}`,
        );
      }



      const startDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      res = await req("/api/admin/enrollments", {
        method: "POST",
        body: { action: "confirm", id: enrollId, startDate },
        cookie,
      });
      const confirmRes = await res.json().catch(() => null);
      if (
        res.status === 200 &&
        enrollId &&
        confirmRes?.ok === true &&
        confirmRes.enrollment?.status === "confirmed" &&
        confirmRes.enrollment.confirmedAt &&
        confirmRes.enrollment.startDate === startDate &&
        typeof confirmRes.emailDelivered === "boolean"
      ) {
        ok(
          `POST /api/admin/enrollments (confirmation + date de session) → 200, statut « confirmed » + startDate (email : ${confirmRes.emailDelivered ? "livré" : "non livré"})`,
        );
      } else {
        fail(
          "POST /api/admin/enrollments (confirmation + startDate) → statut confirmed",
          `statut ${res.status}, body ${JSON.stringify(confirmRes)}`,
        );
      }





      res = await req("/api/admin", { cookie });
      const afterConfirmStore = await res.json().catch(() => null);
      if (
        res.status === 200 &&
        enrollId &&
        Array.isArray(afterConfirmStore?.enrollments) &&
        afterConfirmStore.enrollments.some(
          (e) => e.id === enrollId && e.status === "confirmed" && e.confirmedAt,
        )
      ) {
        ok("GET /api/admin → la confirmation est persistée dans le store");
      } else {
        fail(
          "GET /api/admin → confirmation persistée",
          `statut ${res.status}`,
        );
      }



      if (
        Array.isArray(afterConfirmStore?.activity) &&
        afterConfirmStore.activity.some(
          (e) =>
            e.action === "update" &&
            e.entity === "enrollments" &&
            e.label === testEnrollName,
        )
      ) {
        ok("Journal d'activité → confirmation de la demande enregistrée");
      } else {
        fail(
          "Journal d'activité → confirmation de la demande",
          "événement « update » absent du store",
        );
      }



      // — Rappel automatique J-48h (cron protégé par CRON_SECRET) —


      res = await req("/api/cron/reminders");
      if (res.status === 403 || res.status === 503) {
        ok("GET /api/cron/reminders (sans secret) → refusé (403/503)");
      } else {
        fail(
          "GET /api/cron/reminders (sans secret) → refusé",
          `statut ${res.status}`,
        );
      }


      res = await fetch(`${BASE}/api/cron/reminders`, {
        method: "GET",
        headers: {
          authorization: `Bearer ${CRON_SECRET}`,
          "x-forwarded-for": CLIENT_IP,
        },
        signal: AbortSignal.timeout(60_000),
      });
      const cronBody = await res.json().catch(() => null);
      if (
        res.status === 200 &&
        cronBody?.ok === true &&
        cronBody.due >= 1 &&
        cronBody.sent >= 1 &&
        cronBody.details.some((d) => d.id === enrollId && d.sent)
      ) {
        ok(
          `GET /api/cron/reminders (secret) → 200, rappel J-48h envoyé (${cronBody.sent} envoi(s))`,
        );
      } else {
        fail(
          "GET /api/cron/reminders (secret) → 200 + rappel envoyé",
          `statut ${res.status}, body ${JSON.stringify(cronBody)}`,
        );
      }

      // Preuve déterministe que le modèle personnalisé est utilisé : en mode
      // démo (sans clé Resend), l'envoi renvoie `preview.subject`, exposé dans
      // les détails du cron — aucune dépendance à la capture des logs serveur.
      const reminderDetail = (cronBody?.details ?? []).find((d) => d.id === enrollId);
      if (
        reminderDetail?.sent === true &&
        typeof reminderDetail.subject === "string" &&
        reminderDetail.subject.includes("E2E Rappel") &&
        // WhatsApp non configuré dans le test → le rappel part bien par EMAIL.
        reminderDetail.channel === "email"
      ) {
        ok("Rappel envoyé par EMAIL (canal « email ») avec le SUJET personnalisé du dashboard (« E2E Rappel … »)");
      } else {
        fail(
          "Rappel → canal email + sujet personnalisé",
          `détail du cron ${JSON.stringify(reminderDetail)} (attendu canal « email » + « E2E Rappel … »)`,
        );
      }


      res = await req("/api/admin", { cookie });
      const afterCronStore = await res.json().catch(() => null);
      const reminded = Array.isArray(afterCronStore?.enrollments)
        ? afterCronStore.enrollments.find((e) => e.id === enrollId)
        : null;
      if (
        res.status === 200 &&
        enrollId &&
        reminded?.reminderSentAt &&
        reminded.status === "confirmed"
      ) {
        ok("GET /api/admin → reminderSentAt posé (anti-doublon), statut conservé");
      } else {
        fail(
          "GET /api/admin → reminderSentAt posé",
          `statut ${res.status}, reminderSentAt ${reminded?.reminderSentAt ?? "absent"}`,
        );
      }


      res = await fetch(`${BASE}/api/cron/reminders`, {
        method: "GET",
        headers: {
          authorization: `Bearer ${CRON_SECRET}`,
          "x-forwarded-for": CLIENT_IP,
        },
        signal: AbortSignal.timeout(60_000),
      });
      const cronAgain = await res.json().catch(() => null);
      if (res.status === 200 && cronAgain?.sent === 0) {
        ok("GET /api/cron/reminders (2e passage) → 200, aucun re-envoi (anti-doublon)");
      } else {
        fail(
          "GET /api/cron/reminders (2e passage) → aucun re-envoi",
          `statut ${res.status}, body ${JSON.stringify(cronAgain)}`,
        );
      }



      // Soft delete : la demande part en corbeille (deletedAt), jamais retirée du store.
      res = await req("/api/admin/enrollments", {
        method: "POST",
        body: { action: "delete", id: enrollId },
        cookie,
      });
      const delRes = await res.json().catch(() => null);
      if (res.status === 200 && enrollId && delRes?.ok === true) {
        ok("POST /api/admin/enrollments (suppression) → 200, demande en corbeille");
      } else {
        fail(
          "POST /api/admin/enrollments (suppression) → 200",
          `statut ${res.status}, body ${JSON.stringify(delRes)}`,
        );
      }



      res = await req("/api/admin", { cookie });
      const afterDeleteStore = await res.json().catch(() => null);
      const trashed = Array.isArray(afterDeleteStore?.enrollments)
        ? afterDeleteStore.enrollments.find((e) => e.id === enrollId)
        : null;
      if (res.status === 200 && enrollId && trashed?.deletedAt) {
        ok("GET /api/admin → la demande est en corbeille (deletedAt posé)");
      } else {
        fail("GET /api/admin → demande en corbeille", `statut ${res.status}`);
      }



      if (
        enrollId &&
        Array.isArray(afterDeleteStore?.activity) &&
        afterDeleteStore.activity.some(
          (e) =>
            e.action === "delete" &&
            e.entity === "enrollments" &&
            e.label.includes(testEnrollName),
        )
      ) {
        ok("Journal d'activité → suppression de la demande (corbeille) enregistrée");
      } else {
        fail(
          "Journal d'activité → suppression de la demande",
          "événement « delete » absent du store",
        );
      }



      // Restauration depuis la corbeille (retire deletedAt).
      res = await req("/api/admin/enrollments", {
        method: "POST",
        body: { action: "restore", id: enrollId },
        cookie,
      });
      const restRes = await res.json().catch(() => null);
      if (res.status === 200 && enrollId && restRes?.ok === true) {
        ok("POST /api/admin/enrollments (restauration) → 200");
      } else {
        fail("POST /api/admin/enrollments (restauration) → 200", `statut ${res.status}`);
      }



      // Purge définitive : la demande disparaît réellement du store.
      res = await req("/api/admin/enrollments", {
        method: "POST",
        body: { action: "purge", id: enrollId },
        cookie,
      });
      const purRes = await res.json().catch(() => null);
      if (res.status === 200 && enrollId && purRes?.ok === true) {
        ok("POST /api/admin/enrollments (purge définitive) → 200");
      } else {
        fail("POST /api/admin/enrollments (purge définitive) → 200", `statut ${res.status}`);
      }



      res = await req("/api/admin", { cookie });
      const afterPurgeStore = await res.json().catch(() => null);
      if (
        res.status === 200 &&
        enrollId &&
        Array.isArray(afterPurgeStore?.enrollments) &&
        !afterPurgeStore.enrollments.some((e) => e.id === enrollId)
      ) {
        enrollRemoved = true;
        ok("GET /api/admin → la demande a disparu du store (purge définitive)");
      } else {
        fail(
          "GET /api/admin → demande retirée du store",
          `statut ${res.status}`,
        );
      }
    } finally {
      if (!enrollRemoved) {
        try {
          const clean = {
            ...(enrollStore ?? originalStore),
            enrollments: (enrollStore?.enrollments ?? originalStore.enrollments ?? []).filter(
              (e) => e.id !== enrollId,
            ),
            emailTemplates: originalTemplates,
          };
          await req("/api/admin", { method: "POST", body: clean, cookie });
          console.warn("  ! store restauré (étape demandes d'inscription inachevée)");
        } catch (e) {
          console.error(`  ! restauration du store impossible : ${e.message}`);
        }
      }
    }


    // Restaure les modèles d'emails d'origine (toujours, même après succès).
    try {
      const cur = await req("/api/admin", { cookie });
      const curStore = await cur.json().catch(() => null);
      if (curStore) {
        await req("/api/admin", {
          method: "POST",
          body: { ...curStore, emailTemplates: originalTemplates },
          cookie,
        });
      }
    } catch (e) {
      console.error(`  ! restauration des modèles d'emails impossible : ${e.message}`);
    }



    // — Réinitialisation du journal d'activité (bouton « Réinitialiser ») —

    res = await req("/api/admin", { cookie });
    const preResetStore = await res.json().catch(() => null);
    const preActivityCount = Array.isArray(preResetStore?.activity)
      ? preResetStore.activity.length
      : 0;
    const formationsBeforeReset = preResetStore?.formations?.length;
    if (res.status === 200 && preActivityCount > 0) {
      ok(`Journal d'activité → ${preActivityCount} événement(s) avant réinitialisation`);
    } else {
      fail(
        "Journal d'activité → événements présents avant reset",
        `statut ${res.status}, count ${preActivityCount}`,
      );
    }

    res = await req("/api/admin", {
      method: "POST",
      body: { ...preResetStore, resetActivity: true },
      cookie,
    });
    const resetRes = await res.json().catch(() => null);
    if (
      res.status === 200 &&
      Array.isArray(resetRes?.activity) &&
      resetRes.activity.length === 0 &&
      resetRes?.formations?.length === formationsBeforeReset
    ) {
      ok("POST /api/admin (resetActivity) → 200, journal vidé, contenu intact");
    } else {
      fail(
        "POST /api/admin (resetActivity) → 200, journal vidé",
        `statut ${res.status}, activity ${Array.isArray(resetRes?.activity) ? resetRes.activity.length : "?"}, formations ${resetRes?.formations?.length ?? "?"}`,
      );
    }

    res = await req("/api/admin", { cookie });
    const postResetStore = await res.json().catch(() => null);
    if (
      res.status === 200 &&
      Array.isArray(postResetStore?.activity) &&
      postResetStore.activity.length === 0
    ) {
      ok("GET /api/admin → journal toujours vide après réinitialisation (persisté)");
    } else {
      fail("GET /api/admin → journal vide après reset", `statut ${res.status}`);
    }





    res = await req("/admin", { cookie });
    if (res.status === 200) {
      ok("GET /admin (session, rechargement) → 200, session conservée");
    } else {
      fail("GET /admin (session, rechargement) → 200, session conservée", `statut ${res.status}`);
    }


    res = await req("/api/admin/logout", { method: "POST", cookie });
    if (res.status === 200) {
      ok("POST /api/admin/logout → 200, déconnexion");
    } else {
      fail("POST /api/admin/logout → 200, déconnexion", `statut ${res.status}`);
    }


    let logoutStore = null;
    try {
      logoutStore = JSON.parse(
        readFileSync(path.join(ROOT, "data", "admin-store.json"), "utf-8"),
      );
    } catch {

    }
    if (
      logoutStore &&
      Array.isArray(logoutStore.activity) &&
      logoutStore.activity.some((e) => e.action === "logout" && e.username === USERNAME)
    ) {
      ok("Journal d'activité → déconnexion enregistrée dans le journal");
    } else {
      fail(
        "Journal d'activité → déconnexion enregistrée",
        "événement « logout » absent du store persisté",
      );
    }


    res = await req("/admin");
    if (res.status === 307 && res.headers.get("location")?.endsWith("/admin/login")) {
      ok("GET /admin (après déconnexion) → 307 vers /admin/login, accès protégé");
    } else {
      fail(
        "GET /admin (après déconnexion) → 307 vers /admin/login",
        `statut ${res.status}, location « ${res.headers.get("location")} »`,
      );
    }


    res = await req("/api/admin");
    if (res.status === 401) {
      ok("GET /api/admin (après déconnexion) → 401, API protégée");
    } else {
      fail("GET /api/admin (après déconnexion) → 401, API protégée", `statut ${res.status}`);
    }
  } catch (err) {
    failures++;
    console.error(`  ✗ Erreur pendant le test : ${err.message}`);
    const tail = serverLogs.join("").trim().split("\n").slice(-15).join("\n");
    if (tail) console.error(`\n--- dernières lignes du serveur ---\n${tail}\n---------------------------------`);
  } finally {

    try {
      process.kill(-server.pid, "SIGTERM");
    } catch {
      server.kill("SIGTERM");
    }
  }

  console.log("");
  if (failures === 0) {
    console.log(
      "✓ Parcours admin validé (redirection → login → dashboard → création → publication fiche+catégorie → corbeille → restauration → purge → demandes d'inscription : soumission → confirmation → rappel J-48h → corbeille → restauration → purge → réinitialisation du journal → logout).",
    );
    process.exitCode = 0;
  } else {
    console.error(`✗ ${failures} étape(s) en échec — le parcours admin est cassé.`);
    process.exitCode = 1;
  }
}

main();
