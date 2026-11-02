import { NextResponse } from "next/server";

import { getPlan } from "@/lib/plans";
import { updateDatabase } from "@/lib/store";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const agent = await updateDatabase((db) => {
    const record = db.agents.find((item) => item.id === id);
    if (!record) return null;
    const owner = db.users.find((item) => item.id === record.userId);
    const plan = getPlan(owner?.plan ?? "starter");
    return {
      id: record.id,
      name: record.name,
      welcome: record.welcome,
      accent: record.accent,
      launcherLabel: record.launcherLabel || "Chat",
      showBadge: !plan.removeBranding,
    };
  });
  if (!agent) return NextResponse.json({ error: "Agent not found." }, { status: 404 });
  return NextResponse.json({ agent });
}
