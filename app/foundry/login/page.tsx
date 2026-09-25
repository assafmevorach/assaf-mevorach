import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authenticated, COOKIE, PASSWORD_KEY } from "../_lib/auth";
import { kv } from "../_lib/kv";
import LoginForm from "./form";

export const dynamic = "force-dynamic";
export default async function LoginPage() {
  let ready = false; let setup = false; let signedIn = false;
  try {
    signedIn = await authenticated((await cookies()).get(COOKIE)?.value);
    setup = !await kv.get(PASSWORD_KEY);
    ready = !setup || (process.env.FOUNDRY_SETUP_TOKEN?.length ?? 0) >= 32;
  } catch { /* Storage is deliberately fail-closed. */ }
  if (signedIn) redirect("/foundry");
  return <div className="mx-auto max-w-sm py-16 sm:py-24">
    <p className="mb-5 text-xs uppercase tracking-[0.25em] text-glow">Foundry / Private</p>
    <h1 className="mb-8 font-display text-4xl">{ready ? setup ? "Set your password" : "Enter password" : "Foundry is unavailable"}</h1>
    {ready ? <LoginForm setup={setup} /> : <p className="leading-relaxed text-sand">Private access needs configuration. Contact the site owner.</p>}
  </div>;
}
