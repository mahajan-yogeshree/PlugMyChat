import { NextResponse } from "next/server";

import { readSite } from "@/lib/ingest";
import { getPlan } from "@/lib/plans";
import { currentUser } from "@/lib/session";
import { createId, updateDatabase } from "@/lib/store";
import type { SourceKind } from "@/lib/types";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as {
    title?: string;
    kind?: SourceKind;
    text?: string;
    url?: string;
  } | null;
  const kind = body?.kind ?? "text";
  try {
    const title = body?.title?.trim() || "Untitled source";
    const text = body?.text?.trim() || "";
    let pages: { title: string; body: string; origin?: string }[] = [];
    if (kind === "url") {
      if (!body?.url) throw new Error("Add a page URL.");
      if (text.length >= 20) {
        pages = [{ title: title === "Untitled source" ? "Page" : title, body: text.slice(0, 20000), origin: body.url }];
      } else {
        const site = await readSite(body.url);
        pages = site.pages.map((page) => ({ title: page.title, body: page.body, origin: page.url }));
      }
    } else if (text.length >= 20) {
      pages = [{ title, body: text.slice(0, 20000) }];
    }
    if (pages.length === 0) throw new Error("Add at least a short paragraph.");
    const sources = await updateDatabase((db) => {
      const agent = db.agents.find((item) => item.id === id && item.userId === user.id);
      if (!agent) throw new Error("Agent not found.");
      const plan = getPlan(user.plan);
      let used = db.agents
        .filter((item) => item.userId === user.id)
        .reduce(
          (sum, item) => sum + item.sources.reduce((inner, entry) => inner + entry.body.length, 0),
          0,
        );
      const created = [];
      for (const page of pages) {
        if (page.origin && agent.sources.some((source) => source.origin === page.origin)) continue;
        if (page.body.length < 20) continue;
        if (used + page.body.length > plan.characters) {
          if (created.length === 0) throw new Error(`${plan.name} is at its training character limit.`);
          break;
        }
        const source = {
          id: createId("src"),
          title: page.title.slice(0, 120),
          kind,
          body: page.body.slice(0, 20000),
          origin: page.origin,
          createdAt: new Date().toISOString(),
        };
        agent.sources.push(source);
        created.push(source);
        used += source.body.length;
      }
      if (created.length === 0) throw new Error("Those pages are already on this agent.");
      return created;
    });
    return NextResponse.json({ source: sources[0], sources });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not add that source.";
    const status = message === "Agent not found." ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
