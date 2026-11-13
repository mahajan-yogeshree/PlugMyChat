import { MarketingShell } from "@/components/marketing-shell";

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <h1 className="text-4xl font-semibold tracking-tight">Privacy</h1>
      <div className="mt-6 max-w-2xl space-y-4 text-muted-foreground">
        <p>Accounts, sources, conversations, and leads are written to a file on this machine. When XAI_API_KEY is set, a question and the passages retrieved for it are sent to the xAI API so the reply can quote or rephrase those passages. The model is not given the rest of the workspace.</p>
        <p>Adding a URL fetches that public page once so the text can be stored as a source. Private networks and redirects are refused.</p>
        <p>Delete an agent to remove its sources and conversations from the local file.</p>
      </div>
    </MarketingShell>
  );
}
