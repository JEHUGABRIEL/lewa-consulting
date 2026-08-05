import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { routing } from "./src/i18n/routing";
import { allFormations } from "./lib/formations";
import { servicesData } from "./lib/services";
import { posts } from "./lib/posts";























const intlMiddleware = createMiddleware(routing);


function isAdminZone(pathname: string): boolean {
  return (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/api/admin" ||
    pathname.startsWith("/api/admin/")
  );
}

// Méthodes HTTP qui modifient l'état serveur — soumises au contrôle CSRF.
const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// ---------------------------------------------------------------------------
// Contrôle same-origin CSRF pour les mutations admin.
//
// Toutes les mutations sur /api/admin/* doivent provenir du même origin que
// le serveur. SameSite=Lax protège contre les soumissions de formulaires
// cross-site classiques, mais ne couvre pas :
//   - les requêtes fetch() cross-origin avec cookies (selon le navigateur) ;
//   - un éventuel leak de cookie sur un sous-domaine ;
//   - les environnements qui ignorent ou contournent SameSite.
//
// Algorithme :
//   1. Si la méthode est sûre (GET, HEAD, OPTIONS, …) → on laisse passer.
//   2. On extrait l'origin de confiance depuis SITE_URL ou le Host courant.
//   3. On vérifie l'en-tête `Origin` en priorité (toujours envoyé par les
//      fetch/XHR cross-origin). Si absent, on se rabat sur `Referer`.
//   4. Si aucun des deux n'est présent sur une requête mutante authentifiée,
//      on refuse (cela ne peut pas être une requête légitime du dashboard).
// ---------------------------------------------------------------------------
function rejectCsrf(request: NextRequest): NextResponse | null {
  if (!MUTATING_METHODS.has(request.method)) return null;

  // On ne protège que les appels portant un cookie de session.
  const hasCookie = request.cookies.has("lewa_admin_session");
  if (!hasCookie) return null;

  // Dérive l'origin de confiance : SITE_URL en priorité, sinon Host de la
  // requête (fiable derrière un proxy comme Vercel qui contrôle le Host).
  const siteUrl = process.env.SITE_URL?.replace(/\/+$/, "");
  const trustedOrigin =
    siteUrl ??
    (() => {
      const host = request.headers.get("host");
      const proto =
        request.headers.get("x-forwarded-proto") ??
        (process.env.NODE_ENV === "production" ? "https" : "http");
      return host ? `${proto}://${host}` : null;
    })();

  if (!trustedOrigin) return null; // impossible de valider → on laisse passer

  // Vérifie Origin puis Referer.
  const origin = request.headers.get("origin");
  if (origin) {
    if (origin !== trustedOrigin) {
      return new NextResponse(
        JSON.stringify({ error: "Requête refusée : origin non autorisé." }),
        { status: 403, headers: { "Content-Type": "application/json" } },
      );
    }
    return null; // origin valide
  }

  const referer = request.headers.get("referer");
  if (referer) {
    if (!referer.startsWith(trustedOrigin + "/") && referer !== trustedOrigin) {
      return new NextResponse(
        JSON.stringify({ error: "Requête refusée : referer non autorisé." }),
        { status: 403, headers: { "Content-Type": "application/json" } },
      );
    }
    return null; // referer valide
  }

  // Ni Origin ni Referer sur une requête mutante authentifiée → refus.
  return new NextResponse(
    JSON.stringify({ error: "Requête refusée : en-tête Origin absent." }),
    { status: 403, headers: { "Content-Type": "application/json" } },
  );
}







function buildCsp(nonce: string): string {
  const isDev = process.env.NODE_ENV === "development";





  const directives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${
      isDev ? " 'unsafe-eval'" : ""
    }`,

    `style-src 'self' 'nonce-${nonce}'${isDev ? " 'unsafe-inline'" : ""}`,

    "img-src 'self' data: blob: https://res.cloudinary.com",

    "font-src 'self'",

    `connect-src 'self'${isDev ? " ws:" : ""}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",

    "frame-ancestors 'none'",
    "frame-src 'none'",

    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ];
  return directives.join("; ");
}














