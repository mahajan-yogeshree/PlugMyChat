"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";

type Payload = {
  user: { name: string };
  usage: { agents: number; creditsUsed: number; characters: number; plan: { credits: number; characters: number; name: string } };
  agents: { id: string; name: string; sources: number }[];
};

export default function OverviewPage() {
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/me").then(async (response) => {
      const body = await response.json();
      if (!response.ok) {
        if (response.status !== 401) setError(body.error || "Could not load the workspace.");
        return;
      }
      setData(body);
    });
  }, []);

  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!data) return <p className="text-sm text-muted-foreground">Loading overview…</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Hello, {data.user.name}</h1>
      <p className="mt-1 text-sm text-muted-foreground">Train an agent, then put it on a page.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Stat label="Agents" value={String(data.usage.agents)} />
        <Stat label="Credits this month" value={`${data.usage.creditsUsed} / ${data.usage.plan.credits}`} />
        <Stat label="Training characters" value={`${data.usage.characters} / ${data.usage.plan.characters}`} />
      </div>
      <div className="mt-8 flex gap-3">
        <Link href="/app/agents" className={cn(buttonVariants())}>Open agents</Link>
        <Link href="/app/misses" className={cn(buttonVariants({ variant: "outline" }))}>The bot didn’t know</Link>
        <Link href="/installation" className={cn(buttonVariants({ variant: "outline" }))}>Install guide</Link>
      </div>
      {data.agents.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">No agents yet. Create one and add a paragraph of help text.</p>
      ) : (
        <ul className="mt-8 space-y-2">
          {data.agents.map((agent) => (
            <li key={agent.id}>
              <Link href={`/app/agents/${agent.id}`} className="block rounded-xl border bg-card px-4 py-3 hover:border-primary/40">
                <span className="font-medium">{agent.name}</span>
                <span className="ml-2 text-sm text-muted-foreground">{agent.sources} sources</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}
