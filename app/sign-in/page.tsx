"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { readTrial, saveTrialAgent } from "@/lib/save-trial";

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const saved = readTrial();
    if (saved?.saveAfterSignIn) {
      setNotice(`Sign in to keep ${saved.pages.length === 1 ? "the page" : `${saved.pages.length} pages`} you just tried.`);
    }
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/sign-in", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });
    const body = await response.json();
    setPending(false);
    if (!response.ok) {
      setError(body.error || "Could not sign in.");
      return;
    }
    const saved = readTrial();
    if (saved?.saveAfterSignIn) {
      const result = await saveTrialAgent(saved);
      if (result.status === "saved") {
        router.push(`/app/agents/${result.agentId}`);
        router.refresh();
        return;
      }
      if (result.status === "error") {
        setError(result.error);
        if (result.agentId) {
          router.push(`/app/agents/${result.agentId}`);
          router.refresh();
        }
        return;
      }
    }
    router.push("/app");
    router.refresh();
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12">
        <Link href="/" className="font-display text-lg">
          PlugMyChat
        </Link>
        <h1 className="mt-8 text-3xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">New here? The same email creates your account.</p>
        <form onSubmit={submit} className="mt-6 max-w-sm space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required minLength={8} autoComplete="current-password" />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {notice ? <p className="text-sm text-muted-foreground">{notice}</p> : null}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setNotice("Google sign-in is not connected on this local rebuild. Use email and a password.")}
          >
            Sign in with Google
          </Button>
        </form>
        <p className="mt-6 max-w-sm text-xs text-muted-foreground">
          Try the sample workspace with demo@northwind.example and harbor-demo. By continuing you agree to the local <Link href="/terms" className="underline">terms</Link> and <Link href="/privacy" className="underline">privacy</Link> notes.
        </p>
      </div>
      <div className="band-ink hidden items-center px-10 md:flex">
        <p className="max-w-md">
          The useful part is not another chat window. It is an answer that came from the page you already wrote.
        </p>
      </div>
    </div>
  );
}
