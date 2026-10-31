import Link from "next/link";

const columns = [
  {
    title: "Product",
    links: [
      ["Home", "/"],
      ["Pricing", "/pricing"],
      ["Integrations", "/integrations"],
      ["Installation", "/installation"],
      ["Help", "/help"],
    ],
  },
  {
    title: "Use cases",
    links: [
      ["All use cases", "/use-cases"],
      ["SaaS", "/use-cases/saas"],
      ["E-commerce", "/use-cases/ecommerce"],
      ["Real estate", "/use-cases/real-estate"],
    ],
  },
  {
    title: "Company",
    links: [
      ["Agencies", "/agencies"],
      ["Affiliates", "/affiliates"],
      ["Blog", "/blog"],
      ["Privacy", "/privacy"],
      ["Terms", "/terms"],
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <p className="text-lg font-semibold">
            chatwith<span className="text-primary">.</span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            AI customer support trained on your business. This copy runs locally and answers only from sources stored on this machine.
          </p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <p className="text-sm font-medium">{column.title}</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {column.links.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-foreground">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
