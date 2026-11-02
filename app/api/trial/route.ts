import { NextResponse } from "next/server";

import { readPublicPage } from "@/lib/ingest";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { url?: string } | null;
  if (!body?.url?.trim()) {
    return NextResponse.json({ error: "Paste a public page URL." }, { status: 400 });
  }
  try {
    const page = await readPublicPage(body.url.trim());
    return NextResponse.json({ title: page.title, text: page.body, url: body.url.trim() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "That page could not be read.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
