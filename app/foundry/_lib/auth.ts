import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { kv } from "./kv";

export const COOKIE = "__Host-foundry";
export const PASSWORD_KEY = "foundry:password";
export const SESSION_SECONDS = 30 * 24 * 60 * 60;
export const cookieOptions = { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/", maxAge: SESSION_SECONDS };
export function sessionKey(token: string) { return `foundry:session:${createHash("sha256").update(token).digest("hex")}`; }
export async function authenticated(token?: string) {
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return false;
  const session = await kv.get<{ expires: number }>(sessionKey(token));
  return !!session && session.expires > Date.now();
}
export async function createSession() {
  const token = randomBytes(32).toString("hex");
  await kv.set(sessionKey(token), { expires: Date.now() + SESSION_SECONDS * 1000 }, { ttl: SESSION_SECONDS });
  return token;
}
export function setupAuthorized(token: unknown) {
  const expected = process.env.FOUNDRY_SETUP_TOKEN;
  if (!expected || expected.length < 32 || typeof token !== "string") return false;
  const digest = (text: string) => createHash("sha256").update(text).digest();
  return timingSafeEqual(digest(expected), digest(token));
}
