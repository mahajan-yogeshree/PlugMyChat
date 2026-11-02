"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Miss = {
  id: string;
  agentName: string;
  question: string;
  pageUrl: string;
  closestTitle: string;
  closestText: string;
};

export default function MissesPage() {
  const [items, setItems] = useState<Miss[] | null>(null);
  const [error, setError] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  async function load() {
    const response = await fetch("/api/misses");
    const body = await response.json();
    if (!response.ok) {
      setError(body.error || "Could not load the list.");
      return;
    }
    setItems(body.misses);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  async function addAnswer(id: string) {
    setError("");
    const response = await fetch(`/api/misses/${id}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: drafts[id] || "" }),
    });
    const body = await response.json();
    if (!response.ok) {
      setError(body.error || "Could not add that answer.");
      return;
    }
    await load();
  }

  if (error && !items) return <p className="text-sm text-destructive">{error}</p>;
  if (!items) return <p className="text-sm text-muted-foreground">Loading questions…</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold">The bot didn’t know</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Questions the agent could not answer from its sources, and the page the visitor was on.
      </p>
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      {items.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No misses yet. They show up when a visitor asks something the sources do not contain.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {items.map((item) => (
            <li key={item.id} className="rounded-[14px] border p-4">
              <p className="font-medium">{item.question}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.agentName}</p>
              {item.pageUrl ? (
                <p className="mt-2 text-sm">
                  Page: <a className="underline" href={item.pageUrl}>{item.pageUrl}</a>
                </p>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">No page URL was sent with this question.</p>
              )}
              {item.closestText ? (
                <p className="mt-2 text-sm text-muted-foreground">Closest source, {item.closestTitle}: {item.closestText}</p>
              ) : null}
              <Textarea
                className="mt-3"
                value={drafts[item.id] || ""}
                onChange={(event) => setDrafts((current) => ({ ...current, [item.id]: event.target.value }))}
                placeholder="Paste the paragraph that answers this"
                aria-label="Missing answer"
              />
              <Button type="button" className="mt-3" onClick={() => void addAnswer(item.id)}>
                Add this answer
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
