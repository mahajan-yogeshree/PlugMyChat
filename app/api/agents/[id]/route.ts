import { NextResponse } from "next/server";

import { currentUser } from "@/lib/session";
import { updateDatabase } from "@/lib/store";
import type { Agent } from "@/lib/types";

function owned(agent: Agent, userId: string) {
  return agent.userId === userId;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const { id } = await context.params;
  const agent = await updateDatabase((db) =>
    db.agents.find((item) => item.id === id && owned(item, user.id)) ?? null,
  );
  if (!agent) return NextResponse.json({ error: "Agent not found." }, { status: 404 });
  return NextResponse.json({ agent });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as Partial<
    Pick<Agent, "name" | "welcome" | "accent" | "launcherLabel" | "instructions" | "collectLeads">
  > | null;
  const agent = await updateDatabase((db) => {
    const record = db.agents.find((item) => item.id === id && owned(item, user.id));
    if (!record) return null;
    if (typeof body?.name === "string" && body.name.trim()) record.name = body.name.trim();
    if (typeof body?.welcome === "string") record.welcome = body.welcome.slice(0, 400);
    if (typeof body?.accent === "string" && /^#[0-9a-fA-F]{6}$/.test(body.accent)) {
      record.accent = body.accent;
    }
    if (typeof body?.launcherLabel === "string" && body.launcherLabel.trim()) {
      record.launcherLabel = body.launcherLabel.trim().slice(0, 24);
    }
    if (typeof body?.instructions === "string") record.instructions = body.instructions.slice(0, 1000);
    if (typeof body?.collectLeads === "boolean") record.collectLeads = body.collectLeads;
    return record;
  });
  if (!agent) return NextResponse.json({ error: "Agent not found." }, { status: 404 });
  return NextResponse.json({ agent });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const { id } = await context.params;
  const removed = await updateDatabase((db) => {
    const record = db.agents.find((item) => item.id === id && owned(item, user.id));
    if (!record) return false;
    db.agents = db.agents.filter((item) => item.id !== id);
    db.conversations = db.conversations.filter((item) => item.agentId !== id);
    db.misses = db.misses.filter((item) => item.agentId !== id);
    return true;
  });
  if (!removed) return NextResponse.json({ error: "Agent not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
