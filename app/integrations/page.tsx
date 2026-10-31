import Link from "next/link";

import { MarketingShell } from "@/components/marketing-shell";
import { buttonVariants } from "@/components/ui/button";
import { integrations } from "@/lib/content";
import { cn } from "cn";

export default function IntegrationsPage() {
  return (
    <MarketingShell>
      <h1>Works where your customers already are.</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Put the agent on the site first. The channels below are the same map the public product publishes. On this rebuild, website chat, lead capture, and source training are the parts that run.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {integrations.map((group) => (
          <section key={group.group} className="rounded-2xl border bg-card p-5">
            <h2 className="text-lg font-semibold">{group.group}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{group.blurb}</p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {group.items.map((item) => (
                <li key={item} className="rounded-xl bg-muted px-3 py-2 text-sm">{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <Link href="/installation" className={cn(buttonVariants(), "mt-8")}>Install the widget</Link>
    </MarketingShell>
  );
}
