import Link from "next/link";

import { ChatPanel } from "@/components/chat-panel";
import { UrlTrial } from "@/components/url-trial";
import { PlanTable } from "@/components/plan-table";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqs, integrations, useCases } from "@/lib/content";
import { DEMO_AGENT } from "@/lib/store";
import { cn } from "cn";

const problems = [
  {
    n: "01",
    title: "The same questions, again.",
    body: "Shipping, pricing, returns. Let the agent answer from your content so the team can handle the work that needs them.",
    tint: "var(--p-mon)",
  },
  {
    n: "02",
    title: "Interested, then gone.",
    body: "A visitor has a question before they buy. Answer it while they are still on the page, and keep their email for follow-up.",
    tint: "var(--p-wed)",
  },
  {
    n: "03",
    title: "Closed for the day.",
    body: "Your customers are not. Give them a way to get answers after hours without asking the team to stay online.",
    tint: "var(--p-fri)",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <section className="hero-corridor">
          <div className="hero-copy">
            <h1>AI customer support that pays for itself.</h1>
            <p className="lead">It answers from your pages and cites the source.</p>
            <div className="hero-actions">
              <Link href="#trial" className={cn(buttonVariants({ size: "lg" }))}>
                Try your page
              </Link>
              <Link href="/pricing" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
                See pricing
              </Link>
            </div>
            <aside className="dose-label">
              <p className="dose text-xs text-muted-foreground">08:14</p>
              <p>Order 4471 shipped this morning with UPS and should arrive Thursday.</p>
              <p className="text-sm text-muted-foreground">From Shipping</p>
              <span className="dose-stamp">Cited</span>
            </aside>
          </div>
        </section>

        <section className="page-wrap band">
          <UrlTrial />
        </section>

        <section className="page-wrap band">
          <h2>Starter is $9 a month.</h2>
          <div className="mt-8">
            <PlanTable />
          </div>
        </section>

        <section className="page-wrap band">
          <div className="stack">
            <div className="stack-sticky">
              <h2>Support should not take over the day.</h2>
              <Link href="/sign-in" className={cn(buttonVariants(), "mt-6")}>
                Get started
              </Link>
            </div>
            <div className="grid gap-4">
              {problems.map((problem) => (
                <article key={problem.n} className="plastic p-6" style={{ ["--tint" as string]: problem.tint }}>
                  <p className="dose text-sm">{problem.n}</p>
                  <h3 className="mt-3">{problem.title}</h3>
                  <p className="mt-2 text-sm">{problem.body}</p>
                  <div className="dose-label mt-4">
                    <p className="dose text-xs text-muted-foreground">{problem.n === "01" ? "08:14" : problem.n === "02" ? "18:30" : "21:40"}</p>
                    <p className="text-sm">
                      {problem.n === "01"
                        ? "It left the warehouse this morning with UPS and is due Thursday."
                        : problem.n === "02"
                          ? "Yes. The 6:30 slot is open. What email should the confirmation use?"
                          : "The clinic is open 9 to 1."}
                    </p>
                    <span className="dose-stamp">{problem.n === "01" ? "Cited" : "Example"}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="page-wrap band">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2>From SaaS docs to a listing after hours.</h2>
            <Link href="/use-cases" className="text-sm underline">
              All use cases
            </Link>
          </div>
          <ul className="mt-8 divide-y border-y">
            {useCases.slice(0, 6).map((item) => (
              <li key={item.slug}>
                <Link href={`/use-cases/${item.slug}`} className="grid gap-2 py-4 sm:grid-cols-[12rem_minmax(0,1fr)]">
                  <span className="font-medium">{item.title}</span>
                  <span className="text-sm text-muted-foreground">{item.summary}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="page-wrap band">
          <div className="stack">
            <div className="stack-sticky">
              <h2>WordPress, Shopify, and Slack.</h2>
              <Link href="/integrations" className="mt-6 inline-block text-sm underline">
                Review every integration
              </Link>
            </div>
            <div className="grid gap-4">
              {integrations.slice(0, 3).map((group) => (
                <article key={group.group} className="rounded-[14px] border bg-paper p-6">
                  <h3>{group.group}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{group.blurb}</p>
                  <ul className="mt-4 space-y-1 text-sm">
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="page-wrap band max-w-3xl">
          <h2>A little clarity. Then, let’s go.</h2>
          <Accordion className="mt-6">
            {faqs.map((faq) => (
              <AccordionItem key={faq.q} value={faq.q}>
                <AccordionTrigger>{faq.q}</AccordionTrigger>
                <AccordionContent>{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section className="page-wrap band grid items-start gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div className="lg:sticky lg:top-28">
            <h2>Ask the sample desk.</h2>
            <p className="mt-3 text-muted-foreground">Northwind answers only from the notes stored on this machine. No model API key. Answers stay on this machine.</p>
          </div>
          <ChatPanel agentId={DEMO_AGENT} sample />
        </section>

        <section className="page-wrap band">
          <h2>Install the widget</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            After you create an agent, the Install tab shows a script for that agent. The shape is the same everywhere.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <article className="plastic p-5" style={{ ["--tint" as string]: "var(--p-tue)" }}>
              <h3>Any HTML site</h3>
              <p className="mt-2 text-sm">Paste the script tag before the closing body tag.</p>
            </article>
            <article className="plastic p-5" style={{ ["--tint" as string]: "var(--p-thu)" }}>
              <h3>Shopify</h3>
              <p className="mt-2 text-sm">Online store, Themes, Edit code, then theme.liquid before the closing body tag.</p>
            </article>
            <article className="plastic p-5" style={{ ["--tint" as string]: "var(--p-sat)" }}>
              <h3>Webflow</h3>
              <p className="mt-2 text-sm">Site settings, then custom code, then the footer.</p>
            </article>
          </div>
          <pre className="dose mt-6 overflow-x-auto rounded-[14px] bg-ink p-4 text-sm text-paper">{`<script src="https://your-host/widget.js" data-agent="agt_..."></script>`}</pre>
          <Link href="/installation" className={cn(buttonVariants(), "mt-6")}>
            Installation notes
          </Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
