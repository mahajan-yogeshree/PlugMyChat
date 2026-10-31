import { NextResponse } from "next/server";

import { signIn } from "@/lib/session";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    email?: string;
    password?: string;
  } | null;
  try {
    const user = await signIn(body?.email ?? "", body?.password ?? "");
    return NextResponse.json({ user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not sign in.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
