export const useCases = [
  {
    slug: "saas",
    title: "SaaS",
    summary: "Turn help docs into an agent that qualifies trials and answers setup questions.",
    prompt: "How do I connect Slack?",
    answer: "Open Settings, choose Integrations, then Slack. The connection takes about a minute.",
  },
  {
    slug: "ecommerce",
    title: "E-commerce",
    summary: "Help shoppers find products, check an order, and start a return without waiting.",
    prompt: "Where is order #4471?",
    answer: "It left the warehouse this morning with UPS and is due Thursday.",
  },
  {
    slug: "real-estate",
    title: "Real estate",
    summary: "Let buyers ask about listings and book a viewing after the office closes.",
    prompt: "Can I see the Elm Street listing tonight?",
    answer: "Yes. The 6:30 slot is open. What email should the confirmation use?",
  },
  {
    slug: "food",
    title: "Food delivery",
    summary: "Share the menu, track an order, and answer delivery questions off the phone.",
    prompt: "Is the driver close?",
    answer: "Order #2841 is 12 minutes out. The driver is already on the way.",
  },
  {
    slug: "healthcare",
    title: "Healthcare",
    summary: "Answer hours and policy questions, and send urgent cases to a person.",
    prompt: "What are Saturday hours?",
    answer: "The clinic is open 9 to 1. Chest pain or trouble breathing should go to emergency care, not chat.",
  },
  {
    slug: "manufacturing",
    title: "Manufacturing",
    summary: "Help buyers find part numbers, specs, and lead times from your sheets.",
    prompt: "Lead time on bracket B-14?",
    answer: "B-14 ships in 6 business days when it is in stock. The install video shows the top screws at 2:14.",
  },
  {
    slug: "finance",
    title: "Finance",
    summary: "Deflect routine fee and process questions while a person handles the rest.",
    prompt: "Is there a fee to wire funds?",
    answer: "Domestic wires are $15. International wires are quoted before you confirm.",
  },
  {
    slug: "travel",
    title: "Travel and tourism",
    summary: "Compare packages and answer booking questions before a visitor leaves.",
    prompt: "Does the coastal package include breakfast?",
    answer: "Yes. Breakfast is included, and the airport transfer is optional at checkout.",
  },
  {
    slug: "legal",
    title: "Legal",
    summary: "Screen a matter and share intake details before a consultation.",
    prompt: "Do you handle tenant disputes?",
    answer: "Yes, for residential leases in this state. Share your email and a short description to request a consult.",
  },
];

export const integrations = [
  {
    group: "Website builders",
    blurb: "Add the chat widget with one snippet.",
    items: ["WordPress", "Wix", "Webflow", "Squarespace", "Framer", "Any HTML site"],
  },
  {
    group: "E-commerce",
    blurb: "Product and order answers from the store you connect.",
    items: ["Shopify", "WooCommerce"],
  },
  {
    group: "Messaging",
    blurb: "The same answers on chat apps as on the site.",
    items: ["WhatsApp", "Slack", "Telegram"],
  },
  {
    group: "Actions and CRM",
    blurb: "Save a lead, look up a record, or open a ticket.",
    items: ["HubSpot", "Airtable", "Mailchimp", "Notion", "Microsoft Teams"],
  },
  {
    group: "Automation",
    blurb: "Send conversation data onward, or call an API you describe.",
    items: ["Zapier", "Make.com", "Your own API"],
  },
];

export const faqs = [
  {
    q: "What can I train an agent on?",
    a: "Paste help text, upload a text file, or save a public page. The agent answers from that material and names the source.",
  },
  {
    q: "Do I need an OpenAI API key?",
    a: "No. This local rebuild answers by searching the sources you added. It does not call a hosted model.",
  },
  {
    q: "Can it collect leads and take actions?",
    a: "Yes. If a visitor leaves an email, it is saved on the Leads page. Connected tools are recorded as skills you can turn on for the workspace.",
  },
  {
    q: "Can I use my own branding?",
    a: "Yes. Set the agent name, welcome line, and accent color. Higher plans in the original product also remove the badge and add a custom domain.",
  },
];
