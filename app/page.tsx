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
import { faqs, useCases } from "@/lib/content";
import { DEMO_AGENT } from "@/lib/store";
import { cn } from "cn";

const steps = [
  {
    n: "01",
    title: "Paste a page",
    body: "A homepage reads the site, up to 24 pages. Any other URL adds just that page.",
  },
  {
    n: "02",
    title: "Ask in the trial",
    body: "The reply quotes or rephrases a saved passage and names the page it came from.",
  },
  {
    n: "03",
    title: "Keep the agent",
    body: "Sign in, then copy the script tag. The widget sends the page the visitor is on.",
  },
];

const promises = [
  {
    title: "Named source",
    body: "Every answer points at the page it used. The trial, the widget, and the inbox show that source.",
  },
  {
    title: "No invented policy",
    body: "Shipping dates, prices, and rules have to be written on a saved page. Otherwise the agent says it does not have that.",
  },
  {
    title: "A miss you can fix",
    body: "A question the pages do not contain is saved. Paste the missing paragraph and the same question cites that note.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <section className="hero-corridor">
          <div className="hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">Support grounded in your pages</p>
              <h1>Answers that stay on the page they came from.</h1>
              <p className="lead">
                Paste a site, ask a question, and keep the agent. A reply may quote or rephrase only a passage that was saved, and it names that page.
              </p>
              <div className="hero-actions">
                <Link href="#trial" className={cn(buttonVariants({ size: "lg" }))}>
                  Try your page
                </Link>
                <Link href="/pricing" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
                  See pricing
                </Link>
              </div>
            </div>
            <aside className="hero-card" aria-label="Example cited answer">
              <div className="hero-card-bar">
                <span>Northwind Desk</span>
                <span className="dose-stamp">Cited</span>
              </div>
              <p className="mock-user">Where is order 4471?</p>
              <div className="mock-agent">
                <p>Order 4471 shipped this morning with UPS and should arrive Thursday.</p>
                <p className="source-line">Source: Shipping</p>
              </div>
            </aside>
          </div>
        </section>

        <section className="page-wrap band">
          <h2>Three steps, then the script tag.</h2>
          <ol className="steps">
            {steps.map((step) => (
              <li key={step.n} className="step-card">
                <p className="eyebrow">{step.n}</p>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="page-wrap band">
          <UrlTrial />
        </section>

        <section className="page-wrap band">
          <h2>What the reply is allowed to do.</h2>
          <div className="steps">
            {promises.map((item) => (
              <article key={item.title} className="step-card">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="page-wrap band">
          <h2>Starter is $9 a month.</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Prices match the public list. Changing a plan here updates this workspace only. It does not charge a card.
          </p>
          <div className="mt-8">
            <PlanTable />
          </div>
        </section>

        <section className="page-wrap band">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2>Where a grounded agent fits.</h2>
            <Link href="/use-cases" className="text-sm text-foreground underline">
              All use cases
            </Link>
          </div>
          <ul className="use-grid">
            {useCases.slice(0, 6).map((item) => (
              <li key={item.slug}>
                <Link href={`/use-cases/${item.slug}`} className="use-card">
                  <span className="font-medium text-foreground">{item.title}</span>
                  <span className="text-sm text-muted-foreground">{item.summary}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="page-wrap band">
          <h2>Questions, answered plainly.</h2>
          <Accordion className="mt-6 max-w-3xl">
            {faqs.map((faq) => (
              <AccordionItem key={faq.q} value={faq.q}>
                <AccordionTrigger>{faq.q}</AccordionTrigger>
                <AccordionContent>{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section className="page-wrap band grid items-start gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div className="min-w-0 lg:sticky lg:top-28">
            <h2>Ask the sample desk.</h2>
            <p className="mt-3 text-muted-foreground">
              Northwind Desk answers from the notes saved for that agent. A reply names Shipping, returns, or the note you add. It does not invent a date or a price.
            </p>
          </div>
          <ChatPanel agentId={DEMO_AGENT} sample />
        </section>

        <section className="page-wrap band">
          <h2>Install the widget</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            After you create an agent, the Install tab shows a script for that agent. Paste it before the closing body tag.
          </p>
          <div className="steps">
            <article className="step-card">
              <h3>Any HTML site</h3>
              <p>Paste the script tag before the closing body tag.</p>
            </article>
            <article className="step-card">
              <h3>Shopify</h3>
              <p>Online store, Themes, Edit code, then theme.liquid before the closing body tag.</p>
            </article>
            <article className="step-card">
              <h3>Webflow</h3>
              <p>Site settings, then custom code, then the footer.</p>
            </article>
          </div>
          <pre className="install-snippet">{`<script src="https://your-host/widget.js" data-agent="agt_..."></script>`}</pre>
          <Link href="/installation" className={cn(buttonVariants(), "mt-6")}>
            Installation notes
          </Link>
        </section>

        <section className="band-ink">
          <div className="page-wrap closing">
            <h2>Put the agent on the page you already have.</h2>
            <p>Read a site in the trial. Keep it when the answers cite the right page.</p>
            <Link href="#trial" className={cn(buttonVariants({ size: "lg" }))}>
              Try your page
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
