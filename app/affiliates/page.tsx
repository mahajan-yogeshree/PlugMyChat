import { MarketingShell } from "@/components/marketing-shell";

export default function AffiliatesPage() {
  return (
    <MarketingShell>
      <h1 className="text-4xl font-semibold tracking-tight">Affiliates</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        The public product runs a referral program from a separate affiliate portal. This rebuild does not pay commissions. Use the agency form if you want a partner request stored locally.
      </p>
    </MarketingShell>
  );
}
