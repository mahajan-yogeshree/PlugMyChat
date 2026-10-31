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
    <div className="min-h-screen">
      <header className="border-b">
        <div className="page-wrap flex h-16 items-center justify-between gap-4">
          <Link href="/" className="font-display text-lg">
            PlugMyChat
          </Link>
          <nav className="flex gap-1 overflow-x-auto">
            {links.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className={`rounded-[10px] px-3 py-2 text-sm ${pathname === href ? "bg-signal-soft font-medium" : "text-muted-foreground"}`}
              >
                {label}
              </Link>
            ))}
          </nav>
          <Button variant="ghost" size="sm" onClick={signOut}>
            Sign out
          </Button>
        </div>
        <div className="page-wrap flex flex-wrap gap-x-4 gap-y-1 border-t py-2 text-sm">
          {me ? (
            <>
              <span>{me.user.email}</span>
              <span>{me.usage.plan.name}</span>
              <span className="dose">
                {me.usage.creditsUsed}/{me.usage.plan.credits} credits
              </span>
            </>
          ) : (
            <p className="text-muted-foreground">{error || "Loading workspace…"}</p>
          )}
        </div>
      </header>
      <div className="page-wrap py-8">{children}</div>
    </div>
  );
}
