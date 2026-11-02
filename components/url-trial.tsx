"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const STORAGE = "plugmychat-trial";

type Page = { title: string; text: string; url: string };
type Bubble = { role: "user" | "assistant"; content: string };

export function UrlTrial() {
  const [url, setUrl] = useState("");
  const [page, setPage] = useState<Page | null>(null);
  const [name, setName] = useState("Site guide");
  const [welcome, setWelcome] = useState("Ask about this page. I only answer from what it says.");
  const [accent, setAccent] = useState("#1f7a4d");
  const [launcherLabel, setLauncherLabel] = useState("Chat");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Bubble[]>([]);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE);
    if (!raw) return;
    try {
      const saved = JSON.parse(raw) as Page & { name: string; welcome: string; accent: string; launcherLabel: string };
      setPage({ title: saved.title, text: saved.text, url: saved.url });
      setUrl(saved.url);
      setName(saved.name);
      setWelcome(saved.welcome);
      setAccent(saved.accent);
      setLauncherLabel(saved.launcherLabel);
      setMessages([{ role: "assistant", content: saved.welcome }]);
    } catch {
      sessionStorage.removeItem(STORAGE);
    }
  }, []);

  function remember(next: Page, look: { name: string; welcome: string; accent: string; launcherLabel: string }) {
    sessionStorage.setItem(STORAGE, JSON.stringify({ ...next, ...look }));
  }

  async function loadPage(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");
    const response = await fetch("/api/trial", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const body = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(body.error || "That page could not be read.");
      return;
    }
    const next = { title: body.title, text: body.text, url: body.url };
    setPage(next);
    setMessages([{ role: "assistant", content: welcome }]);
    setOpen(true);
    remember(next, { name, welcome, accent, launcherLabel });
  }

  async function ask(event: React.FormEvent) {
    event.preventDefault();
    if (!page || !draft.trim() || busy) return;
    const question = draft.trim();
    setDraft("");
    setBusy(true);
    setError("");
    setMessages((current) => [...current, { role: "user", content: question }]);
    const response = await fetch("/api/trial/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: page.title, text: page.text, question }),
    });
    const body = await response.json();
    setBusy(false);
    if (!response.ok) {
      setError(body.error || "The trial could not answer.");
      return;
    }
    setMessages((current) => [...current, { role: "assistant", content: body.content }]);
  }

  async function keep() {
    if (!page) return;
    setError("");
    setNotice("");
    remember(page, { name, welcome, accent, launcherLabel });
    const me = await fetch("/api/me");
    if (me.status === 401) {
      window.location.href = "/sign-in";
      return;
    }
    const created = await fetch("/api/agents", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, welcome, accent, launcherLabel }),
    });
    const agentBody = await created.json();
    if (!created.ok) {
      setError(agentBody.error || "Could not save the agent.");
      return;
    }
    const source = await fetch(`/api/agents/${agentBody.agent.id}/sources`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind: "url", title: page.title, text: page.text, url: page.url }),
    });
    const sourceBody = await source.json();
    if (!source.ok) {
      setError(sourceBody.error || "The agent was created, but the page was not saved.");
      return;
    }
    sessionStorage.removeItem(STORAGE);
    window.location.href = `/app/agents/${agentBody.agent.id}`;
  }

  return (
    <div id="trial" className="grid items-start gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div>
        <h2>Try one page.</h2>
        <p className="mt-3 text-muted-foreground">
          This is a trial of how the bot will answer from a single public page. It is not a finished agent. Add more pages after you keep it.
        </p>
        <form onSubmit={loadPage} className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Label htmlFor="trial-url" className="sr-only">Page URL</Label>
          <Input
            id="trial-url"
            type="url"
            required
            placeholder="https://example.com/pricing"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
          />
          <Button type="submit" disabled={loading}>{loading ? "Reading…" : "Read page"}</Button>
        </form>
        {page ? <p className="mt-3 text-sm text-muted-foreground">Read “{page.title}”.</p> : null}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="trial-name">Name</Label>
            <Input id="trial-name" value={name} onChange={(event) => setName(event.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="trial-label">Launcher label</Label>
            <Input id="trial-label" value={launcherLabel} maxLength={24} onChange={(event) => setLauncherLabel(event.target.value)} className="mt-1" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="trial-welcome">Welcome</Label>
            <Input id="trial-welcome" value={welcome} onChange={(event) => setWelcome(event.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="trial-accent">Accent</Label>
            <Input id="trial-accent" type="color" value={accent} onChange={(event) => setAccent(event.target.value)} className="mt-1 h-12 w-20" />
          </div>
        </div>
        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
        {notice ? <p className="mt-3 text-sm">{notice}</p> : null}
        {page ? (
          <Button type="button" variant="outline" className="mt-4" onClick={() => void keep()}>
            Keep this agent
          </Button>
        ) : null}
      </div>
      <div className="justify-self-center">
        <button
          type="button"
          className="rounded-pill px-4 text-sm text-paper"
          style={{ background: accent, height: 44 }}
          onClick={() => setOpen((value) => !value)}
        >
          {launcherLabel || "Chat"}
        </button>
        {open ? (
          <div className="mt-3 flex h-[460px] w-[min(100%,380px)] flex-col overflow-hidden rounded-[14px] border bg-card" style={{ borderTop: `4px solid ${accent}` }}>
            <div className="border-b px-4 py-3">
              <p className="text-sm font-medium">{name || "Site guide"}</p>
              <p className="text-xs text-muted-foreground">{busy ? "Looking through this page…" : "One-page trial"}</p>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((message, index) => (
                <p key={`${message.role}-${index}`} className={`max-w-[90%] whitespace-pre-wrap px-3 py-2 text-sm ${message.role === "user" ? "ml-auto bg-ink text-paper" : "border-l border-rule"}`}>
                  {message.content}
                </p>
              ))}
              {messages.length === 0 ? <p className="text-sm text-muted-foreground">Read a page to start the trial.</p> : null}
            </div>
            <form onSubmit={ask} className="flex gap-2 border-t p-3">
              <Input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ask about this page" aria-label="Question" disabled={!page || busy} />
              <Button type="submit" disabled={!page || busy || !draft.trim()}>Send</Button>
            </form>
            <p className="border-t px-3 py-2 text-center text-[11px] text-muted-foreground">Powered by PlugMyChat</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
