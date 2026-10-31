# Chatwith, rebuilt locally

A local reconstruction of the public product at [chatwith.tools](https://chatwith.tools/). REA inspected the live site through Chrome DevTools (page structure, routes, and the published plan list). This app implements that product on one machine:

- Marketing pages for home, pricing, integrations, use cases, agencies, help, installation, and a short blog
- Email sign-in that creates an account when the address is new
- Agents trained on pasted text, text files, or one public page
- A website widget and inbox
- Lead capture when a visitor types an email
- The published plan ladder (Starter $9, Hobby $19, Standard $99, Business $399), applied only inside this workspace

Answers are chosen from the sources you stored. They are not sent to Chatwith or to a hosted model. Google sign-in, card checkout, and messaging apps (Slack, WhatsApp, Telegram) are shown as part of the product map and are not connected.

## Run it

```sh
npm install
npm run dev
```

Open [http://127.0.0.1:43123](http://127.0.0.1:43123).

Sample workspace: `demo@northwind.example` / `harbor-demo`. The homepage chat uses that agent. Ask where order 4471 is, or how to mount bracket B-14.

Workspace data is written to `data/store.json`.
