"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Agent = { id: string; name: string; sources: { id: string }[]; welcome: string };

export default function AgentsPage() {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    const response = await fetch("/api/agents");
    const body = await response.json();
    if (response.status === 401) {
      router.replace("/sign-in");
      return;
    }
    if (!response.ok) {
      setError(body.error || "Could not load agents.");
      setLoading(false);
      return;
    }
    setAgents(body.agents);
    setLoading(false);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  async function createAgent(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/agents", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const body = await response.json();
    if (!response.ok) {
      setError(body.error || "Could not create the agent.");
      return;
    }
    router.push(`/app/agents/${body.agent.id}`);
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Agents</h1>
      <form onSubmit={createAgent} className="mt-4 flex max-w-lg gap-2">
        <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Agent name" aria-label="Agent name" />
        <Button type="submit">Create</Button>
      </form>
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      {loading ? <p className="mt-6 text-sm text-muted-foreground">Loading agents…</p> : null}
      {!loading && agents.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No agents in this workspace yet.</p>
      ) : null}
      <ul className="mt-6 space-y-2">
        {agents.map((agent) => (
          <li key={agent.id}>
            <Link href={`/app/agents/${agent.id}`} className="block rounded-xl border bg-card px-4 py-3">
              <span className="font-medium">{agent.name}</span>
              <span className="ml-2 text-sm text-muted-foreground">{agent.sources.length} sources</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
