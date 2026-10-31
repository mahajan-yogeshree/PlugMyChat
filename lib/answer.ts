export type Chunk = { title: string; text: string; score: number };

const STOP = new Set([
  "the", "and", "for", "you", "your", "with", "this", "that", "from", "have",
  "what", "when", "where", "how", "can", "are", "was", "does", "about", "into",
]);

function tokens(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9#]+/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP.has(word));
}

export function rankSources(
  question: string,
  sources: { title: string; body: string }[],
) {
  const query = tokens(question);
  const chunks: Chunk[] = [];
  for (const source of sources) {
    const parts = source.body
      .split(/\n+|(?<=[.!?])\s+/)
      .map((part) => part.trim())
      .filter((part) => part.length > 20);
    const pieces = parts.length > 0 ? parts : [source.body];
    for (const text of pieces) {
      const words = new Set(tokens(text));
      let score = 0;
      for (const word of query) {
        if (words.has(word)) score += 2;
        else if (text.toLowerCase().includes(word)) score += 1;
      }
      if (score > 0) chunks.push({ title: source.title, text, score });
    }
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
    };
  }
  const best = chunks[0];
  const chosen = chunks.filter((chunk) => chunk.title === best.title).slice(0, 2);
  const citations = [best.title];
  const lines = chosen.map((chunk) => chunk.text);
  return {
    content: `${lines.join(" ")}\n\nFrom ${citations.join(" · ")}.`,
    citations,
  };
}
