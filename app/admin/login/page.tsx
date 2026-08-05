import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/admin/auth";
import LoginScreen from "@/components/admin/LoginScreen";


export const dynamic = "force-dynamic";








export default async function AdminLoginPage() {
  const session = await getSessionFromCookies();
  if (session) redirect("/admin");

  return <LoginScreen />;
}
