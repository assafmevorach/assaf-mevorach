import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authenticated, COOKIE } from "./_lib/auth";
import { getDashboard } from "./_lib/data";
import DashboardView from "./view";

export const dynamic = "force-dynamic";
export default async function FoundryPage() {
  if (!await authenticated((await cookies()).get(COOKIE)?.value)) redirect("/foundry/login");
  return <DashboardView initial={await getDashboard()} />;
}
