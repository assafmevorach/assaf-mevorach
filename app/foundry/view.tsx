"use client";
import { useEffect, useRef, useState } from "react";
import type { Dashboard, Waiting } from "./_lib/data";

const field = "w-full rounded-lg border border-sand/30 bg-ink px-3 py-3 text-base outline-none focus:border-glow";
const button = "min-h-11 rounded-lg bg-glow px-5 py-2 text-sm font-medium text-ink hover:bg-glow-soft disabled:opacity-50";
function DateLabel({ value }: { value: string }) {
  return <time dateTime={value} className="text-xs text-sand">{new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(value))} UTC</time>;
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="space-y-5 border-t border-sand/20 pt-8"><h2 className="font-display text-2xl sm:text-3xl">{title}</h2>{children}</section>;
}
export default function DashboardView({ initial }: { initial: Dashboard }) {
  const [data, setData] = useState(initial);
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const version = useRef(0); const saving = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    async function refresh() {
      if (document.hidden || saving.current) return;
      const revision = version.current;
      try {
        const response = await fetch("/api/foundry/data", { cache: "no-store", signal: controller.signal });
        if (response.status === 401) { window.location.replace("/foundry/login"); return; }
        if (!response.ok) throw new Error();
        const fresh = await response.json();
        if (revision === version.current) { setData(fresh); setError(""); }
      } catch { if (!controller.signal.aborted) setError("Live updates paused. Retrying shortly."); }
    }
    const timer = setInterval(refresh, 30000);
    document.addEventListener("visibilitychange", refresh);
    return () => { clearInterval(timer); controller.abort(); document.removeEventListener("visibilitychange", refresh); };
  }, []);
  async function save(action: string, body: unknown) {
    if (saving.current) return false;
    saving.current = true; version.current++; setBusy(true); setError("");
    try {
      const response = await fetch(`/api/foundry/${action}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json();
      if (response.status === 401) { window.location.replace("/foundry/login"); return false; }
      if (!response.ok) throw new Error(result.error);
      if (action === "logout") window.location.replace("/foundry/login"); else setData(result);
      return true;
    } catch (error) { setError(error instanceof Error ? error.message : "Unable to save. Try again."); return false; }
    finally { version.current++; saving.current = false; setBusy(false); }
  }
  function waiting(items: Waiting[], list: "waitingOnYou" | "waitingOnMe") {
    return <ul className="divide-y divide-sand/10">{items.length === 0 && <li className="py-4 text-sand">Nothing waiting.</li>}{items.map(item => <li key={item.id}>
      <label className="flex min-h-16 cursor-pointer items-start gap-4 py-4">
        <input className="mt-1 h-6 w-6 shrink-0 accent-glow" type="checkbox" checked={item.done} disabled={busy} onChange={event => void save("waiting", { list, id: item.id, done: event.target.checked })} />
        <span className="min-w-0"><span className={`mb-1 block break-words ${item.done ? "text-sand line-through" : ""}`}>{item.text}</span><DateLabel value={item.added} /></span>
      </label>
    </li>)}</ul>;
  }
  return <div className="space-y-10">
    <header className="flex items-start justify-between gap-4"><div><p className="mb-3 text-xs uppercase tracking-[0.25em] text-glow">Private workspace</p><h1 className="font-display text-5xl sm:text-6xl">Foundry</h1><p className="mt-4 text-sm text-sand">Project status, decisions, and inputs. Updates every 30 seconds.</p></div><button className="min-h-11 shrink-0 rounded-lg border border-sand/30 px-4 text-sm hover:border-glow disabled:opacity-50" disabled={busy} onClick={() => void save("logout", {})}>Sign out</button></header>
    {error && <p role="alert" className="rounded-lg border border-glow/40 bg-coal p-4 text-sm text-glow-soft">{error}</p>}
    <Section title="Now pursuing"><div className="space-y-3">{data.projects.length === 0 && <p className="text-sand">No active projects.</p>}{data.projects.map(project => <article key={project.id} className="grid gap-3 rounded-xl border border-sand/15 bg-coal p-5 sm:grid-cols-[1fr_2fr_auto] sm:items-start">
      <h3 className="break-words font-medium">{project.project}</h3><div className="min-w-0"><p className="mb-2 break-words text-sm leading-relaxed">{project.task}</p><DateLabel value={project.updated} /></div><span className={`w-fit rounded-full border px-3 py-1 text-xs ${project.status === "active" ? "border-glow/40 text-glow-soft" : project.status === "blocked" ? "border-red-300/40 text-red-200" : "border-sand/40 text-sand"}`}>{project.status}</span>
    </article>)}</div></Section>
    <Section title="Waiting on you">{waiting(data.waitingOnYou, "waitingOnYou")}</Section>
    <Section title="Waiting on me">{waiting(data.waitingOnMe, "waitingOnMe")}</Section>
    <Section title="Documents"><ul className="grid gap-3 sm:grid-cols-2">{data.documents.map(doc => <li key={doc.id} className="rounded-xl border border-sand/20 bg-coal p-5">{doc.url ? <a href={doc.url} target="_blank" rel="noopener noreferrer" className="block break-words py-1 text-glow-soft underline decoration-glow/40 underline-offset-4">{doc.label} ↗</a> : <><span>{doc.label}</span><p className="mt-2 text-sm text-sand">Link needed</p></>}</li>)}</ul></Section>
    <Section title="Inputs">
      <form className="space-y-4 rounded-xl border border-sand/20 bg-coal p-5" onSubmit={async event => {
        event.preventDefault(); const form = event.currentTarget; const values = new FormData(form);
        if (await save("inputs", { text: values.get("text"), project: values.get("project") })) form.reset();
      }}>
        <div><label htmlFor="input-text" className="mb-2 block text-sm">Note, idea, or request</label><textarea id="input-text" name="text" required maxLength={4000} rows={4} className={field} /></div>
        <div><label htmlFor="project-tag" className="mb-2 block text-sm">Project <span className="text-sand">(optional)</span></label><input id="project-tag" name="project" maxLength={100} className={field} /></div>
        <button className={button} disabled={busy}>Add input</button>
      </form>
      <div className="space-y-5">{data.inputs.map(input => <article key={input.id} className="space-y-4 rounded-xl border border-sand/20 bg-coal p-5">
        <div className="flex flex-wrap items-center gap-3"><DateLabel value={input.added} />{input.project && <span className="break-all rounded-full border border-sand/20 px-3 py-1 text-xs text-glow-soft">{input.project}</span>}</div>
        <p className="whitespace-pre-wrap break-words leading-relaxed">{input.text}</p>
        {input.comments.map(comment => <div key={comment.id} className="space-y-2 border-l border-glow/40 pl-4"><div className="flex flex-wrap items-center gap-2"><span className="text-xs font-medium text-glow-soft">{comment.author}</span><DateLabel value={comment.added} /></div><p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{comment.text}</p></div>)}
        <form className="space-y-3 border-t border-sand/15 pt-4" onSubmit={async event => {
          event.preventDefault(); const form = event.currentTarget;
          if (await save("comments", { inputId: input.id, text: new FormData(form).get("text") })) form.reset();
        }}><label htmlFor={`reply-${input.id}`} className="block text-sm text-sand">Add a comment</label><textarea id={`reply-${input.id}`} name="text" required maxLength={4000} rows={2} className={field} /><button className={button} disabled={busy}>Reply</button></form>
      </article>)}</div>
    </Section>
  </div>;
}
