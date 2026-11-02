const BLOCKED = /^(localhost|0\.0\.0\.0|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[0-1])\.)/i;
const SKIP_FILE = /\.(pdf|zip|png|jpe?g|gif|webp|svg|mp4|mp3|css|js|xml|ico|woff2?|gz)($|\?)/i;
const PAGE_CAP = 24;
const TIME_BUDGET_MS = 20000;

export type SitePage = { title: string; body: string; url: string };

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

function sameSite(left: string, right: string) {
  return left.replace(/^www\./i, "").toLowerCase() === right.replace(/^www\./i, "").toLowerCase();
}

function decode(value: string) {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export function isSiteHome(url: URL) {
  const path = url.pathname.replace(/\/index\.html?$/i, "").replace(/\/+$/, "");
  return path === "";
}

export function pageText(html: string) {
  const withoutNoise = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<form[\s\S]*?<\/form>/gi, " ");
  const main =
    withoutNoise.match(/<main\b[\s\S]*?<\/main>/i)?.[0] ||
    withoutNoise.match(/<article\b[\s\S]*?<\/article>/i)?.[0] ||
    withoutNoise.replace(/<header\b[\s\S]*?<\/header>/gi, " ");
  return decode(
    main
      .replace(/<(br|\/p|\/div|\/li|\/h[1-6]|\/tr|\/section|\/article)\b[^>]*>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/[ \t]+\n/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{2,}/g, "\n")
    .trim()
    .slice(0, 20000);
}

function plain(value: string) {
  return decode(value.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

function pageTitle(html: string, url: URL) {
  const docTitle = plain(html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] || "");
  if (isSiteHome(url)) return (docTitle || url.hostname).slice(0, 120);
  const scope = html
    .replace(/<aside\b[\s\S]*?<\/aside>/gi, " ")
    .replace(/<nav\b[\s\S]*?<\/nav>/gi, " ")
    .replace(/<footer\b[\s\S]*?<\/footer>/gi, " ")
    .replace(/<[^>]+class=["'][^"']*\bsidebar\b[^"']*["'][^>]*>[\s\S]*?<\/(?:div|section|aside)>/gi, " ");
  const headings = [...scope.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi)]
    .map((match) => plain(match[1]))
    .filter((text) => text.length > 1 && text.length < 120);
  const specific = headings.find((text) => text.toLowerCase() !== docTitle.toLowerCase());
  return (specific || docTitle || url.hostname).slice(0, 120);
}

function withDistinctTitles(pages: SitePage[]) {
  const counts = new Map<string, number>();
  for (const page of pages) counts.set(page.title, (counts.get(page.title) ?? 0) + 1);
  return pages.map((page) => {
    if ((counts.get(page.title) ?? 0) < 2) return page;
    const segment = new URL(page.url).pathname.split("/").filter(Boolean).pop() || "home";
    const label = decodeURIComponent(segment).replace(/[-_]+/g, " ");
    if (page.title.toLowerCase().includes(label.toLowerCase())) return page;
    return { ...page, title: `${label} (${page.title})`.slice(0, 120) };
  });
}

function pageKey(url: URL) {
  const path = url.pathname.replace(/\/+$/, "") || "/";
  return `${url.hostname.replace(/^www\./i, "").toLowerCase()}${path}${url.search}`;
}

function collectLinks(html: string, base: URL) {
  const found: string[] = [];
  const seen = new Set<string>();
  for (const match of html.matchAll(/href\s*=\s*["']([^"']+)["']/gi)) {
    const href = match[1].trim();
    if (!href || href.startsWith("#") || /^(mailto:|tel:|javascript:)/i.test(href)) continue;
    let next: URL;
    try {
      next = new URL(href, base);
    } catch {
      continue;
    }
    if (next.protocol !== "http:" && next.protocol !== "https:") continue;
    if (!sameSite(next.hostname, base.hostname)) continue;
    if (SKIP_FILE.test(next.pathname)) continue;
    next.hash = "";
    const key = pageKey(next);
    if (seen.has(key)) continue;
    seen.add(key);
    found.push(next.toString());
  }
  return found;
}

function robotRules(text: string) {
  const groups: { agents: string[]; disallow: string[] }[] = [];
  let current: { agents: string[]; disallow: string[] } | null = null;
  for (const raw of text.split(/\n/)) {
    const line = raw.split("#")[0].trim();
    if (!line) continue;
    const agent = line.match(/^user-agent:\s*(.+)$/i);
    if (agent) {
      const name = agent[1].trim().toLowerCase();
      if (!current || current.disallow.length > 0) {
        current = { agents: [name], disallow: [] };
        groups.push(current);
      } else {
        current.agents.push(name);
      }
      continue;
    }
    const disallow = line.match(/^disallow:\s*(.*)$/i);
    if (disallow && current) current.disallow.push(disallow[1].trim());
  }
  const named = groups.find((group) => group.agents.includes("plugmychat"));
  const star = groups.find((group) => group.agents.includes("*"));
  return (named || star)?.disallow.filter(Boolean) ?? [];
}

function allowed(rules: string[], path: string) {
  return !rules.some((rule) => {
    if (rule === "/") return true;
    return path === rule || path.startsWith(rule.endsWith("/") ? rule : `${rule}/`);
  });
}

async function fetchPublic(raw: string) {
  let current = assertPublicHttpUrl(raw);
  for (let hop = 0; hop < 4; hop += 1) {
    const response = await fetch(current, {
      redirect: "manual",
      signal: AbortSignal.timeout(8000),
      headers: {
        "user-agent": "PlugMyChat/1.0",
        accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.1",
      },
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) throw new Error("The page redirected without a destination.");
      current = assertPublicHttpUrl(new URL(location, current).toString());
      continue;
    }
    if (!response.ok) throw new Error(`The page returned ${response.status}.`);
    const type = response.headers.get("content-type") || "";
    if (type && !/text\/html|text\/plain|application\/xhtml/i.test(type)) {
      throw new Error("That URL is not an HTML page.");
    }
    const html = await response.text();
    return { url: current, html };
  }
  throw new Error("The page redirected too many times.");
}

function stripBoilerplate(pages: SitePage[]) {
  if (pages.length < 4) return pages;
  const counts = new Map<string, number>();
  const lines = pages.map((page) =>
    page.body
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 40),
  );
  for (const group of lines) {
    for (const line of new Set(group)) counts.set(line, (counts.get(line) ?? 0) + 1);
  }
  const repeated = new Set(
    [...counts].filter(([, count]) => count >= Math.ceil(pages.length * 0.6)).map(([line]) => line),
  );
  if (repeated.size === 0) return pages;
  return pages.map((page, index) => {
    const kept = lines[index].filter((line) => !repeated.has(line));
    return kept.length > 0 ? { ...page, body: kept.join("\n").slice(0, 20000) } : page;
  });
}

export async function readPublicPage(raw: string) {
  const url = assertPublicHttpUrl(raw);
  if (/(^|\.)youtube\.com$|(^|\.)youtu\.be$/i.test(url.hostname)) {
    return {
      title: "YouTube link",
      body: `A video was saved (${url.toString()}). Paste the transcript into a text source if you want answers from it. This rebuild does not download videos.`,
      url: url.toString(),
    };
  }
  const fetched = await fetchPublic(url.toString());
  const body = pageText(fetched.html);
  if (body.length < 40) throw new Error("That page did not include enough readable text.");
  return { title: pageTitle(fetched.html, fetched.url), body, url: fetched.url.toString() };
}

export async function readSite(raw: string) {
  const requested = assertPublicHttpUrl(raw);
  if (/(^|\.)youtube\.com$|(^|\.)youtu\.be$/i.test(requested.hostname)) {
    const page = await readPublicPage(raw);
    return { pages: [page], crawled: false };
  }
  const home = await fetchPublic(requested.toString());
  const first: SitePage = {
    title: pageTitle(home.html, home.url),
    body: pageText(home.html),
    url: home.url.toString(),
  };
  if (first.body.length < 40) throw new Error("That page did not include enough readable text.");
  const homeRequest = isSiteHome(requested) || isSiteHome(home.url);
  if (!homeRequest) return { pages: withDistinctTitles([first]), crawled: false };

  let rules: string[] = [];
  try {
    const robots = await fetch(new URL("/robots.txt", home.url), {
      redirect: "manual",
      signal: AbortSignal.timeout(4000),
      headers: { "user-agent": "PlugMyChat/1.0" },
    });
    if (robots.ok) rules = robotRules(await robots.text());
  } catch {
    rules = [];
  }

  const seen = new Set<string>([pageKey(home.url)]);
  const queue = collectLinks(home.html, home.url).filter((link) => allowed(rules, new URL(link).pathname));
  const pages = [first];
  const deadline = Date.now() + TIME_BUDGET_MS;
  let cursor = 0;
  while (cursor < queue.length && pages.length < PAGE_CAP && Date.now() < deadline) {
    const batch = queue.slice(cursor, cursor + 4);
    cursor += batch.length;
    await Promise.all(
      batch.map(async (link) => {
        if (pages.length >= PAGE_CAP) return;
        const pending = new URL(link);
        const key = pageKey(pending);
        if (seen.has(key)) return;
        seen.add(key);
        try {
          const fetched = await fetchPublic(link);
          if (!sameSite(fetched.url.hostname, home.url.hostname)) return;
          const landed = pageKey(fetched.url);
          if (seen.has(landed) && landed !== key) return;
          seen.add(landed);
          const body = pageText(fetched.html);
          if (body.length < 40) return;
          if (pages.length >= PAGE_CAP) return;
          pages.push({
            title: pageTitle(fetched.html, fetched.url),
            body,
            url: fetched.url.toString(),
          });
          for (const more of collectLinks(fetched.html, fetched.url)) {
            const moreKey = pageKey(new URL(more));
            if (seen.has(moreKey) || queue.includes(more)) continue;
            if (!allowed(rules, new URL(more).pathname)) continue;
            queue.push(more);
          }
        } catch {
          return;
        }
      }),
    );
  }
  return { pages: withDistinctTitles(stripBoilerplate(pages)), crawled: true };
}
