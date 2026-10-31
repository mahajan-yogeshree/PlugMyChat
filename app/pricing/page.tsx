import Link from "next/link";

import { MarketingShell } from "@/components/marketing-shell";
import { buttonVariants } from "@/components/ui/button";
import { formatNumber, plans } from "@/lib/plans";
import { cn } from "cn";

export default function PricingPage() {
  return (
    <MarketingShell>
      <p className="text-sm font-medium text-primary">Plans</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">Predictable pricing.</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Monthly prices match the public Chatwith list. Annual billing is ten months paid once. Changing a plan here only updates this local workspace.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => (
          <article key={plan.id} className={`rounded-2xl border bg-card p-5 ${plan.id === "standard" ? "border-primary shadow-md" : ""}`}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{plan.name}</h2>
              {plan.id === "standard" ? <span className="text-xs font-medium text-primary">Popular</span> : null}
            </div>
            <p className="mt-4 text-3xl font-semibold">
              ${plan.monthly}
              <span className="text-sm font-normal text-muted-foreground"> / month</span>
            </p>
            <p className="text-sm text-muted-foreground">${formatNumber(plan.yearly)} billed yearly</p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>{formatNumber(plan.credits)} message credits</li>
              <li>About {formatNumber(plan.conversations)} conversations</li>
              <li>{formatNumber(plan.characters)} training characters</li>
              <li>{plan.agents} agents</li>
              <li>{plan.trialDays ? `${plan.trialDays}-day trial on the original product` : "No trial on the entry plan"}</li>
            </ul>
            <Link href="/sign-in" className={cn(buttonVariants(), "mt-5 w-full")}>
              Get started
            </Link>
          </article>
        ))}
      </div>
      <div className="mt-10 overflow-x-auto rounded-2xl border">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-muted/60">
            <tr>
              <th className="p-3 font-medium">Included</th>
              {plans.map((plan) => (
                <th key={plan.id} className="p-3 font-medium">{plan.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["Auto train", plans.map((plan) => plan.autoTrain)],
              ["Actions", plans.map((plan) => (plan.actions ? "Yes" : "No"))],
              ["Guardrails", plans.map((plan) => (plan.guardrails ? "Yes" : "No"))],
              ["Lead collection", ["Yes", "Yes", "Yes", "Yes"]],
              ["Notifications", plans.map((plan) => plan.notifications)],
              ["Agent API", plans.map((plan) => (plan.api ? "Yes" : "No"))],
              ["Messaging apps", plans.map((plan) => (plan.messaging ? "Yes" : "No"))],
              ["Remove branding", plans.map((plan) => (plan.removeBranding ? "Yes" : "No"))],
              ["Custom domain", plans.map((plan) => (plan.customDomain ? "Yes" : "No"))],
              ["Own model key", plans.map((plan) => (plan.ownKey ? "Yes" : "No"))],
            ].map(([label, values]) => (
              <tr key={String(label)} className="border-t">
                <td className="p-3">{label}</td>
                {(values as string[]).map((value, index) => (
                  <td key={`${label}-${index}`} className="p-3 text-muted-foreground">{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MarketingShell>
  );
}
