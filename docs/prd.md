# PlugMyChat product requirements

Status: local product, 1 November 2026. This document describes the product that is running in this repository. It does not describe a hosted billing service or a connected language model.

## Summary

PlugMyChat lets a business put a support agent on its website. The owner adds the pages, notes, and text files the team already has. Visitors ask questions. The agent answers from that material, names the source, and saves an email when someone wants a person.

Answers stay on the machine that runs the app. They are not sent to a hosted model.

## Problem

Customers ask the same shipping, pricing, and returns questions, including after the desk has closed. The useful reply is one that comes from the business’s own pages, with the source named, while the team handles the cases that need a person.

## Who it is for

- A small business that wants a chat on its site and already has help text, policies, or product notes.
- An agency that wants to record interest in installing agents for clients. The partner form stores the request locally. It does not book a call or charge a fee.
- A visitor on that site who needs an answer now, or who wants to leave an email.

## Principles

- An answer quotes the stored source, or it says the source does not contain the answer.
- A number on a plan is either enforced by the app or marked as a catalog flag. The app does not invent usage, customers, or uptime.
- Sign-in, agents, sources, chat, leads, and the widget work without an API key.
- Google sign-in, card checkout, and chat apps are shown where the product map includes them, and they are not connected.

## First implementation

Decided 1 November 2026. A single URL cannot build a finished bot. The first thing we ship is a trial on the PlugMyChat site: paste a public URL, see how that page would answer, and adjust the widget until it looks like theirs. Install stays one script tag, and that script uses the look they just set.

1. **URL trial on our site.** The homepage takes one public `http` or `https` URL, reads that page, and opens a chat against it. The reply cites a sentence from that page, or says the page does not contain the answer. The screen says this is a one-page trial, and that more pages can be added after sign-in. Northwind stays available as a sample.
2. **The trial uses their widget.** Name, welcome line, accent color, and launcher label update the preview as they type. The same settings are what the embed and the install script use. The launcher is no longer a fixed indigo button.
3. **A match that finds the paragraph.** On that one page, overlapping words are too brittle for the trial. Retrieval ranks passages by meaning, still on this machine, and the reply is still a sentence from the page or a miss. No hosted model.

The next round, after this trial has been used on real pages: save the miss list with the page URL, send the visitor’s current page from the installed widget, and let the owner add a second URL when the first page was not enough.

## Later

WhatsApp, other languages, Shopify order lookup, charging a card, a second plan, PDF and Notion import, webhooks, agency white-label, crawling a whole domain, and proactive popups.

## Goals

1. A new owner can create an account, add one source, test an answer, and copy an install snippet.
2. A visitor can ask a question on the site widget and see which source the reply came from.
3. An email typed in chat is saved on the Leads page when the agent is set to collect leads.
4. Plan limits that the app enforces (agents, monthly message credits, training characters) stop the action when the limit is reached.

## Non-goals for this build

- Charging a card, invoices, or trials that expire.
- Signing in with Google.
- Slack, WhatsApp, Telegram, webhooks, or a public agent API.
- Custom domains, bringing a model key, auto-training on a schedule, or guardrail rules.
- Downloading YouTube transcripts or following redirects when a page is saved.
- A hosted multi-tenant service. Data lives in one file on one machine.

## Journeys

### Owner

1. Open the site and choose Get started.
2. Sign in with an email and a password of at least 8 characters. A new email creates an account on the Hobby plan.
3. Create an agent, within the plan’s agent cap.
4. Add knowledge: pasted text, a `.txt`, `.md`, or `.csv` file, or one public `http` or `https` page.
5. Test a question on the Test tab. If the reply is wrong, add the missing paragraph.
6. Copy the script tag from Install and place it before `</body>` on the site.
7. Read conversations in Inbox and emails in Leads.
8. Change the workspace plan on the Plan page. The change is local and does not charge a card.

### Visitor

