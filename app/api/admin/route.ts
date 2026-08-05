import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import type { ActivityEventInput, AdminStore } from "@/lib/admin/constants";
import { clientKey, getActiveSessionFromRequest } from "@/lib/admin/auth";
import { readStore, writeStore } from "@/lib/admin/store";
import { appendActivityEvent, makeActivityEvent } from "@/lib/admin/activity";
import { invalidateStoreCache } from "@/lib/admin/public";









export async function GET(req: NextRequest) {
  if (!(await getActiveSessionFromRequest(req))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    const store = await readStore();
    return NextResponse.json(store);
  } catch (err) {
    console.error("[admin] readStore failed:", err);
    return NextResponse.json({ error: "Lecture impossible" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getActiveSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    const body = (await req.json()) as Partial<AdminStore> & {
      activityEvent?: ActivityEventInput;
      resetActivity?: boolean;
    };


    const current = await readStore();
    const candidate: AdminStore = {
      formations: Array.isArray(body.formations) ? body.formations : [],
      services: Array.isArray(body.services) ? body.services : [],
      posts: Array.isArray(body.posts) ? body.posts : [],
      partners: Array.isArray(body.partners) ? body.partners : [],
      testimonials: Array.isArray(body.testimonials) ? body.testimonials : [],


      enrollments: Array.isArray(body.enrollments)
        ? body.enrollments
        : current.enrollments ?? [],



      emailTemplates: body.emailTemplates ?? current.emailTemplates,

      content: body.content ?? current.content,





      // Le journal est vidé uniquement via le flag explicite `resetActivity`
      // (bouton « Réinitialiser » du dashboard) : sans lui, le client ne
      // contrôle jamais l'historique — il reste en écriture serveur seule.
      activity: body.resetActivity
        ? []
        : body.activityEvent
          ? appendActivityEvent(
              current.activity ?? [],
              makeActivityEvent({
                ...body.activityEvent,
                username: session.user,
                ip: clientKey(req),
              }),
            )
          : current.activity,
      updatedAt: body.updatedAt,
    };

    const size =
      candidate.formations.length +
      candidate.services.length +
      candidate.posts.length +
      candidate.partners.length +
      candidate.testimonials.length +
      (candidate.enrollments ?? []).length;
    // Un payload ne contenant QUE `resetActivity` (sans aucune donnée) est
    // rejeté : le reset ne peut pas vider silencieusement tout le contenu.
    const hasDataKeys = (
      [
        "formations",
        "services",
        "posts",
        "partners",
        "testimonials",
        "enrollments",
        "emailTemplates",
        "content",
      ] as const
    ).some((k) => k in body);
    if (size === 0 && !hasDataKeys) {
      return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
    }
    const store = await writeStore(candidate);





    invalidateStoreCache();
    revalidatePath("/fr", "layout");
    revalidatePath("/en", "layout");
    revalidatePath("/sitemap.xml");

    return NextResponse.json(store);
  } catch (err) {
    console.error("[admin] writeStore failed:", err);
    return NextResponse.json({ error: "Écriture impossible" }, { status: 500 });
  }
}
