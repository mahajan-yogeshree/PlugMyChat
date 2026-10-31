import { MarketingShell } from "@/components/marketing-shell";

export default function TermsPage() {
  return (
    <MarketingShell>
      <h1 className="text-4xl font-semibold tracking-tight">Terms</h1>
      <div className="mt-6 max-w-2xl space-y-4 text-muted-foreground">
        <p>PlugMyChat runs on this machine. It does not bill a card.</p>
        <p>Train agents only on material you have the right to use. Answers can miss a fact that is not in the sources.</p>
      </div>
    </MarketingShell>
  );
}
