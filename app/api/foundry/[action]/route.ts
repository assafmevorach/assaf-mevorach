import { NextRequest, NextResponse } from "next/server";
import { randomUUID, createHash, timingSafeEqual } from "node:crypto";
import { hash, compare } from "bcryptjs";
import { authenticated, COOKIE, cookieOptions, createSession, PASSWORD_KEY, sessionKey, setupAuthorized } from "../../../foundry/_lib/auth";
import { getDashboard, updateDashboard } from "../../../foundry/_lib/data";
import { kv, StorageUnavailable } from "../../../foundry/_lib/kv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }
const json = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" } });
function machine(request: NextRequest) {
  const expected = process.env.FOUNDRY_ORCHESTRATOR_TOKEN;
  const value = request.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!expected || expected.length < 32 || !value) return false;
  const digest = (s: string) => createHash("sha256").update(s).digest();
  return timingSafeEqual(digest(value), digest(expected));
}
async function requireAuth(request: NextRequest) {
  const orchestrator = machine(request);
  if (!orchestrator && !await authenticated(request.cookies.get(COOKIE)?.value)) throw new HttpError(401, "Sign in to continue.");
  return orchestrator;
}
function failure(error: unknown) {
  if (error instanceof HttpError) return json({ error: error.message }, error.status);
  if (error instanceof StorageUnavailable) return json({ error: "Foundry storage is unavailable." }, 503);
  return json({ error: "Unable to save. Try again." }, 500);
}
async function body(request: NextRequest): Promise<Record<string, unknown>> {
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new HttpError(415, "Send JSON.");
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "Missing request body.");
  const chunks: Uint8Array[] = []; let size = 0;
  while (true) {
    const { value, done } = await reader.read(); if (done) break;
    size += value.length;
    if (size > 16384) { await reader.cancel(); throw new HttpError(413, "Request is too large."); }
    chunks.push(value);
  }
  try {
    const parsed = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
    return parsed;
  } catch { throw new HttpError(400, "Invalid JSON."); }
}
function text(value: unknown, max = 4000): string {
  if (typeof value !== "string" || !value.trim() || value.length > max) throw new HttpError(400, `Enter text between 1 and ${max} characters.`);
  return value.trim();
}

export async function GET(request: NextRequest, context: RouteContext<"/api/foundry/[action]">) {
  try {
    if ((await context.params).action !== "data") throw new HttpError(404, "Not found.");
    await requireAuth(request);
    return json(await getDashboard());
  } catch (error) { return failure(error); }
}

export async function POST(request: NextRequest, context: RouteContext<"/api/foundry/[action]">) {
  try {
    const { action } = await context.params;
    if (!["setup", "login", "logout", "inputs", "comments", "waiting", "projects", "documents"].includes(action)) throw new HttpError(404, "Not found.");
    // Browser writes require a same-origin request. Only machine-authenticated data writes bypass this.
    const isMachine = !["setup", "login", "logout"].includes(action) && machine(request);
    if (!isMachine && request.headers.get("origin") !== request.nextUrl.origin) throw new HttpError(403, "Request origin is not allowed.");
    if (action === "setup" || action === "login") {
      if (await kv.attempts("foundry:auth-attempts", 900) > 20) throw new HttpError(429, "Too many attempts. Try again in 15 minutes.");
      const data = await body(request);
      const existing = await kv.get<string>(PASSWORD_KEY);
      if (action === "setup" && existing) throw new HttpError(409, "A password is already set. Sign in.");
      if (action === "setup" && !setupAuthorized(data.setupToken)) throw new HttpError(403, "Open your private setup link to set a password.");
      if (typeof data.password !== "string" || [...data.password].length < 12 || Buffer.byteLength(data.password) > 72) throw new HttpError(400, "Use at least 12 characters and at most 72 UTF-8 bytes.");
      if (action === "setup") {
        if (!await kv.set(PASSWORD_KEY, await hash(data.password, 12), { nx: true })) throw new HttpError(409, "A password is already set. Sign in.");
      } else if (!existing || !await compare(data.password, existing)) throw new HttpError(401, "Incorrect password.");
      const response = json({ ok: true });
      const oldToken = request.cookies.get(COOKIE)?.value;
      if (oldToken) await kv.delete(sessionKey(oldToken));
      response.cookies.set(COOKIE, await createSession(), cookieOptions);
      return response;
    }
    if (action === "logout") {
      const token = request.cookies.get(COOKIE)?.value;
      if (token) await kv.delete(sessionKey(token));
      const response = json({ ok: true });
      response.cookies.set(COOKIE, "", { ...cookieOptions, maxAge: 0 });
      return response;
    }
    const orchestrator = await requireAuth(request);
    const data = await body(request);
    const now = new Date().toISOString();
    const result = await updateDashboard(state => {
      if (action === "inputs") {
        state.inputs.unshift({ id: randomUUID(), text: text(data.text), project: data.project ? text(data.project, 100) : "", added: now, comments: [] });
      } else if (action === "comments") {
        const input = state.inputs.find(item => item.id === data.inputId);
        if (!input) throw new HttpError(404, "Input not found.");
        input.comments.push({ id: randomUUID(), text: text(data.text), added: now, author: orchestrator ? "Orchestrator" : "Founder" });
      } else if (action === "waiting") {
        if (data.list !== "waitingOnYou" && data.list !== "waitingOnMe") throw new HttpError(400, "Invalid list.");
        const items = state[data.list];
        if (data.id) {
          const item = items.find(item => item.id === data.id);
          if (!item) throw new HttpError(404, "Item not found.");
          if (typeof data.done !== "boolean") throw new HttpError(400, "Choose done or not done.");
          item.done = data.done;
        } else {
          items.push({ id: randomUUID(), text: text(data.text), added: now, done: false });
        }
      } else if (action === "projects") {
        if (!["active", "waiting", "blocked"].includes(String(data.status))) throw new HttpError(400, "Invalid status.");
        const row = { id: data.id ? text(data.id, 100) : randomUUID(), project: text(data.project, 100), task: text(data.task), status: data.status as "active" | "waiting" | "blocked", updated: now };
        const index = state.projects.findIndex(item => item.id === row.id);
        if (index < 0) state.projects.push(row); else state.projects[index] = row;
      } else if (action === "documents") {
        const url = text(data.url, 2000);
        try { if (new URL(url).protocol !== "https:") throw new Error(); } catch { throw new HttpError(400, "Use an HTTPS document URL."); }
        const row = { id: data.id ? text(data.id, 100) : randomUUID(), label: text(data.label, 200), url };
        const index = state.documents.findIndex(item => item.id === row.id);
        if (index < 0) state.documents.push(row); else state.documents[index] = row;
      }
    });
    return json(result);
  } catch (error) { return failure(error); }
}
