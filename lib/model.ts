import type { Chunk } from "./answer";

export const MODEL_UNAVAILABLE = "The model is unavailable.";

const SYSTEM = `You answer a customer question using only the passages in the user message.
Rules:
- Quote a passage or rephrase it. Do not add a fact, name, date, price, or policy that the passages do not state.
- Set source to the exact title of the one passage that answers the question.
- If no passage answers the question, set miss to true and leave reply empty.
- Return JSON only, with no markdown: {"miss":false,"source":"title","reply":"answer"} or {"miss":true,"source":"","reply":""}.`;

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function lockedTokens(text: string) {
  const found = new Set<string>();
  for (const match of text.matchAll(/\b\d[\d,]*(?:\.\d+)?\b/g)) found.add(match[0].replace(/,/g, ""));
  for (const match of text.matchAll(/\b(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi)) {
    found.add(match[0].toLowerCase());
  }
  for (const match of text.matchAll(/\b[A-Z]{2,}[A-Z0-9]*\b/g)) found.add(match[0]);
  for (const match of text.matchAll(/[$€£]\s?\d[\d,]*(?:\.\d+)?/g)) found.add(match[0].replace(/\s/g, ""));
  return [...found];
}

export function passesGrounding(reply: string, passage: string) {
  const clean = reply.replace(/\s+/g, " ").trim();
  if (clean.length < 8) return false;
  const passageFold = passage.toLowerCase();
  if (!lockedTokens(clean).every((token) => passageFold.includes(token.toLowerCase()))) return false;
  const words = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 3);
  const replyWords = words(clean);
  if (replyWords.length === 0) return false;
  const passageWords = new Set(words(passage));
  const hits = replyWords.filter((word) => passageWords.has(word)).length;
  return hits >= Math.min(2, replyWords.length) && hits / replyWords.length >= 0.4;
}

function extractJson(raw: string) {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = (fenced?.[1] ?? raw).trim();
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(body.slice(start, end + 1)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function passageFor(title: string, chunks: Chunk[]) {
  return chunks
    .filter((chunk) => chunk.title.toLowerCase() === title.toLowerCase())
    .map((chunk) => chunk.text)
    .join(" ");
}

export function interpretModelText(raw: string, chunks: Chunk[]) {
  const titles = [...new Set(chunks.map((chunk) => chunk.title))];
  const parsed = extractJson(raw);
  let miss = false;
  let source = "";
  let reply = "";
  if (parsed) {
    miss = parsed.miss === true;
    source = typeof parsed.source === "string" ? parsed.source.trim() : "";
    reply = typeof parsed.reply === "string" ? parsed.reply.trim() : "";
  } else {
    const found = titles.find((title) => raw.toLowerCase().includes(`from ${title.toLowerCase()}`));
    if (!found) return { status: "unavailable" as const };
    source = found;
    reply = raw.replace(new RegExp(`from\\s+${escapeRegExp(found)}\\.?`, "i"), "").trim();
  }
  if (miss || /^i don't have that in the sources/i.test(reply)) return { status: "miss" as const };
  const title = titles.find((item) => item.toLowerCase() === source.toLowerCase());
  const passage = title ? passageFor(title, chunks) : "";
  if (!title || !passesGrounding(reply, passage)) return { status: "unavailable" as const };
  const cited = reply.toLowerCase().includes(`from ${title.toLowerCase()}`) ? reply : `${reply}\n\nFrom ${title}.`;
  return { status: "answer" as const, content: cited, title };
}

function promptFor(question: string, chunks: Chunk[]) {
  const passages = chunks
    .map((chunk, index) => `${index + 1}. Title: ${chunk.title}\n${chunk.text}`)
    .join("\n\n");
  return `Question: ${question}\n\nPassages:\n${passages}`;
}

export async function rephraseGrounded(question: string, chunks: Chunk[]) {
  const key = process.env.XAI_API_KEY?.trim() ?? "";
  if (!key || chunks.length === 0) return { status: "unavailable" as const };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25_000);
  try {
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: process.env.XAI_MODEL?.trim() || "grok-4.7",
        stream: false,
        max_completion_tokens: 800,
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: promptFor(question, chunks) },
        ],
      }),
    });
    if (!response.ok) return { status: "unavailable" as const };
    const payload = (await response.json()) as {
      choices?: { message?: { content?: string | null } }[];
    };
    const text = payload.choices?.[0]?.message?.content;
    if (typeof text !== "string" || !text.trim()) return { status: "unavailable" as const };
    return interpretModelText(text, chunks);
  } catch {
    return { status: "unavailable" as const };
  } finally {
    clearTimeout(timer);
  }
}
