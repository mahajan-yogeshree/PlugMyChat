# PlugMyChat tech spec

Status: local Next.js app, 1 November 2026. This is the specification of the code in this repository. Product intent is in `docs/prd.md`. Visual tokens are locked in `design.md`.

## Stack

- Next.js 15.5 App Router, React 19, TypeScript.
- Tailwind CSS v4 and shadcn/ui (base-ui). The Dose theme maps onto those tokens in `app/globals.css`, `app/tokens.css`, and `app/base.css`.
- No database server and no hosted model. State is one JSON file.
- Dev server: `next dev --turbopack -H 0.0.0.0 -p 43123`.

## Layout

```
app/                  routes and route handlers
components/           marketing chrome, desk shell, chat, agent studio
lib/plans.ts          plan catalog
lib/store.ts          JSON file, ids, password hashing, seed
lib/session.ts        cookie session, sign-in, usage
lib/answer.ts         retrieval and reply text
lib/ingest.ts         public page fetch
lib/content.ts        marketing copy
data/store.json       runtime data, gitignored
```

A request never imports a model client. Chat calls `rankSources` and `composeAnswer` in the same process that read the file.

## Persistence

`lib/store.ts` keeps a queue so writes do not overlap. Each write reads `data/store.json`, mutates it, and renames a temp file over the store.

If the file is missing, the seed creates:

- User `usr_demo`, `demo@northwind.example`, password `harbor-demo`, plan `standard`.
- Agent `agt_northwind`, “Northwind Desk”, with four text sources: Returns policy, Shipping, Bracket install notes, Demos and contact.

Passwords are `scrypt` (salt, 32-byte hash), stored as `salt:hash`. Comparison uses `timingSafeEqual`.

Ids are `{prefix}_{16 hex chars}` from 8 random bytes. Prefixes: `usr`, `ses`, `agt`, `src`, `cnv`, `msg`, `led`, `ptr`.

## Session

Cookie name: `cwt_session`. Flags: `httpOnly`, `sameSite: lax`, `path: /`, `maxAge` 30 days.

`POST /api/auth/sign-in` accepts `{ email, password }`.

- Email is trimmed and lowercased and must contain one `@` and a dot in the domain.
- Password must be at least 8 characters.
- Unknown email creates a user on plan `hobby`, name taken from the mailbox, then sets the cookie.
- Known email with a bad password returns 400 and does not create a session.

`POST /api/auth/sign-out` deletes the session row and the cookie. `GET /api/me` returns the public user, usage, and that user’s agents, or 401.

## Retrieval

`rankSources` lowercases the question, keeps tokens longer than 2 characters, drops a small stop list, and stems a trailing `ing`, `ed`, `es`, or `s`. A short related-word list expands refund to return, shipping to delivery, and a few other support pairs. Each source body is split on blank lines and sentence boundaries. Passages score with BM25 (`k` 1.2, `b` 0.75). Passages with score 0 are dropped. The top 3 are kept.

`composeAnswer` keeps only pieces whose title matches the highest-scoring piece, at most two sentences. The reply ends with `From {title}.` If nothing scored, `missed` is true and the reply says the sources do not contain the answer and asks for an email. A miss stores `closestTitle` and `closestText` from that result, which are empty when every passage scored zero.

The agent `instructions` string is not an input to `composeAnswer`.

## Chat

`POST /api/chat` body: `{ agentId, message, conversationId?, visitor?, pageUrl? }`.

`pageUrl` is kept only when it is `http` or `https`, trimmed to 500 characters. It is stored on the visitor message. The assistant message stores an empty page URL. When `composeAnswer` sets `missed`, a miss row (`mis_…`) is appended unless the same agent, question, and page URL are already listed. The list keeps the newest 200 misses.

- `message` must be 1 to 2,000 characters or the response is 400.
- Unknown agent is 404.
- Assistant messages for all of the owner’s agents in the current `YYYY-MM` are counted. At `plan.credits`, the handler throws before any message is appended. `updateDatabase` writes the file only after the callback returns, so a refused chat is not stored. The route returns 400.
- A new conversation id is `cnv_…` when `conversationId` is missing or belongs to another agent.
- An email in the message is saved as a lead when `collectLeads` is true and that address is not already stored for the agent. The reply is prefixed with `Saved {email}.`
- Response: `{ conversationId, message, leadSaved }`. `message` includes `content` and `citations`.

The widget and the homepage panel do not send a session cookie requirement. Anyone who knows an agent id can chat with it. That is the public embed.

## Sources

`POST /api/agents/{id}/sources` requires a session and ownership.

- `kind` `url` calls `readPublicPage`. Other kinds use `text`.
- Body must be at least 20 characters. Stored body is sliced to 20,000. Title is sliced to 120 characters.
- The sum of source body lengths across the user’s agents, plus the new text, must be within `plan.characters`.

`readPublicPage`:

- Allows only `http:` and `https:`.
- Rejects `localhost`, `0.0.0.0`, loopback, RFC1918, link-local, and `*.local`.
- `redirect: "manual"`. Status 300–399 is an error.
- Timeout 8 seconds. User-Agent `PlugMyChat/1.0`.
- YouTube hosts return a short pointer and do not fetch a transcript.
- HTML is stripped of script and style, tags removed, then sliced to 20,000 characters. Fewer than 40 characters of text is an error.

