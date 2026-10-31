import { MarketingShell } from "@/components/marketing-shell";

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <h1 className="text-4xl font-semibold tracking-tight">Privacy</h1>
      <div className="mt-6 max-w-2xl space-y-4 text-muted-foreground">
        <p>Accounts, sources, conversations, and leads are written to a file on this machine. PlugMyChat does not send them to a hosted service.</p>
        <p>Adding a URL fetches that public page once so the text can be stored as a source. Private networks and redirects are refused.</p>
        <p>Delete an agent to remove its sources and conversations from the local file.</p>
      </div>
    </MarketingShell>
  );
}
