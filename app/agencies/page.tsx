"use client";

import { useState } from "react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AgenciesPage() {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setStatus("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/partners", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        agency: form.get("agency"),
        website: form.get("website"),
        clients: form.get("clients"),
        sellsRetainers: form.get("retainers"),
      }),
    });
    const body = await response.json();
    setPending(false);
    if (!response.ok) {
      setError(body.error || "Could not save that request.");
      return;
    }
    setStatus("Saved. This local rebuild stores the request on this machine instead of booking a calendar.");
    event.currentTarget.reset();
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-2">
        <div>
          <h1>Resell support agents. Keep the relationship.</h1>
          <p className="mt-4 text-muted-foreground">
            You sell the package and the brand. The agent runs on the client site. Partner rates on the public product are discussed in a demo; an example they publish is a $69 cost against a $149–199 client price.
          </p>
          <ol className="mt-6 space-y-3 text-sm">
            <li>1. You own the client relationship.</li>
            <li>2. Partner rates and a repeatable setup stay with the platform.</li>
            <li>3. A walkthrough can install the widget on a real client URL.</li>
          </ol>
        </div>
        <form onSubmit={submit} className="space-y-4 rounded-2xl border bg-card p-5">
          <div className="space-y-2">
            <Label htmlFor="agency">Agency name</Label>
            <Input id="agency" name="agency" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Agency website</Label>
            <Input id="website" name="website" required placeholder="https://" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clients">Number of clients</Label>
            <Input id="clients" name="clients" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="retainers">Do you already sell retainers or websites?</Label>
            <select id="retainers" name="retainers" className="h-9 w-full rounded-lg border bg-background px-3 text-sm">
              <option value="">Select yes or no</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {status ? <p className="text-sm text-primary">{status}</p> : null}
          <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Request a partner walkthrough"}</Button>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}
