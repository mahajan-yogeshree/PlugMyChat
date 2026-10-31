import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12">{children}</main>
      <SiteFooter />
    </div>
  );
}
