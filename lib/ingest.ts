const BLOCKED = /^(localhost|0\.0\.0\.0|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[0-1])\.)/i;

export function assertPublicHttpUrl(raw: string) {
  const url = new URL(raw);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Use an http or https link.");
  }
  if (BLOCKED.test(url.hostname) || url.hostname.endsWith(".local")) {
    throw new Error("That address is not a public page.");
  }
  return url;
}

export async function readPublicPage(raw: string) {
  const url = assertPublicHttpUrl(raw);
  if (/(^|\.)youtube\.com$|(^|\.)youtu\.be$/i.test(url.hostname)) {
    return {
      title: "YouTube link",
      body: `A video was saved (${url.toString()}). Paste the transcript into a text source if you want answers from it. This rebuild does not download videos.`,
    };
  }
  const response = await fetch(url, {
    redirect: "manual",
    signal: AbortSignal.timeout(8000),
    headers: { "user-agent": "PlugMyChat/1.0" },
  });
  if (response.status >= 300 && response.status < 400) {
    throw new Error("Redirects are not followed.");
  }
  if (!response.ok) {
    throw new Error(`The page returned ${response.status}.`);
  }
  const html = await response.text();
  const title =
    html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim() || url.hostname;
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 20000);
  if (text.length < 40) {
    throw new Error("That page did not include enough readable text.");
  }
  return { title, body: text };
}
