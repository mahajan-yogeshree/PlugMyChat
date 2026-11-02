import { NextResponse } from "next/server";

import { composeAnswer, rankSources } from "@/lib/answer";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    title?: string;
    text?: string;
    question?: string;
  } | null;
  const question = body?.question?.trim() ?? "";
  const text = body?.text?.trim().slice(0, 20000) ?? "";
  const title = body?.title?.trim().slice(0, 120) || "This page";
  if (question.length < 1 || question.length > 2000 || text.length < 20) {
    return NextResponse.json({ error: "Ask a question about the page you loaded." }, { status: 400 });
  }
  const ranked = rankSources(question, [{ title, body: text }]);
  const answer = composeAnswer(question, ranked);
  return NextResponse.json({
    content: answer.content,
    citations: answer.citations,
    missed: answer.missed,
  });
}
