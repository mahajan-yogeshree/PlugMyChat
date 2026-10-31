import { NextResponse } from "next/server";

import { currentUser, publicUser, usageFor } from "@/lib/session";
import { readOnly } from "@/lib/store";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ user: null }, { status: 401 });
  const usage = await readOnly((db) => usageFor(db, user.id));
  const agents = await readOnly((db) =>
    db.agents
      .filter((agent) => agent.userId === user.id)
      .map((agent) => ({
        id: agent.id,
        name: agent.name,
        sources: agent.sources.length,
        welcome: agent.welcome,
        accent: agent.accent,
      })),
  );
  return NextResponse.json({
    user: publicUser(user),
    usage: {
      plan: usage.plan,
      agents: usage.agents,
      creditsUsed: usage.creditsUsed,
      characters: usage.characters,
    },
    agents,
  });
}
