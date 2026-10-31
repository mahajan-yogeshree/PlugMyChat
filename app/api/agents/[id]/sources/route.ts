import { NextResponse } from "next/server";

import { readPublicPage } from "@/lib/ingest";
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
    let title = body?.title?.trim() || "Untitled source";
    let text = body?.text?.trim() || "";
    let origin: string | undefined;
    if (kind === "url") {
      if (!body?.url) throw new Error("Add a page URL.");
      const page = await readPublicPage(body.url);
      title = body.title?.trim() || page.title;
      text = page.body;
      origin = body.url;
    }
    if (text.length < 20) throw new Error("Add at least a short paragraph.");
    const source = await updateDatabase((db) => {
      const agent = db.agents.find((item) => item.id === id && item.userId === user.id);
      if (!agent) throw new Error("Agent not found.");
      const plan = getPlan(user.plan);
      const used = db.agents
        .filter((item) => item.userId === user.id)
        .reduce(
          (sum, item) => sum + item.sources.reduce((inner, entry) => inner + entry.body.length, 0),
          0,
        );
      if (used + text.length > plan.characters) {
        throw new Error(`${plan.name} is at its training character limit.`);
      }
      const created = {
        id: createId("src"),
        title: title.slice(0, 120),
        kind,
        body: text.slice(0, 20000),
        origin,
        createdAt: new Date().toISOString(),
      };
      agent.sources.push(created);
      return created;
    });
    return NextResponse.json({ source });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not add that source.";
    const status = message === "Agent not found." ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
