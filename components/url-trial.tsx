"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  TRIAL_PAGE_LIMIT,
  clearTrial,
  readTrial,
  saveTrialAgent,
  writeTrial,
  type TrialPage,
} from "@/lib/save-trial";

type Bubble = { role: "user" | "assistant"; content: string; citations?: string[] };

const DEFAULT_WELCOME = "Ask about these pages. I only answer from what they say.";

export function UrlTrial() {
  const [url, setUrl] = useState("");
  const [pages, setPages] = useState<TrialPage[]>([]);
  const [name, setName] = useState("Site guide");
  const [welcome, setWelcome] = useState(DEFAULT_WELCOME);
  const [accent, setAccent] = useState("#1f7a4d");
  const [launcherLabel, setLauncherLabel] = useState("Chat");
  const [saveAfterSignIn, setSaveAfterSignIn] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Bubble[]>([]);
  const [open, setOpen] = useState(true);
  const skipPersist = useRef(false);
  const thread = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = thread.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [messages, busy]);

  useEffect(() => {
    if (skipPersist.current || pages.length === 0) return;
    writeTrial({ pages, name, welcome, accent, launcherLabel, saveAfterSignIn });
  }, [pages, name, welcome, accent, launcherLabel, saveAfterSignIn]);

  useEffect(() => {
    const saved = readTrial();
    if (!saved) return;
    setPages(saved.pages);
    setName(saved.name);
    setWelcome(saved.welcome);
    setAccent(saved.accent);
    setLauncherLabel(saved.launcherLabel);
    setSaveAfterSignIn(saved.saveAfterSignIn);
    setMessages([{ role: "assistant", content: saved.welcome }]);
  }, []);

  async function loadPage(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");
    const nextUrl = url.trim();
    if (pages.some((page) => page.url === nextUrl)) {
      setError("That page is already in this trial.");
      return;
    }
    if (pages.length >= TRIAL_PAGE_LIMIT) {
      setError("This trial keeps 24 pages. Keep the agent to add more in the desk.");
      return;
    }
    setLoading(true);
    const response = await fetch("/api/trial", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url: nextUrl }),
    });
    const body = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(body.error || "That page could not be read.");
      return;
    }
    const incoming = Array.isArray(body.pages) && body.pages.length > 0
      ? body.pages
      : [{ title: body.title, text: body.text, url: body.url }];
    const fresh = incoming.filter(
      (page: TrialPage) => page?.url && page?.text && !pages.some((current) => current.url === page.url),
    );
    if (fresh.length === 0) {
      setError("That page is already in this trial.");
      return;
    }
    const room = TRIAL_PAGE_LIMIT - pages.length;
    const accepted = fresh.slice(0, room).map((page: TrialPage) => ({
      title: page.title,
      text: page.text,
      url: page.url,
    }));
    const nextPages = [...pages, ...accepted];
    setPages(nextPages);
    setUrl("");
    setOpen(true);
    const line = body.crawled
      ? `Read ${accepted.length} page${accepted.length === 1 ? "" : "s"} from this site.`
      : `Added “${accepted[0].title}”. Ask again if the last answer was missing.`;
    setMessages((current) =>
      current.length === 0
        ? [{ role: "assistant", content: welcome }, { role: "assistant", content: line }]
        : [...current, { role: "assistant", content: line }],
    );
    if (fresh.length > room) {
      setNotice("This trial keeps 24 pages. The rest of the site was left out.");
    }
  }

  async function ask(event: React.FormEvent) {
    event.preventDefault();
    if (pages.length === 0 || !draft.trim() || busy) return;
    const question = draft.trim();
    setDraft("");
    setBusy(true);
    setError("");
    setNotice("");
    setMessages((current) => [...current, { role: "user", content: question }]);
    const response = await fetch("/api/trial/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        question,
        sources: pages.map((page) => ({ title: page.title, text: page.text, url: page.url })),
      }),
    });
    const body = await response.json();
    setBusy(false);
    if (!response.ok) {
      setError(body.error || "The trial could not answer.");
      return;
    }
    setMessages((current) => [
      ...current,
      { role: "assistant", content: body.content, citations: body.citations || [] },
    ]);
    if (body.missed) {
      setNotice(
        pages.length > 1
          ? "That was not in the pages read from this site."
          : "That was not on this page. Add the homepage to read the rest of the site, or paste the page that has the answer.",
      );
    }
  }

  function removePage(target: string) {
    const nextPages = pages.filter((page) => page.url !== target);
    setPages(nextPages);
    if (nextPages.length === 0) clearTrial();
  }

  async function keep() {
    if (pages.length === 0) return;
    setError("");
    setNotice("");
    const look = { name, welcome, accent, launcherLabel };
    const result = await saveTrialAgent({ pages, ...look, saveAfterSignIn: false });
    if (result.status === "unsigned") {
      writeTrial({ pages, ...look, saveAfterSignIn: true });
      setSaveAfterSignIn(true);
      window.location.href = "/sign-in";
      return;
    }
    skipPersist.current = true;
    if (result.status === "error") {
      setError(result.error);
      if (result.agentId) window.location.href = `/app/agents/${result.agentId}`;
      return;
    }
    window.location.href = `/app/agents/${result.agentId}`;
  }

  const pageLabel = pages.length === 1 ? "One page in this trial" : `${pages.length} pages in this trial`;

  return (
    <div id="trial" className="grid items-start gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div>
        <h2>Try your site.</h2>
        <p className="mt-3 text-muted-foreground">
          Paste a homepage and this trial reads that site, up to 24 pages. Paste any other page to add just that page. Answers quote the page they came from.
        </p>
        <form onSubmit={loadPage} className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Label htmlFor="trial-url" className="sr-only">Page URL</Label>
          <Input
            id="trial-url"
            type="url"
            required
            placeholder={pages.length === 0 ? "https://example.com" : "https://example.com/shipping"}
            value={url}
            onChange={(event) => setUrl(event.target.value)}
          />
          <Button type="submit" disabled={loading || pages.length >= TRIAL_PAGE_LIMIT}>
            {loading ? "Reading…" : pages.length === 0 ? "Read site" : "Add page"}
          </Button>
        </form>
        {pages.length > 0 ? (
          <ul className="mt-4 max-h-48 space-y-2 overflow-y-auto">
            {pages.map((page) => (
              <li key={page.url} className="flex items-start justify-between gap-3 text-sm">
                <span>Read “{page.title}”.</span>
                <button type="button" className="text-muted-foreground underline" onClick={() => removePage(page.url)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : null}
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
        {pages.length > 0 ? (
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
              <p className="text-xs text-muted-foreground">{busy ? "Looking through these pages…" : pages.length === 0 ? "No pages yet" : pageLabel}</p>
            </div>
            <div ref={thread} className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`max-w-[90%] whitespace-pre-wrap break-words px-3 py-2 text-sm ${message.role === "user" ? "ml-auto bg-ink text-paper" : "border-l border-rule text-ink"}`}>
                  {message.content}
                  {message.role === "assistant" && message.citations && message.citations.length > 0 ? (
                    <span className="mt-2 block text-xs text-signal-deep">Source: {message.citations.join(", ")}</span>
                  ) : null}
                </div>
              ))}
              {messages.length === 0 ? <p className="text-sm text-muted-foreground">Read a page to start the trial.</p> : null}
            </div>
            <form onSubmit={ask} className="flex gap-2 border-t p-3">
              <Input className="min-w-0" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ask about these pages" aria-label="Question" disabled={pages.length === 0 || busy} />
              <Button type="submit" disabled={pages.length === 0 || busy || !draft.trim()}>Send</Button>
            </form>
            <p className="border-t px-3 py-2 text-center text-[11px] text-muted-foreground">Powered by PlugMyChat</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
