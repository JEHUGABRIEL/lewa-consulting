import { redirect } from "next/navigation";
import { getActiveSessionFromCookies } from "@/lib/admin/auth";
import AdminApp from "@/components/admin/AdminApp";


export const dynamic = "force-dynamic";








export default async function AdminPage() {
  // Vérifie aussi que le compte existe et est actif : un utilisateur désactivé
  // ou supprimé est redirigé vers le login immédiatement (révocation de session).
  const session = await getActiveSessionFromCookies();
  if (!session) redirect("/admin/login");

  return <AdminApp />;
}
