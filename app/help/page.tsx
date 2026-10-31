import { MarketingShell } from "@/components/marketing-shell";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { faqs } from "@/lib/content";

const guides = [
  ["Create an agent", "Sign in, open Agents, and name the assistant your visitors will see."],
  ["Add knowledge", "Paste a policy, upload a text file, or save one public page. The character limit follows the plan."],
  ["Test it", "Use the Test tab. If the answer is wrong, add the missing paragraph instead of hoping the model guesses."],
  ["Install it", "Copy the script tag from Install and place it before the closing body tag."],
  ["Collect a lead", "When a visitor includes an email, it shows up under Leads."],
];

export default function HelpPage() {
  return (
    <MarketingShell>
      <h1 className="text-4xl font-semibold tracking-tight">Help center</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">The shortest path from an empty workspace to a widget on a page.</p>
      <ol className="mt-8 space-y-4">
        {guides.map(([title, body], index) => (
          <li key={title} className="rounded-2xl border bg-card p-5">
            <p className="text-sm text-primary">Step {index + 1}</p>
            <h2 className="mt-1 font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{body}</p>
          </li>
        ))}
      </ol>
      <Accordion className="mt-10">
        {faqs.map((faq) => (
          <AccordionItem key={faq.q} value={faq.q}>
            <AccordionTrigger>{faq.q}</AccordionTrigger>
            <AccordionContent>{faq.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </MarketingShell>
  );
}
