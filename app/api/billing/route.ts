import { NextResponse } from "next/server";

import { assertPlan, currentUser, publicUser } from "@/lib/session";
import { updateDatabase } from "@/lib/store";

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { plan?: string } | null;
  try {
    const plan = assertPlan(body?.plan ?? "");
    const saved = await updateDatabase((db) => {
      const record = db.users.find((item) => item.id === user.id);
      if (!record) throw new Error("Account missing.");
      record.plan = plan;
      return publicUser(record);
    });
    return NextResponse.json({ user: saved });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not change plan.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
