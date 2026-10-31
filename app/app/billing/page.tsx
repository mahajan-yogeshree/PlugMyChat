"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { plans } from "@/lib/plans";

export default function BillingPage() {
  const [current, setCurrent] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    fetch("/api/me").then(async (response) => {
      if (!response.ok) return;
      const body = await response.json();
      setCurrent(body.user.plan);
    });
  }, []);

  async function choose(plan: string) {
    setError("");
    setNotice("");
    const response = await fetch("/api/billing", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const body = await response.json();
    if (!response.ok) {
      setError(body.error || "Could not change the plan.");
      return;
    }
    setCurrent(body.user.plan);
    setNotice("Plan updated for this workspace. No card was charged.");
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Plan</h1>
      <p className="mt-2 text-sm text-muted-foreground">Current plan: {current || "…"}</p>
      {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
      {notice ? <p className="mt-2 text-sm text-primary">{notice}</p> : null}
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {plans.map((plan) => (
          <article key={plan.id} className="rounded-2xl border bg-card p-4">
            <h2 className="font-semibold">{plan.name}</h2>
            <p className="text-sm text-muted-foreground">${plan.monthly} a month, {plan.credits} credits, {plan.agents} agents</p>
            <Button className="mt-3" variant={current === plan.id ? "secondary" : "default"} onClick={() => choose(plan.id)} disabled={current === plan.id}>
              {current === plan.id ? "Current" : "Use this plan"}
            </Button>
          </article>
        ))}
      </div>
    </div>
  );
}
