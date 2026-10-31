import { NextResponse } from "next/server";

import { currentUser } from "@/lib/session";
import { updateDatabase } from "@/lib/store";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string; sourceId: string }> },
) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const { id, sourceId } = await context.params;
  const removed = await updateDatabase((db) => {
    const agent = db.agents.find((item) => item.id === id && item.userId === user.id);
    if (!agent) return false;
    const before = agent.sources.length;
    agent.sources = agent.sources.filter((source) => source.id !== sourceId);
    return agent.sources.length !== before;
  });
  if (!removed) return NextResponse.json({ error: "Source not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
