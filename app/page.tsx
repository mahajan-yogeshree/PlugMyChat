import Link from "next/link";

import { ChatPanel } from "@/components/chat-panel";
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
  },
  {
    n: "02",
    title: "Interested, then gone.",
    body: "A visitor has a question before they buy. Answer it while they are still on the page, and keep their email for follow-up.",
  },
  {
    n: "03",
    title: "Closed for the day.",
    body: "Your customers are not. Give them a way to get answers after hours without asking the team to stay online.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <p className="text-sm font-medium text-primary">Support that stays with the customer</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-balance md:text-5xl">
              AI customer support that pays for itself.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              Connect the pages, files, and notes your team already has. The agent answers from that material, cites the source, and saves an email when someone wants a person.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/sign-in" className={cn(buttonVariants({ size: "lg" }), "h-11 px-4")}>
                Get started
              </Link>
              <Link href="/pricing" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 px-4")}>
                See pricing
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">No model API key. Answers stay on this machine.</p>
          </div>
          <ChatPanel agentId={DEMO_AGENT} />
        </section>

        <section className="border-y bg-card">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-sm text-muted-foreground">
            {["Notion", "YouTube", "Drive", "Slack", "Shopify", "HubSpot"].map((name) => (
              <span key={name} className="font-medium">
                {name}
              </span>
            ))}
            <span>and the rest of the stack</span>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl font-semibold tracking-tight">Support should not take over the day.</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {problems.map((problem) => (
              <article key={problem.n} className="rounded-2xl border bg-card p-5">
                <p className="text-sm font-medium text-primary">{problem.n}</p>
                <h3 className="mt-2 text-lg font-semibold">{problem.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{problem.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-card py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-3xl font-semibold tracking-tight">All your tools. One helpful agent.</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {integrations.slice(0, 3).map((group) => (
                <article key={group.group} className="rounded-2xl border p-5">
                  <h3 className="font-semibold">{group.group}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{group.blurb}</p>
                  <p className="mt-4 text-sm">{group.items.join(" · ")}</p>
                </article>
              ))}
            </div>
            <Link href="/integrations" className="mt-6 inline-block text-sm font-medium text-primary">
              Review every integration
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-3xl font-semibold tracking-tight">Built for how you sell.</h2>
            <Link href="/use-cases" className="text-sm font-medium text-primary">
              All use cases
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {useCases.slice(0, 6).map((item) => (
              <Link key={item.slug} href={`/use-cases/${item.slug}`} className="rounded-2xl border bg-card p-5 hover:border-primary/40">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.summary}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-16">
          <h2 className="text-3xl font-semibold tracking-tight">A little clarity. Then, let’s go.</h2>
          <Accordion className="mt-6">
            {faqs.map((faq) => (
              <AccordionItem key={faq.q} value={faq.q}>
                <AccordionTrigger>{faq.q}</AccordionTrigger>
                <AccordionContent>{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
