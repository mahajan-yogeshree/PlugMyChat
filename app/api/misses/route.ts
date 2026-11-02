import { NextResponse } from "next/server";

import { currentUser } from "@/lib/session";
import { updateDatabase } from "@/lib/store";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const misses = await updateDatabase((db) => {
    const names = new Map(db.agents.filter((agent) => agent.userId === user.id).map((agent) => [agent.id, agent.name]));
    return db.misses
      .filter((miss) => names.has(miss.agentId))
      .map((miss) => ({ ...miss, agentName: names.get(miss.agentId) ?? "Agent" }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  });
  return NextResponse.json({ misses });
}
