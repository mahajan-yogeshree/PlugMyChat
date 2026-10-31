import Link from "next/link";

import { MarketingShell } from "@/components/marketing-shell";
import { useCases } from "@/lib/content";

export default function UseCasesPage() {
  return (
    <MarketingShell>
      <h1 className="text-4xl font-semibold tracking-tight">Custom agent use cases</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        One agent, trained on the material you choose, for the questions your visitors already ask.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {useCases.map((item) => (
          <Link key={item.slug} href={`/use-cases/${item.slug}`} className="rounded-2xl border bg-card p-5 hover:border-primary/40">
            <h2 className="text-lg font-semibold">{item.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{item.summary}</p>
          </Link>
        ))}
      </div>
    </MarketingShell>
  );
}
