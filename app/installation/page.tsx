import { MarketingShell } from "@/components/marketing-shell";

const channels = [
  ["Any HTML site", "Paste the script tag before </body>."],
  ["WordPress", "Use Appearance or a header-and-footer plugin and paste the same snippet."],
  ["Webflow", "Site settings, then custom code, then the footer."],
  ["Wix", "Settings, Custom code, then the body end."],
  ["Shopify", "Online store, Themes, Edit code, then theme.liquid before </body>."],
  ["Framer", "Site settings, Custom code."],
  ["Slack, Telegram, WhatsApp", "Listed on the public product. This rebuild answers on the website widget."],
];

export default function InstallationPage() {
  return (
    <MarketingShell>
      <h1 className="text-4xl font-semibold tracking-tight">Install the widget</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        After you create an agent, the Install tab shows a script for that agent. The shape is the same everywhere:
      </p>
      <pre className="mt-6 overflow-x-auto rounded-2xl bg-foreground p-4 text-sm text-background">{`<script src="https://your-host/widget.js" data-agent="agt_..."></script>`}</pre>
      <ul className="mt-8 grid gap-3 md:grid-cols-2">
        {channels.map(([name, body]) => (
          <li key={name} className="rounded-2xl border bg-card p-4">
            <h2 className="font-semibold">{name}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{body}</p>
          </li>
        ))}
      </ul>
    </MarketingShell>
  );
}
