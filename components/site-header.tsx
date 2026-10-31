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
    <header className="site-nav">
      <div className="site-nav-pill">
        <Link href="/" className="font-display text-lg">
          chatwith.
        </Link>
        <nav className="hidden items-center gap-5 text-sm md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:underline">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Link href="/sign-in" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            Sign in
          </Link>
          <Link href="/sign-in" className={cn(buttonVariants({ size: "sm" }))}>
            Get started
          </Link>
        </div>
        <Button variant="outline" size="sm" className="md:hidden" onClick={() => setOpen((value) => !value)}>
          Menu
        </Button>
      </div>
      {open ? (
        <div className="page-wrap mt-2 flex flex-col gap-3 rounded-[14px] border bg-background py-4 text-sm md:hidden">
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