const SLUG_PATH_RE = /^\/(fr|en)\/(formations|services|actualites)\/([^/]+)\/?$/;

const STATIC_SLUGS: Record<string, string[]> = {
  formations: allFormations.map((f) => f.slug),
  services: servicesData.map((s) => s.slug),
  actualites: posts.map((p) => p.slug),
};

const STORE_FILE = path.join(process.cwd(), "data", "admin-store.json");


const STORE_TTL_MS = 1_000;
let storeSlugsCache: {
  value: Record<string, string[]> | null;
  at: number;
} | null = null;


async function readStoreSlugs(): Promise<Record<string, string[]> | null> {
  const now = Date.now();
  if (storeSlugsCache && now - storeSlugsCache.at < STORE_TTL_MS) {
    return storeSlugsCache.value;
  }
  let value: Record<string, string[]> | null = null;
  try {
    const raw = await fs.readFile(STORE_FILE, "utf-8");
    const data = JSON.parse(raw) as {
      formations?: { slug?: string }[];
      services?: { slug?: string }[];
      posts?: { slug?: string }[];
    };
    value = {
      formations: (data.formations ?? []).map((i) => i.slug).filter(Boolean) as string[],
      services: (data.services ?? []).map((i) => i.slug).filter(Boolean) as string[],
      actualites: (data.posts ?? []).map((i) => i.slug).filter(Boolean) as string[],
    };
  } catch {
    value = null;  
  }
  storeSlugsCache = { value, at: now };
  return value;
}







function isRscRequest(request: NextRequest): boolean {
  return request.headers.get("accept")?.includes("text/x-component") ?? false;
}









async function isMissingContentSlug(pathname: string): Promise<boolean> {
  const m = SLUG_PATH_RE.exec(pathname);
  if (!m) return false;
  const collection = m[2];
  const slug = m[3];
  if (STATIC_SLUGS[collection].includes(slug)) return false;
  const store = await readStoreSlugs();
  if (!store) return false;
  return !store[collection].includes(slug);
}


function applyAdminSecurityHeaders(request: NextRequest): NextResponse {


  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCsp(nonce);



  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });


  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  );






  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");

  response.headers.set("X-Permitted-Cross-Domain-Policies", "none");




  response.headers.set("Cache-Control", "no-store");

  return response;
}

// En-têtes de sécurité de base appliqués à TOUTES les réponses hors zone admin
// (site public + API publiques). La zone admin conserve sa CSP stricte à nonce
// (`applyAdminSecurityHeaders`). Ici, on retient une CSP compatible avec les
// scripts inline légitimes (JSON-LD SEO, déjà échappés) et les styles injectés
// par Next/Tailwind, tout en bloquant le clickjacking, l'injection de <base>,
// les plugins (object/embed) et le sniffing de type MIME.
function applyBaselineSecurityHeaders(response: NextResponse): NextResponse {
  const isDev = process.env.NODE_ENV === "development";

  const csp = [
    "default-src 'self'",
    // 'unsafe-inline' reste nécessaire pour le JSON-LD et les styles inline ;
    // l'injection de contenu admin est neutralisée à la source (assainissement
    // HTML dans src/i18n/request.ts).
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://res.cloudinary.com",
    "font-src 'self'",
    `connect-src 'self'${isDev ? " ws:" : ""}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  );
  return response;
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;


  if (isAdminZone(pathname)) {
    // Contrôle CSRF sur toutes les mutations admin (POST/PUT/PATCH/DELETE).
    const csrfBlock = rejectCsrf(request);
    if (csrfBlock) return csrfBlock;
    return applyAdminSecurityHeaders(request);
  }



  if (
    process.env.NODE_ENV === "development" &&
    isRscRequest(request) &&
    (await isMissingContentSlug(pathname))
  ) {
    return new NextResponse("Not Found", {
      status: 404,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }


  if (pathname.startsWith("/api/") || pathname.startsWith("/trpc/")) {
    return applyBaselineSecurityHeaders(NextResponse.next());
  }


  return applyBaselineSecurityHeaders(intlMiddleware(request));
}

export const config = {


  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
