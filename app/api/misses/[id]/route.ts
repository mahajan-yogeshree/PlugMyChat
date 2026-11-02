import { NextResponse } from "next/server";

import { getPlan } from "@/lib/plans";
import { currentUser } from "@/lib/session";
import { createId, updateDatabase } from "@/lib/store";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as { text?: string } | null;
  const text = body?.text?.trim() ?? "";
  if (text.length < 20) {
    return NextResponse.json({ error: "Add at least a short paragraph." }, { status: 400 });
  }
  try {
    const result = await updateDatabase((db) => {
      const miss = db.misses.find((item) => item.id === id);
      const agent = miss ? db.agents.find((item) => item.id === miss.agentId && item.userId === user.id) : undefined;
      if (!miss || !agent) throw new Error("That question is not in this workspace.");
      const plan = getPlan(user.plan);
      const used = db.agents
        .filter((item) => item.userId === user.id)
        .reduce((sum, item) => sum + item.sources.reduce((inner, entry) => inner + entry.body.length, 0), 0);
      if (used + text.length > plan.characters) {
        throw new Error(`${plan.name} is at its training character limit.`);
      }
      agent.sources.push({
        id: createId("src"),
        title: (miss.closestTitle || "Added after a miss").slice(0, 120),
        kind: "note",
        body: text.slice(0, 20000),
        createdAt: new Date().toISOString(),
      });
      db.misses = db.misses.filter((item) => item.id !== id);
      return { ok: true };
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save that answer.";
    const status = message === "That question is not in this workspace." ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
