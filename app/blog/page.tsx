import Link from "next/link";

import { MarketingShell } from "@/components/marketing-shell";

export default function BlogPage() {
  return (
    <MarketingShell>
      <h1 className="text-4xl font-semibold tracking-tight">Notes</h1>
      <article className="mt-8 max-w-2xl rounded-2xl border bg-card p-6">
        <p className="text-sm text-muted-foreground">Guide</p>
        <h2 className="mt-2 text-2xl font-semibold">
          <Link href="/blog/what-an-agent-can-answer">What an agent can answer</Link>
        </h2>
        <p className="mt-3 text-muted-foreground">
          An agent is only as useful as the notes you give it. Here is how this rebuild decides what to say.
        </p>
      </article>
    </MarketingShell>
  );
}
