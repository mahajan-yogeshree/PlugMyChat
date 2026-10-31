import { cookies } from "next/headers";

import { getPlan } from "./plans";
import { createId, readOnly, verifyPassword, hashPassword } from "./store";
import type { Database, PlanId, User } from "./types";

const COOKIE = "cwt_session";

export async function currentUser() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  return readOnly((db) => {
    const session = db.sessions.find((item) => item.token === token);
    if (!session) return null;
    return db.users.find((user) => user.id === session.userId) ?? null;
  });
}

export async function setSession(userId: string) {
  const token = createId("ses");
  await readOnly((db) => {
    db.sessions.push({ token, userId, createdAt: new Date().toISOString() });
    return token;
  });
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) {
    await readOnly((db) => {
      db.sessions = db.sessions.filter((session) => session.token !== token);
    });
  }
  jar.delete(COOKIE);
}

export async function signIn(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new Error("Enter a valid email.");
  }
  if (password.length < 8) {
    throw new Error("Use at least 8 characters.");
  }
  const user = await readOnly((db) => {
    const existing = db.users.find((item) => item.email === normalized);
    if (existing) {
      if (!verifyPassword(password, existing.passwordHash)) {
        throw new Error("That password does not match this email.");
      }
      return existing;
    }
    const created: User = {
      id: createId("usr"),
      email: normalized,
      name: normalized.split("@")[0] || "Workspace",
      passwordHash: hashPassword(password),
      plan: "hobby",
      createdAt: new Date().toISOString(),
    };
    db.users.push(created);
    return created;
  });
  await setSession(user.id);
  return publicUser(user);
}

export function publicUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    plan: user.plan,
    createdAt: user.createdAt,
  };
}

export function monthKey(iso: string) {
  return iso.slice(0, 7);
}

export function usageFor(db: Database, userId: string) {
  const user = db.users.find((item) => item.id === userId);
  const plan = getPlan(user?.plan ?? "starter");
  const agents = db.agents.filter((agent) => agent.userId === userId);
  const agentIds = new Set(agents.map((agent) => agent.id));
  const current = new Date().toISOString().slice(0, 7);
  const creditsUsed = db.conversations
    .filter((conversation) => agentIds.has(conversation.agentId))
    .flatMap((conversation) => conversation.messages)
    .filter((message) => message.role === "assistant" && monthKey(message.createdAt) === current)
    .length;
  const characters = agents.reduce(
    (sum, agent) => sum + agent.sources.reduce((inner, source) => inner + source.body.length, 0),
    0,
  );
  return { plan, agents: agents.length, creditsUsed, characters };
}

export function assertPlan(plan: string): PlanId {
  if (plan === "starter" || plan === "hobby" || plan === "standard" || plan === "business") {
    return plan;
  }
  throw new Error("Unknown plan.");
}
