"use client";

import Link from "next/link";
import { useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { formatNumber, plans } from "@/lib/plans";
import { cn } from "cn";

const rows: [string, (typeof plans)[number] extends infer P ? (plan: P) => string : never][] = [
  ["Auto train", (plan) => plan.autoTrain],
  ["Actions", (plan) => (plan.actions ? "Yes" : "No")],
  ["Guardrails", (plan) => (plan.guardrails ? "Yes" : "No")],
  ["Lead collection", () => "Yes"],
  ["Notifications", (plan) => plan.notifications],
  ["Agent API", (plan) => (plan.api ? "Yes" : "No")],
  ["Messaging apps", (plan) => (plan.messaging ? "Yes" : "No")],
  ["Remove branding", (plan) => (plan.removeBranding ? "Yes" : "No")],
  ["Custom domain", (plan) => (plan.customDomain ? "Yes" : "No")],
  ["Own model key", (plan) => (plan.ownKey ? "Yes" : "No")],
];

export function PlanTable() {
  const [yearly, setYearly] = useState(false);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Billing period">
        <button
          type="button"
          className={cn(buttonVariants({ variant: yearly ? "outline" : "default", size: "sm" }))}
          aria-pressed={!yearly}
          onClick={() => setYearly(false)}
        >
          Monthly
        </button>
        <button
          type="button"
          className={cn(buttonVariants({ variant: yearly ? "default" : "outline", size: "sm" }))}
          aria-pressed={yearly}
          onClick={() => setYearly(true)}
        >
          Yearly
        </button>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        {yearly ? "Annual billing is ten months paid once." : "Monthly prices match the public list. Changing a plan here only updates this local workspace."}
      </p>
      <div className="mt-6 grid gap-3 md:hidden">
        {plans.map((plan) => (
          <article key={plan.id} className="rounded-[14px] border p-4">
            <h3>{plan.name}</h3>
            <p className="dose mt-2">{yearly ? `$${formatNumber(plan.yearly)} a year` : `$${plan.monthly} a month`}</p>
            <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
              <li>{formatNumber(plan.credits)} message credits</li>
              <li>About {formatNumber(plan.conversations)} conversations</li>
              <li>{formatNumber(plan.characters)} training characters</li>
              <li>{plan.agents} agents</li>
              <li>Auto train: {plan.autoTrain}</li>
              <li>Actions: {plan.actions ? "Yes" : "No"}</li>
              <li>Guardrails: {plan.guardrails ? "Yes" : "No"}</li>
              <li>Notifications: {plan.notifications}</li>
              <li>Agent API: {plan.api ? "Yes" : "No"}</li>
              <li>Messaging apps: {plan.messaging ? "Yes" : "No"}</li>
              <li>Remove branding: {plan.removeBranding ? "Yes" : "No"}</li>
              <li>Custom domain: {plan.customDomain ? "Yes" : "No"}</li>
              <li>Own model key: {plan.ownKey ? "Yes" : "No"}</li>
            </ul>
            <Link href="/sign-in" className={cn(buttonVariants({ size: "sm" }), "mt-4")}>
              Get started
            </Link>
          </article>
        ))}
      </div>
      <div className="plan-pin mt-6 hidden overflow-x-auto rounded-[14px] border md:block">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-3 font-medium">Included</th>
              {plans.map((plan) => (
                <th key={plan.id} className="p-3 font-medium">
                  {plan.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-3">Price</td>
              {plans.map((plan) => (
                <td key={plan.id} className="dose p-3">
                  {yearly ? `$${formatNumber(plan.yearly)} a year` : `$${plan.monthly} a month`}
                </td>
              ))}
            </tr>
            <tr className="border-b">
              <td className="p-3">Message credits</td>
              {plans.map((plan) => (
                <td key={plan.id} className="p-3 text-muted-foreground">{formatNumber(plan.credits)}</td>
              ))}
            </tr>
            <tr className="border-b">
              <td className="p-3">Conversations</td>
              {plans.map((plan) => (
                <td key={plan.id} className="p-3 text-muted-foreground">About {formatNumber(plan.conversations)}</td>
              ))}
            </tr>
            <tr className="border-b">
              <td className="p-3">Training characters</td>
              {plans.map((plan) => (
                <td key={plan.id} className="p-3 text-muted-foreground">{formatNumber(plan.characters)}</td>
              ))}
            </tr>
            <tr className="border-b">
              <td className="p-3">Agents</td>
              {plans.map((plan) => (
                <td key={plan.id} className="p-3 text-muted-foreground">{plan.agents}</td>
              ))}
            </tr>
            {rows.map(([label, value]) => (
              <tr key={label} className="border-b">
                <td className="p-3">{label}</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="p-3 text-muted-foreground">{value(plan)}</td>
                ))}
              </tr>
            ))}
            <tr>
              <td className="p-3">Start</td>
              {plans.map((plan) => (
                <td key={plan.id} className="p-3">
                  <Link href="/sign-in" className={cn(buttonVariants({ size: "sm" }))}>
                    Get started
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
