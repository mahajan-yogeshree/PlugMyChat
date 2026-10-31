import Link from "next/link";

import { MarketingShell } from "@/components/marketing-shell";
import { PlanTable } from "@/components/plan-table";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";

export default function PricingPage() {
  return (
    <MarketingShell>
      <h1>Predictable pricing.</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Monthly prices match the public Chatwith list. Annual billing is ten months paid once. Changing a plan here only updates this local workspace.
      </p>
      <div className="mt-8">
        <PlanTable />
      </div>
      <Link href="/sign-in" className={cn(buttonVariants(), "mt-8")}>
        Get started
      </Link>
    </MarketingShell>
  );
}
