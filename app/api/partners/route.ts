import { NextResponse } from "next/server";

import { createId, updateDatabase } from "@/lib/store";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    agency?: string;
    website?: string;
    clients?: string;
    sellsRetainers?: string;
  } | null;
  const agency = body?.agency?.trim() ?? "";
  const website = body?.website?.trim() ?? "";
  if (agency.length < 2 || website.length < 4) {
    return NextResponse.json({ error: "Add the agency name and website." }, { status: 400 });
  }
  const partner = await updateDatabase((db) => {
    const created = {
      id: createId("ptr"),
      agency,
      website,
      clients: body?.clients?.trim() || "Not specified",
      sellsRetainers: body?.sellsRetainers === "yes" ? "Yes" : body?.sellsRetainers === "no" ? "No" : "Not specified",
      createdAt: new Date().toISOString(),
    };
    db.partners.push(created);
    return created;
  });
  return NextResponse.json({ partner });
}
