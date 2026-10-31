"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type Me = {
  user: { email: string; name: string; plan: string };
  usage: { creditsUsed: number; characters: number; plan: { name: string; credits: number; characters: number } };
};

const links = [
  ["/app", "Overview"],
  ["/app/agents", "Agents"],
  ["/app/inbox", "Inbox"],
  ["/app/leads", "Leads"],
  ["/app/billing", "Plan"],
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/me").then(async (response) => {
      if (response.status === 401) {
        router.replace("/sign-in");
        return;
      }
      const body = await response.json();
      if (!response.ok) {
        setError(body.error || "Could not load the workspace.");
        return;
      }
      setMe(body);
    });
  }, [router]);

  async function signOut() {
    await fetch("/api/auth/sign-out", { method: "POST" });
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen md:grid md:grid-cols-[220px_1fr]">
      <aside className="border-b bg-card md:border-r md:border-b-0">
        <div className="flex items-center justify-between px-4 py-4 md:block">
          <Link href="/" className="text-lg font-semibold">
            chatwith<span className="text-primary">.</span>
          </Link>
          <Button variant="ghost" size="sm" className="md:mt-4" onClick={signOut}>
            Sign out
          </Button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-3 md:flex-col md:px-3">
          {links.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className={`rounded-lg px-3 py-2 text-sm ${pathname === href ? "bg-muted font-medium" : "text-muted-foreground"}`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <div>
        <div className="flex items-center justify-between border-b px-4 py-3 text-sm">
          {me ? (
            <p>
              {me.user.email} · {me.usage.plan.name} · {me.usage.creditsUsed}/{me.usage.plan.credits} credits
            </p>
          ) : (
            <p className="text-muted-foreground">{error || "Loading workspace…"}</p>
          )}
        </div>
        <div className="px-4 py-6">{children}</div>
      </div>
    </div>
  );
}
