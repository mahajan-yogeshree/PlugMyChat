export type Chunk = { title: string; text: string; score: number };

const STOP = new Set([
  "the", "and", "for", "you", "your", "with", "this", "that", "from", "have",
  "what", "when", "where", "how", "can", "are", "was", "does", "about", "into",
  "not", "but", "our", "any", "all",
]);

const RELATED = [
  ["return", "refund", "exchange"],
  ["ship", "shipping", "delivery", "deliver"],
  ["price", "pricing", "cost", "fee"],
  ["order", "tracking", "track"],
  ["hour", "hours", "open", "opening"],
  ["install", "mount", "setup"],
  ["pay", "payment", "paid"],
  ["cancel", "cancellation"],
];

function stem(word: string) {
  if (word.length <= 3) return word;
  return word.replace(/(ing|ed|es|s)$/, "");
}

function tokens(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9#]+/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP.has(word))
    .map(stem);
}

function expand(query: string[]) {
  const out = new Set(query);
  for (const word of query) {
    for (const group of RELATED) {
      if (group.some((item) => stem(item) === word)) {
        for (const item of group) out.add(stem(item));
      }
    }
  }
  return [...out];
}

function passages(body: string) {
  const parts = body
    .split(/\n+|(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 20);
  return parts.length > 0 ? parts : [body];
}

export function rankSources(
  question: string,
  sources: { title: string; body: string }[],
) {
  const query = expand(tokens(question));
  const docs: { title: string; text: string; words: string[] }[] = [];
  for (const source of sources) {
    for (const text of passages(source.body)) {
      docs.push({ title: source.title, text, words: tokens(text) });
    }
  }
  if (query.length === 0 || docs.length === 0) return [] as Chunk[];
  const avg = docs.reduce((sum, doc) => sum + doc.words.length, 0) / docs.length || 1;
  const df = new Map<string, number>();
  for (const term of query) {
    df.set(term, docs.filter((doc) => doc.words.includes(term)).length);
  }
  const k = 1.2;
  const b = 0.75;
  const chunks: Chunk[] = [];
  for (const doc of docs) {
    let score = 0;
    for (const term of query) {
      const freq = doc.words.filter((word) => word === term).length;
      if (!freq) continue;
      const seen = df.get(term) ?? 0;
      const idf = Math.log(1 + (docs.length - seen + 0.5) / (seen + 0.5));
      const denom = freq + k * (1 - b + b * (doc.words.length / avg));
      score += idf * ((freq * (k + 1)) / denom);
    }
    if (score > 0) chunks.push({ title: doc.title, text: doc.text, score });
  }
  return chunks.sort((a, b) => b.score - a.score).slice(0, 3);
}

export function extractEmail(message: string) {
  return message.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? null;
}

export function composeAnswer(_question: string, chunks: Chunk[]) {
  if (chunks.length === 0) {
    return {
      content:
        "I don't have that in the sources for this agent. Leave an email if you want a person to follow up.",
      citations: [] as string[],
      missed: true,
      closestTitle: "",
      closestText: "",
    };
  }
  const best = chunks[0];
  const chosen = chunks.filter((chunk) => chunk.title === best.title).slice(0, 2);
  return {
    content: `${chosen.map((chunk) => chunk.text).join(" ")}\n\nFrom ${best.title}.`,
    citations: [best.title],
    missed: false,
    closestTitle: best.title,
    closestText: best.text,
  };
}

export function cleanPageUrl(value: unknown) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim().slice(0, 500);
  if (!/^https?:\/\//i.test(trimmed)) return "";
  return trimmed;
}
