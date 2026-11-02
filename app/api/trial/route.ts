import { NextResponse } from "next/server";

import { readSite } from "@/lib/ingest";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { url?: string } | null;
  if (!body?.url?.trim()) {
    return NextResponse.json({ error: "Paste a public page URL." }, { status: 400 });
  }
  try {
    const site = await readSite(body.url.trim());
    const [first] = site.pages;
    return NextResponse.json({
      title: first.title,
      text: first.body,
      url: first.url,
      crawled: site.crawled,
      pages: site.pages.map((page) => ({ title: page.title, text: page.body, url: page.url })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "That page could not be read.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
