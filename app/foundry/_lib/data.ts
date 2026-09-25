import { randomUUID } from "node:crypto";
import { kv } from "./kv";

export type Project = { id: string; project: string; task: string; status: "active" | "waiting" | "blocked"; updated: string };
export type Waiting = { id: string; text: string; added: string; done: boolean };
export type Document = { id: string; label: string; url: string | null };
export type Input = { id: string; text: string; project: string; added: string; comments: { id: string; text: string; added: string; author: "Founder" | "Orchestrator" }[] };
export type Dashboard = { projects: Project[]; waitingOnYou: Waiting[]; waitingOnMe: Waiting[]; documents: Document[]; inputs: Input[] };
const KEY = "foundry:dashboard";
function documentUrl(value?: string) { try { return value && new URL(value).protocol === "https:" ? value : null; } catch { return null; } }
function seed(): Dashboard {
  const now = new Date().toISOString();
  return {
    projects: [{ id: randomUUID(), project: "Website", task: "Review the Foundry dashboard (sample)", status: "active", updated: now }],
    waitingOnYou: [{ id: randomUUID(), text: "Choose the next project priority (sample)", added: now, done: false }],
    waitingOnMe: [{ id: randomUUID(), text: "Prepare the next project update (sample)", added: now, done: false }],
    documents: [
      { id: randomUUID(), label: "Foundry procedures", url: documentUrl(process.env.FOUNDRY_PROCEDURES_URL) },
      { id: randomUUID(), label: "Website brief", url: documentUrl(process.env.FOUNDRY_WEBSITE_BRIEF_URL) },
    ],
    inputs: [{ id: randomUUID(), text: "Use this space for notes, ideas, and requests. (Sample)", project: "Website", added: now,
      comments: [{ id: randomUUID(), text: "Project replies appear here. (Sample)", added: now, author: "Orchestrator" }] }],
  };
}
export async function getDashboard(): Promise<Dashboard> {
  const existing = await kv.get<Dashboard>(KEY);
  if (existing) return existing;
  await kv.set(KEY, seed(), { nx: true });
  return (await kv.get<Dashboard>(KEY))!;
}
export async function updateDashboard(change: (data: Dashboard) => void) {
  for (let i = 0; i < 8; i++) {
    const before = await getDashboard();
    const after = structuredClone(before);
    change(after);
    if (await kv.compareAndSet(KEY, before, after)) return after;
  }
  throw new Error("Concurrent update. Try again.");
}