1. Open a page that includes the widget and choose Chat.
2. Read the welcome line and ask a question of up to 2,000 characters.
3. Receive up to two sentences from the best matching source, with that source’s title, or a line that the sources do not contain the answer.
4. Include an email if a person should follow up. The address is saved once per agent when lead collection is on.

### Sample desk

The homepage chat uses the seeded Northwind Desk agent. Shipping, returns, bracket install notes, and a demo contact note are already stored. Asking where order 4471 is cites Shipping.

Sample sign-in: `demo@northwind.example` / `harbor-demo` (Standard plan).

## Requirements

### Account

- Email and password only. A new email creates the account. An existing email with the wrong password is rejected.
- The session cookie lasts 30 days.
- A new account starts on Hobby. The sample account stays on Standard.
- Google sign-in shows a notice that it is not connected.

### Agent

- Name, welcome line, accent color, instructions, and a lead-collection switch.
- The welcome line is what the visitor sees first.
- Instructions are stored with the agent. This build does not send them to a model. The reply is chosen from sources.
- Creating an agent fails when the workspace is already at its plan’s agent count.

### Knowledge

- A source is a title plus text, at least a short paragraph, stored up to 20,000 characters.
- A text file is read in the browser and saved as text. It is not stored as a binary.
- A URL must be public `http` or `https`. Local and private addresses are rejected. Redirects are not followed. The fetch stops after 8 seconds. Script and style tags are stripped.
- A YouTube link is stored as a pointer. The transcript is not downloaded.
- Adding text that would pass the plan’s training-character cap fails with the plan name in the error.

### Answers

- The question is matched to stored sentences by overlapping words.
- The reply uses sentences from the single best source title, then names that title.
- If nothing matches, the reply says the sources do not contain it and invites an email.
- Each assistant reply counts as one message credit for the calendar month. At the cap, chat returns an error and does not add another reply.
- The instructions field does not change the wording of the reply in this build.

### Leads and inbox

- If lead collection is on and the message contains an email, that address is saved with a short note. The same address is not saved twice for the same agent.
- Inbox lists conversations for the signed-in owner’s agents.

### Install

- Install shows `<script src="{origin}/widget.js" data-agent="{agent id}"></script>`.
- The script adds a Chat button and an iframe of `/embed/{agent id}`.
- The embed shows “Powered by PlugMyChat” unless the owner’s plan has the remove-branding flag (Standard and Business).

### Plans

Prices are monthly, with yearly equal to ten months paid once. Changing a plan updates the workspace only.

| Plan | Month | Year | Credits | Conversations shown | Training characters | Agents |
| --- | --- | --- | --- | --- | --- | --- |
| Starter | $9 | $90 | 250 | about 50 | 2,000,000 | 1 |
| Hobby | $19 | $190 | 1,000 | about 200 | 10,000,000 | 3 |
| Standard | $99 | $990 | 10,000 | about 2,000 | 20,000,000 | 5 |
| Business | $399 | $3,990 | 40,000 | about 8,000 | 50,000,000 | 20 |

Enforced today: agent count, monthly assistant-message credits, training characters, and whether the badge is shown.

Shown on the pricing table and not enforced or not built: trial length, auto-train schedule, actions, guardrails, notifications, agent API, messaging apps, custom domain, own model key, and the conversation estimates. Those conversation figures are labels on the plan, not a second counter.

### Marketing

The public site includes home, pricing, integrations, use cases, agencies, help, installation, a short blog, affiliates, privacy, and terms. Integration names describe where a customer might place the widget. Only the website widget, lead capture, and source training run.

The agency form saves the agency name, website, client note, and whether they sell retainers.

## Done when

- The sample question about order 4471 cites Shipping and does not mix in the returns policy.
- A private URL such as `http://127.0.0.1/` is rejected.
- A second agent on Starter is rejected.
- An email in a visitor message appears under Leads.
- The install snippet loads the embed for that agent id.
