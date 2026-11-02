export const TRIAL_STORAGE_KEY = "plugmychat-trial";
export const TRIAL_PAGE_LIMIT = 5;

export type TrialPage = { title: string; text: string; url: string };

export type TrialDraft = {
  pages: TrialPage[];
  name: string;
  welcome: string;
  accent: string;
  launcherLabel: string;
  saveAfterSignIn: boolean;
};

function isPage(value: unknown): value is TrialPage {
  if (!value || typeof value !== "object") return false;
  const page = value as TrialPage;
  return typeof page.url === "string" && typeof page.text === "string" && typeof page.title === "string";
}

export function readTrial(): TrialDraft | null {
  if (typeof sessionStorage === "undefined") return null;
  const raw = sessionStorage.getItem(TRIAL_STORAGE_KEY);
  if (!raw) return null;
  try {
    const saved = JSON.parse(raw) as Partial<TrialDraft> & Partial<TrialPage>;
    const pages = Array.isArray(saved.pages)
      ? saved.pages.filter(isPage)
      : saved.url && saved.text
        ? [{ title: saved.title || "This page", text: saved.text, url: saved.url }]
        : [];
    if (pages.length === 0) return null;
    return {
      pages: pages.slice(0, TRIAL_PAGE_LIMIT),
      name: saved.name || "Site guide",
      welcome: saved.welcome || "Ask about these pages. I only answer from what they say.",
      accent: saved.accent || "#1f7a4d",
      launcherLabel: saved.launcherLabel || "Chat",
      saveAfterSignIn: Boolean(saved.saveAfterSignIn),
    };
  } catch {
    sessionStorage.removeItem(TRIAL_STORAGE_KEY);
    return null;
  }
}

export function writeTrial(draft: TrialDraft) {
  sessionStorage.setItem(TRIAL_STORAGE_KEY, JSON.stringify(draft));
}

export function clearTrial() {
  sessionStorage.removeItem(TRIAL_STORAGE_KEY);
}

export async function saveTrialAgent(draft: TrialDraft): Promise<
  | { status: "saved"; agentId: string }
  | { status: "unsigned" }
  | { status: "error"; error: string; agentId?: string }
> {
  const me = await fetch("/api/me");
  if (me.status === 401) return { status: "unsigned" };
  const created = await fetch("/api/agents", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: draft.name,
      welcome: draft.welcome,
      accent: draft.accent,
      launcherLabel: draft.launcherLabel,
    }),
  });
  const agentBody = await created.json().catch(() => ({}));
  if (!created.ok) {
    return { status: "error", error: agentBody.error || "Could not save the agent." };
  }
  const agentId = String(agentBody.agent?.id || "");
  if (!agentId) return { status: "error", error: "Could not save the agent." };
  const failed: string[] = [];
  for (const page of draft.pages) {
    const source = await fetch(`/api/agents/${agentId}/sources`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind: "url", title: page.title, url: page.url }),
    });
    if (!source.ok) {
      const sourceBody = await source.json().catch(() => ({}));
      failed.push(sourceBody.error ? `${page.title} (${sourceBody.error})` : page.title);
    }
  }
  clearTrial();
  if (failed.length > 0) {
    return {
      status: "error",
      agentId,
      error: `The agent was saved. These pages were not stored: ${failed.join(", ")}.`,
    };
  }
  return { status: "saved", agentId };
}
