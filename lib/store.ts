import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import type { Agent, Database, User } from "./types";

const directory = path.join(process.cwd(), "data");
const filePath = path.join(directory, "store.json");

const DEMO_USER = "usr_demo";
const DEMO_AGENT = "agt_northwind";

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const actual = scryptSync(password, salt, 32);
  const expected = Buffer.from(hash, "hex");
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

export function createId(prefix: string) {
  return `${prefix}_${randomBytes(8).toString("hex")}`;
}

function seed(): Database {
  const now = new Date().toISOString();
  const user: User = {
    id: DEMO_USER,
    email: "demo@northwind.example",
    name: "Northwind",
    passwordHash: hashPassword("harbor-demo"),
    plan: "standard",
    createdAt: now,
  };
  const agent: Agent = {
    id: DEMO_AGENT,
    userId: user.id,
    name: "Northwind Desk",
    welcome: "Ask about shipping, returns, or a product. I answer from Northwind's notes.",
    accent: "#4f46e5",
    instructions: "Be brief. If the notes do not contain the answer, say so and offer to take an email.",
    collectLeads: true,
    createdAt: now,
    sources: [
      {
        id: "src_returns",
        title: "Returns policy",
        kind: "text",
        body: "Sale items can be returned within 30 days if they are unworn and have the tag. Start a return from the order page or ask the agent for a return label. Refunds go back to the original payment method in 5 business days after the warehouse scans the parcel.",
        createdAt: now,
      },
      {
        id: "src_shipping",
        title: "Shipping",
        kind: "text",
        body: "Orders placed before 2pm ship the same weekday. Order 4471 shipped this morning with UPS and should arrive Thursday. Standard delivery is 3 to 5 business days. Express is 1 to 2 business days.",
        createdAt: now,
      },
      {
        id: "src_install",
        title: "Bracket install notes",
        kind: "text",
        body: "To mount bracket B-14, line up the two top screws first. The install video shows that step at 2:14. Lead time is 6 business days when the bracket is in stock. Do not overtighten the lower bolt.",
        createdAt: now,
      },
      {
        id: "src_demo",
        title: "Demos and contact",
        kind: "text",
        body: "A product demo for a team takes 25 minutes. Ask for the best email and the number of seats. Northwind replies the same business day.",
        createdAt: now,
      },
    ],
  };
  return {
    users: [user],
    sessions: [],
    agents: [agent],
    conversations: [],
    leads: [],
    partners: [],
  };
}

async function readDatabase(): Promise<Database> {
  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as Database;
    if (!parsed.users || !parsed.agents) return seed();
    return parsed;
  } catch {
    return seed();
  }
}

async function writeDatabase(db: Database) {
  await mkdir(directory, { recursive: true });
  const temporary = `${filePath}.${process.pid}.tmp`;
  await writeFile(temporary, JSON.stringify(db, null, 2));
  await rename(temporary, filePath);
}

let queue: Promise<unknown> = Promise.resolve();

export function updateDatabase<T>(mutate: (db: Database) => T | Promise<T>) {
  const run = queue.then(async () => {
    const db = await readDatabase();
    const result = await mutate(db);
    await writeDatabase(db);
    return result;
  });
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export function readOnly<T>(read: (db: Database) => T | Promise<T>) {
  return updateDatabase(async (db) => read(db));
}

export { hashPassword, DEMO_AGENT, DEMO_USER };
