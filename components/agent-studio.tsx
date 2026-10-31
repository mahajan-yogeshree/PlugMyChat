"use client";

import { useEffect, useState } from "react";

import { ChatPanel } from "@/components/chat-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type Source = { id: string; title: string; kind: string; body: string };
type Agent = {
  id: string;
  name: string;
  welcome: string;
  accent: string;
  instructions: string;
  collectLeads: boolean;
  sources: Source[];
};

export function AgentStudio({ agentId }: { agentId: string }) {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [origin, setOrigin] = useState("");

  async function load() {
    const response = await fetch(`/api/agents/${agentId}`);
    const body = await response.json();
    if (!response.ok) {
      setError(body.error || "Could not load this agent.");
      return;
    }
    setAgent(body.agent);
  }

  useEffect(() => {
    setOrigin(window.location.origin);
    const timer = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(timer);
  }, [agentId]);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!agent) return;
    setError("");
    const response = await fetch(`/api/agents/${agent.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(agent),
    });
    const body = await response.json();
    if (!response.ok) {
      setError(body.error || "Could not save.");
      return;
    }
    setAgent(body.agent);
    setNotice("Saved.");
  }

  async function addSource(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError("");
    setNotice("");
    const kind = String(form.get("kind"));
    const file = form.get("file");
    let text = String(form.get("text") || "");
    if (file instanceof File && file.size > 0) {
      text = await file.text();
    }
    const response = await fetch(`/api/agents/${agentId}/sources`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        kind,
        title: form.get("title"),
        text,
        url: form.get("url"),
      }),
    });
    const body = await response.json();
    if (!response.ok) {
      setError(body.error || "Could not add the source.");
      return;
    }
    setNotice("Source added.");
    event.currentTarget.reset();
    await load();
  }

  async function removeSource(sourceId: string) {
    const response = await fetch(`/api/agents/${agentId}/sources/${sourceId}`, { method: "DELETE" });
    if (!response.ok) {
      const body = await response.json();
      setError(body.error || "Could not remove the source.");
      return;
    }
    await load();
  }

  async function removeAgent() {
    if (!confirm("Delete this agent and its conversations?")) return;
    const response = await fetch(`/api/agents/${agentId}`, { method: "DELETE" });
    if (response.ok) window.location.href = "/app/agents";
  }

  if (error && !agent) return <p className="text-sm text-destructive">{error}</p>;
  if (!agent) return <p className="text-sm text-muted-foreground">Loading agent…</p>;

  const snippet = `<script src="${origin}/widget.js" data-agent="${agent.id}"></script>`;

  return (
    <div>
      <h1 className="text-2xl font-semibold">{agent.name}</h1>
      {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
      {notice ? <p className="mt-2 text-sm text-primary">{notice}</p> : null}
      <Tabs defaultValue="knowledge" className="mt-6">
        <TabsList>
          <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="install">Install</TabsTrigger>
          <TabsTrigger value="test">Test</TabsTrigger>
        </TabsList>
        <TabsContent value="knowledge" className="mt-4 grid gap-6 lg:grid-cols-2">
          <form onSubmit={addSource} className="space-y-3 rounded-2xl border bg-card p-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" placeholder="Returns policy" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kind">Kind</Label>
              <select id="kind" name="kind" className="h-9 w-full rounded-lg border bg-background px-3 text-sm">
                <option value="text">Pasted text</option>
                <option value="file">Text file</option>
                <option value="url">Public page</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="text">Text</Label>
              <Textarea id="text" name="text" rows={6} placeholder="Paste the policy or help article." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="file">Text file</Label>
              <Input id="file" name="file" type="file" accept=".txt,.md,.csv,text/plain" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">Public page URL</Label>
              <Input id="url" name="url" placeholder="https://example.com/help" />
            </div>
            <Button type="submit">Add source</Button>
          </form>
          <ul className="space-y-3">
            {agent.sources.length === 0 ? <li className="text-sm text-muted-foreground">No sources yet. The agent will say when it does not know.</li> : null}
            {agent.sources.map((source) => (
              <li key={source.id} className="rounded-2xl border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{source.title}</p>
                    <p className="text-xs text-muted-foreground">{source.kind}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeSource(source.id)}>Remove</Button>
                </div>
                <p className="mt-2 line-clamp-4 text-sm text-muted-foreground">{source.body}</p>
              </li>
            ))}
          </ul>
        </TabsContent>
        <TabsContent value="appearance" className="mt-4">
          <form onSubmit={save} className="max-w-lg space-y-3">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={agent.name} onChange={(event) => setAgent({ ...agent, name: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="welcome">Welcome</Label>
              <Textarea id="welcome" value={agent.welcome} onChange={(event) => setAgent({ ...agent, welcome: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea id="instructions" value={agent.instructions} onChange={(event) => setAgent({ ...agent, instructions: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accent">Accent</Label>
              <Input id="accent" type="color" value={agent.accent} onChange={(event) => setAgent({ ...agent, accent: event.target.value })} className="h-10 w-20" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={agent.collectLeads} onChange={(event) => setAgent({ ...agent, collectLeads: event.target.checked })} />
              Save emails visitors type in chat
            </label>
            <div className="flex gap-2">
              <Button type="submit">Save</Button>
              <Button type="button" variant="destructive" onClick={removeAgent}>Delete agent</Button>
            </div>
          </form>
        </TabsContent>
        <TabsContent value="install" className="mt-4 max-w-2xl">
          <p className="text-sm text-muted-foreground">Paste this before the closing body tag. The button opens the same agent.</p>
          <pre className="mt-4 overflow-x-auto rounded-2xl bg-foreground p-4 text-sm text-background">{snippet}</pre>
          <p className="mt-4 text-sm">
            Preview: <a className="text-primary underline" href={`/embed/${agent.id}`} target="_blank" rel="noreferrer">open the widget page</a>
          </p>
        </TabsContent>
        <TabsContent value="test" className="mt-4 max-w-md">
          <ChatPanel agentId={agent.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
