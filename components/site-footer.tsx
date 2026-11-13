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
    <footer className="border-t">
      <div className="page-wrap py-16">
        <p className="font-display text-lg">PlugMyChat</p>
        <p className="footer-claim">Answers come from the pages you give it.</p>
        <p className="mt-4 max-w-xl text-sm text-muted-foreground">
          Replies quote or rephrase a passage saved from those pages and name the page. A hosted model does that when an API key is set. If the pages do not contain the answer, the agent says so.
        </p>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {columns.map((column) => (
            <div key={column.title}>
              <p className="text-sm font-medium">{column.title}</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {column.links.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="hover:underline">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
