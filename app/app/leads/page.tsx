"use client";

import { useEffect, useState } from "react";

type Lead = { id: string; email: string; note: string; agentName: string; createdAt: string };

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/leads").then(async (response) => {
      const body = await response.json();
      if (!response.ok) {
        setError(body.error || "Could not load leads.");
        return;
      }
      setLeads(body.leads);
    });
  }, []);

  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!leads) return <p className="text-sm text-muted-foreground">Loading leads…</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Leads</h1>
      {leads.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">No emails yet. Ask the demo agent for a demo and include an address.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {leads.map((lead) => (
            <li key={lead.id} className="rounded-2xl border bg-card px-4 py-3">
              <p className="font-medium">{lead.email}</p>
              <p className="text-sm text-muted-foreground">{lead.agentName}</p>
              <p className="mt-1 text-sm">{lead.note}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
