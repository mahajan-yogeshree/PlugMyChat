import { NextResponse } from "next/server";

import { getPlan } from "@/lib/plans";
import { currentUser } from "@/lib/session";
import { createId, updateDatabase } from "@/lib/store";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const agents = await updateDatabase((db) =>
    db.agents.filter((agent) => agent.userId === user.id),
  );
  return NextResponse.json({ agents });
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const body = (await request.json().catch(() => null)) as {
    name?: string;
    welcome?: string;
    accent?: string;
    launcherLabel?: string;
  } | null;
  const name = body?.name?.trim() || "New agent";
  try {
    const agent = await updateDatabase((db) => {
      const owned = db.agents.filter((item) => item.userId === user.id);
      const plan = getPlan(user.plan);
      if (owned.length >= plan.agents) {
        throw new Error(`${plan.name} includes ${plan.agents} agent${plan.agents === 1 ? "" : "s"}.`);
      }
      const created = {
        id: createId("agt"),
        userId: user.id,
        name,
        welcome: body?.welcome?.trim().slice(0, 400) || `Hi, I'm ${name}. Ask me about this business.`,
        accent: /^#[0-9a-fA-F]{6}$/.test(body?.accent ?? "") ? body!.accent! : "#1f7a4d",
        launcherLabel: body?.launcherLabel?.trim().slice(0, 24) || "Chat",
        instructions: "Answer only from the sources. If you are unsure, ask for an email.",
        collectLeads: true,
        sources: [],
        createdAt: new Date().toISOString(),
      };
      db.agents.push(created);
      return created;
    });
    return NextResponse.json({ agent });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create the agent.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
