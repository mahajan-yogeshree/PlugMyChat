export type Chunk = { title: string; text: string; score: number; strong: boolean; origin: string };

export const MISS_LINE =
  "I don't have that in the sources for this agent. Leave an email if you want a person to follow up.";

export function pageKey(value: string) {
  try {
    const url = new URL(value.trim());
    url.hash = "";
    const path = url.pathname.replace(/\/+$/, "") || "/";
    return `${url.hostname.replace(/^www\./i, "").toLowerCase()}${path}${url.search}`;
  } catch {
    return "";
  }
}

const STOP = new Set([
  "the", "and", "for", "you", "your", "with", "this", "that", "from", "have",
  "what", "when", "where", "how", "can", "are", "was", "does", "about", "into",
  "not", "but", "our", "any", "all", "get", "just", "please", "need", "want",
  "tell", "they", "them", "their", "there", "who", "why", "which", "has", "had",
  "been", "were", "will", "would", "could", "should", "does", "did",
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
  ["password", "login", "signin"],
  ["contact", "email", "phone"],
  ["warranty", "guarantee"],
  ["help", "support", "faq"],
  ["address", "location"],
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

function covers(original: string[], words: Set<string>) {
  let count = 0;
  for (const term of original) {
    const group = RELATED.find((items) => items.some((item) => stem(item) === term));
    const names = group ? group.map(stem) : [term];
    if (names.some((name) => words.has(name))) count += 1;
  }
  return count;
}

function counts(words: string[]) {
  const map = new Map<string, number>();
  for (const word of words) map.set(word, (map.get(word) ?? 0) + 1);
  return map;
}

function passages(body: string) {
  const normalized = body.replace(/\s*\n+\s*/g, " ").replace(/[ \t]{2,}/g, " ").trim();
  const parts = normalized
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.replace(/\s+/g, " ").trim())
    .filter((part) => part.length > 20);
  return parts.length > 0 ? parts : [normalized];
}

export function rankSources(
  question: string,
  sources: { title: string; body: string; origin?: string }[],
  preferUrl = "",
) {
  const original = tokens(question);
  const query = expand(original);
  const preferred = pageKey(preferUrl);
  const docs: { title: string; text: string; origin: string; words: Map<string, number>; wordSet: Set<string>; titleWords: Set<string> }[] = [];
  for (const source of sources) {
    const titleWords = new Set(tokens(source.title));
    const origin = source.origin || "";
    for (const text of passages(source.body)) {
      const words = tokens(text);
      docs.push({ title: source.title, text, origin, words: counts(words), wordSet: new Set(words), titleWords });
    }
  }
  if (query.length === 0 || docs.length === 0 || original.length === 0) return [] as Chunk[];
  const avg = docs.reduce((sum, doc) => sum + [...doc.words.values()].reduce((inner, count) => inner + count, 0), 0) / docs.length || 1;
  const df = new Map<string, number>();
  for (const term of query) {
    df.set(term, docs.filter((doc) => doc.wordSet.has(term) || doc.titleWords.has(term)).length);
  }
  const k = 1.2;
  const b = 0.75;
  const strong: Chunk[] = [];
  const weak: Chunk[] = [];
  for (const doc of docs) {
    const covered = covers(original, new Set([...doc.wordSet, ...doc.titleWords]));
    if (covered === 0) continue;
    const length = [...doc.words.values()].reduce((sum, count) => sum + count, 0) || 1;
    let score = 0;
    for (const term of query) {
      const freq = doc.words.get(term) ?? 0;
      const seen = df.get(term) ?? 0;
      const idf = Math.log(1 + (docs.length - seen + 0.5) / (seen + 0.5));
      if (freq) {
        const denom = freq + k * (1 - b + b * (length / avg));
        score += idf * ((freq * (k + 1)) / denom);
      }
      if (doc.titleWords.has(term)) score += idf * 0.45;
    }
    score *= 1 + covered;
    const onPage = preferred !== "" && pageKey(doc.origin) === preferred;
    if (onPage) score *= 4;
    const chunk = { title: doc.title, text: doc.text, origin: doc.origin, score, strong: original.length < 2 || covered >= Math.min(2, original.length) };
    (chunk.strong ? strong : weak).push(chunk);
  }
  strong.sort((a, b) => b.score - a.score);
  weak.sort((a, b) => b.score - a.score);
  if (strong.length > 0) return strong.slice(0, 3);
  return weak.slice(0, 1);
}

export function extractEmail(message: string) {
  return message.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? null;
}

function excerpt(text: string, question: string) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= 420) return clean;
  const lower = clean.toLowerCase();
  let at = -1;
  for (const term of tokens(question)) {
    const found = lower.indexOf(term);
    if (found >= 0 && (at < 0 || found < at)) at = found;
  }
  if (at < 0) return `${clean.slice(0, 420).trim()}…`;
  const start = Math.max(0, at - 100);
  const end = Math.min(clean.length, start + 420);
  return `${start > 0 ? "…" : ""}${clean.slice(start, end).trim()}${end < clean.length ? "…" : ""}`;
}

export function composeAnswer(question: string, chunks: Chunk[]) {
  const best = chunks.find((chunk) => chunk.strong);
  if (!best) {
    const closest = chunks[0];
    return {
      content: MISS_LINE,
      citations: [] as string[],
      missed: true,
      closestTitle: closest?.title ?? "",
      closestText: closest ? excerpt(closest.text, question).slice(0, 400) : "",
    };
  }
  const second = chunks.find(
    (chunk) => chunk.strong && chunk !== best && chunk.title === best.title && chunk.score >= best.score * 0.6 && chunk.text !== best.text,
  );
  const parts = [excerpt(best.text, question)];
  if (second) parts.push(excerpt(second.text, question));
  return {
    content: `${parts.join(" ")}\n\nFrom ${best.title}.`,
    citations: [best.title],
    missed: false,
    closestTitle: best.title,
    closestText: excerpt(best.text, question).slice(0, 400),
  };
}

export function cleanPageUrl(value: unknown) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim().slice(0, 500);
  if (!/^https?:\/\//i.test(trimmed)) return "";
  return trimmed;
}
