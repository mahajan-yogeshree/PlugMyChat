import { MarketingShell } from "@/components/marketing-shell";

export default function ArticlePage() {
  return (
    <MarketingShell>
      <article className="max-w-2xl">
        <p className="text-sm text-muted-foreground">Guide</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">What an agent can answer</h1>
        <div className="mt-6 space-y-4 text-muted-foreground">
          <p>Each reply is chosen from the paragraphs you stored. Overlapping words pick the closest lines, and the reply names those sources.</p>
          <p>If nothing matches, the agent says so and asks for an email. It does not invent a policy.</p>
          <p>A YouTube link is saved as a pointer. Paste the transcript if you want answers from the video.</p>
        </div>
      </article>
    </MarketingShell>
  );
}
