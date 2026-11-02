import { NextResponse } from "next/server";

import { composeAnswer, rankSources } from "@/lib/answer";

type Incoming = { title?: string; text?: string };

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    title?: string;
    text?: string;
    question?: string;
    sources?: Incoming[];
  } | null;
  const question = body?.question?.trim() ?? "";
  const incoming = Array.isArray(body?.sources) && body.sources.length > 0
    ? body.sources
    : [{ title: body?.title, text: body?.text }];
  const sources = incoming.slice(0, 24).map((source) => ({
    title: source.title?.trim().slice(0, 120) || "This page",
    body: source.text?.trim().slice(0, 20000) || "",
  })).filter((source) => source.body.length >= 20);
  if (question.length < 1 || question.length > 2000 || sources.length === 0) {
    return NextResponse.json({ error: "Ask a question about the pages you loaded." }, { status: 400 });
  }
  const ranked = rankSources(question, sources);
  const answer = composeAnswer(question, ranked);
  return NextResponse.json({
    content: answer.content,
    citations: answer.citations,
    missed: answer.missed,
  });
}
