"use client";

import Link from "next/link";
import { useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "cn";

const links = [
  { href: "/use-cases", label: "Use cases" },
  { href: "/integrations", label: "Integrations" },
  { href: "/agencies", label: "Agencies" },
  { href: "/pricing", label: "Pricing" },
  { href: "/help", label: "Help" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          chatwith<span className="text-primary">.</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Link href="/sign-in" className={cn(buttonVariants({ variant: "ghost" }))}>
            Sign in
          </Link>
          <Link href="/sign-in" className={cn(buttonVariants())}>
            Get started
          </Link>
        </div>
        <Button variant="outline" className="md:hidden" onClick={() => setOpen((value) => !value)}>
          Menu
        </Button>
      </div>
      {open ? (
        <div className="flex flex-col gap-3 border-t px-4 py-4 text-sm md:hidden">
          {links.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}
          <Link href="/sign-in" onClick={() => setOpen(false)}>
            Sign in
          </Link>
        </div>
      ) : null}
    </header>
  );
}
