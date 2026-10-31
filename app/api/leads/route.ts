import { NextResponse } from "next/server";

import { currentUser } from "@/lib/session";
import { updateDatabase } from "@/lib/store";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const leads = await updateDatabase((db) => {
    const ids = new Set(db.agents.filter((agent) => agent.userId === user.id).map((agent) => agent.id));
    return db.leads
      .filter((lead) => ids.has(lead.agentId))
      .map((lead) => ({
        ...lead,
        agentName: db.agents.find((agent) => agent.id === lead.agentId)?.name ?? "Agent",
      }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  });
  return NextResponse.json({ leads });
}
