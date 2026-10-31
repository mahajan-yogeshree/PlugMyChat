import Link from "next/link";
import { notFound } from "next/navigation";

import { MarketingShell } from "@/components/marketing-shell";
import { buttonVariants } from "@/components/ui/button";
import { useCases } from "@/lib/content";
import { cn } from "cn";

export function generateStaticParams() {
  return useCases.map((item) => ({ slug: item.slug }));
}

export default async function UseCasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = useCases.find((entry) => entry.slug === slug);
  if (!item) notFound();
  return (
    <MarketingShell>
      <p className="text-sm text-muted-foreground">Use case</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">{item.title}</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{item.summary}</p>
      <div className="mt-8 max-w-xl rounded-2xl border bg-card p-5">
        <p className="text-sm text-muted-foreground">A visitor asks</p>
        <p className="mt-2 font-medium">{item.prompt}</p>
        <p className="mt-4 text-sm text-muted-foreground">The agent can answer</p>
        <p className="mt-2">{item.answer}</p>
      </div>
      <Link href="/sign-in" className={cn(buttonVariants(), "mt-8")}>Train an agent</Link>
    </MarketingShell>
  );
}
