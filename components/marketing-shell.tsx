import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="page-wrap py-16">{children}</main>
      <SiteFooter />
    </div>
  );
}