`DELETE /api/agents/{id}/sources/{sourceId}` removes one source owned by the session user.

## Agents and plans

`POST /api/agents` with `{ name, welcome?, accent?, launcherLabel? }` creates an agent until `plan.agents` is reached. Defaults: welcome line includes the name, accent `#1f7a4d`, launcher label `Chat`, `collectLeads: true`, empty sources. A welcome shorter than a sentence is 400. An accent that is not `#` plus 6 hex digits falls back to `#1f7a4d`. The launcher label is sliced to 24 characters.

`PATCH /api/agents/{id}` updates `name`, `welcome`, `accent` (a `#` plus 6 hex digits), `launcherLabel`, `instructions`, and `collectLeads`. Deleting an agent also removes its misses.

`POST /api/billing` with `{ plan }` sets the user’s plan to `starter`, `hobby`, `standard`, or `business`. No payment object is created.

`GET /api/public-agent/{id}` returns `id`, `name`, `welcome`, `accent`, `launcherLabel`, and `showBadge`. `showBadge` is false when the owner’s plan has `removeBranding` (Standard and Business).

## Widget

`GET /widget.js` returns a small script, `cache-control: no-store`. Install stays one tag: `<script src="{origin}/widget.js" data-agent="{id}"></script>`.

The script reads `data-agent` and the script URL’s origin. It appends a button whose default label is Chat and whose default background is `#1f7a4d`, then fetches `/api/public-agent/{id}` and replaces the label and background when the agent record has them. The iframe points at `{origin}/embed/{agent id}`. When `window.location.href` is `http` or `https`, the iframe URL adds `?page=` with that address. The embed page passes `page` into `ChatPanel`, which posts it as `pageUrl`.

## Trial and misses

`POST /api/trial` with `{ url }` reads one public page and returns `{ title, text, url }`. It does not write the store.

`POST /api/trial/chat` with `{ title, text, question }` ranks that page and returns the composed reply. It does not write the store and does not spend a credit. `text` is sliced to 20,000 characters.

`GET /api/misses` requires a session and returns misses for the user’s agents, newest first, with the agent name.

`POST /api/misses/{id}` with `{ text }` of at least 20 characters adds a note source titled with the closest source, or “Added after a miss”, then deletes the miss. The plan character cap still applies.

## Other routes

| Method and path | Auth | Behavior |
| --- | --- | --- |
| `GET /api/agents` | session | Agents for the user |
| `GET /api/conversations` | session | Conversations whose agent belongs to the user |
| `GET /api/leads` | session | Leads for those agents |
| `GET /api/misses` | session | Unanswered questions for those agents |
| `POST /api/misses/{id}` | session | Saves a paragraph and removes the miss |
| `POST /api/trial` | none | Reads one public page for the homepage trial |
| `POST /api/trial/chat` | none | Answers from that page without saving it |
| `POST /api/partners` | none | Saves an agency name and website. Name at least 2 characters, website at least 4 |

Marketing routes are server or client pages under `app/` and do not write the store except agencies (`/api/partners`) and the public chat.

Desk routes under `app/app/` redirect to `/sign-in` when `/api/me` returns 401.

## What the plan flags do not do

These fields exist on each plan in `lib/plans.ts` and are printed in the pricing table. No job reads them to send mail, call a webhook, train on a clock, apply a guardrail, or open Slack, WhatsApp, or Telegram:

`trialDays`, `mcpCalls`, `autoTrain`, `notifications`, `actions`, `guardrails`, `api`, `messaging`, `customDomain`, `ownKey`.

`conversations` is display copy. The only monthly counter is assistant messages compared with `credits`.

## Design system

Dose, genre modern-minimal. Paper, ink, and the pharmacy green live in `app/tokens.css`. shadcn’s `--accent` and `--muted` stay as surfaces. The green is `--color-signal`. Quiet text is `--color-ink-3`. Display face is Schibsted Grotesk, body is Instrument Sans, figures and times are DM Mono. `design.md` is the lock. Later pages should read it before introducing a second palette.

## Run

```sh
npm install
npm run dev
```

Open `http://127.0.0.1:43123`. Workspace data is `data/store.json` and is not committed.

## Known limits

- One JSON file. Two server processes will race. The in-process queue only serializes writers in one process.
- Retrieval is BM25 plus a small related-word list. A paraphrase outside that list still misses.
- The credit check and the chat write share one `updateDatabase` call, so a failed check does not append messages. A crash during the rename can leave the previous file, because the write uses a temp file and `rename`.
- The widget launcher uses the agent accent. The panel uses Dose tokens plus that accent on the top border.
- Keeping a trial agent sends an unsigned visitor to sign-in. The page stays in `sessionStorage` under `plugmychat-trial`. Sign-in does not finish the save on its own. The visitor returns to the homepage and chooses Keep this agent again.
- There is no automated test suite in the repo. Checks so far are typecheck, Hallmark lint on the homepage, and manual API calls.
