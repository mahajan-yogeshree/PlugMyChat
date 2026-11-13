# PlugMyChat

PlugMyChat is a local customer-support agent. It was rebuilt from the public behavior at [chatwith.tools](https://chatwith.tools/), after REA inspected that site through Chrome DevTools (page structure, routes, and the published plan list). This app runs on one machine:

- Marketing pages for home, pricing, integrations, use cases, agencies, help, installation, and a short blog
- Email sign-in that creates an account when the address is new
- Agents trained on pasted text, text files, or one public page
- A homepage trial that reads the site behind that URL, quotes the page that answered, and a one-line website widget that sends the page the visitor is on
- Inbox, leads, and a list of questions the bot could not answer
- Lead capture when a visitor types an email
- The published plan ladder (Starter $9, Hobby $19, Standard $99, Business $399), applied only inside this workspace

Answers are grounded in the pages you stored. When `XAI_API_KEY` is set, a question and the retrieved passages are sent to the xAI API (`https://api.x.ai/v1/chat/completions`, model `grok-4.7` unless `XAI_MODEL` is set). The model may quote or rephrase only that text and must name the page. If the key is missing or the call fails, the agent says the model is unavailable and shows the saved passage instead of inventing an answer. If the pages do not contain the answer, it uses the miss line. Google sign-in, card checkout, and messaging apps (Slack, WhatsApp, Telegram) are shown as part of the product map and are not connected.

## Run it

```sh
npm install
npm run dev
```

Open [http://127.0.0.1:43123](http://127.0.0.1:43123).

Sample workspace: `demo@northwind.example` / `harbor-demo`. The homepage chat uses that agent. Ask where order 4471 is, or how to mount bracket B-14.

Workspace data is written to `data/store.json`.

## Docs

- [Product requirements](docs/prd.md)
- [Tech spec](docs/tech-spec.md)
