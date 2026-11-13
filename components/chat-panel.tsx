"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "cn";

type PublicAgent = {
  id: string;
  name: string;
  welcome: string;
  accent: string;
  launcherLabel: string;
  showBadge: boolean;
};

type Bubble = { role: "user" | "assistant"; content: string; citations?: string[]; pageUrl?: string };

export function ChatPanel({
  agentId,
  className = "",
  sample = false,
  pageUrl = "",
}: {
  agentId: string;
  className?: string;
  sample?: boolean;
  pageUrl?: string;
}) {
  const [agent, setAgent] = useState<PublicAgent | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Bubble[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/public-agent/${agentId}`)
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Agent unavailable.");
        if (!cancelled) {
          setAgent(body.agent);
          const welcome = { role: "assistant" as const, content: body.agent.welcome };
          setMessages(
            sample
              ? [
                  welcome,
                  { role: "user", content: "Where is order 4471?" },
                  {
                    role: "assistant",
                    content: "Order 4471 shipped this morning with UPS and should arrive Thursday. Orders placed before 2pm ship the same weekday.\n\nFrom Shipping.",
                    citations: ["Shipping"],
                  },
                ]
              : [welcome],
          );
        }
      })
      .catch((reason: Error) => {
        if (!cancelled) setError(reason.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [agentId, sample]);

  async function send(event: React.FormEvent) {
    event.preventDefault();
    const message = draft.trim();
    if (!message || busy) return;
    setDraft("");
    setBusy(true);
    setError("");
    setMessages((current) => [...current, { role: "user", content: message, pageUrl }]);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ agentId, conversationId, message, pageUrl }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "The agent could not answer.");
      setConversationId(body.conversationId);
      setMessages((current) => [
        ...current,
        { role: "assistant", content: body.message.content, citations: body.message.citations || [] },
      ]);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The agent could not answer.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={cn("flex h-[520px] flex-col overflow-hidden rounded-[14px] border bg-card shadow-lift", className)} style={{ borderTop: `4px solid ${agent?.accent || "#1f7a4d"}` }}>
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <p className="text-sm font-medium">{agent?.name || "Agent"}</p>
          <p className="dose text-xs text-muted-foreground">{busy ? "Looking through sources…" : "Usually replies in under a second"}</p>
        </div>
        {agent?.launcherLabel ? <span className="dose text-xs text-muted-foreground">{agent.launcherLabel}</span> : null}
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto bg-muted/40 p-4">
        {loading ? <p className="text-sm text-muted-foreground">Opening the agent…</p> : null}
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`max-w-[85%] break-words px-3 py-2 text-sm whitespace-pre-wrap ${
              message.role === "user" ? "ml-auto bg-ink text-paper" : "border-l border-rule text-ink"
            }`}
          >
            {message.content}
            {message.role === "user" && message.pageUrl ? (
              <span className="mt-1 block break-all text-xs opacity-80">{message.pageUrl}</span>
            ) : null}
            {message.role === "assistant" && message.citations && message.citations.length > 0 ? (
              <span className="mt-2 block text-xs text-signal-deep">Source: {message.citations.join(", ")}</span>
            ) : null}
          </div>
        ))}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
      <form onSubmit={send} className="flex gap-2 border-t p-3">
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ask a question"
          aria-label="Message"
          className="min-w-0"
          disabled={loading || busy}
        />
        <Button type="submit" disabled={loading || busy || !draft.trim()}>
          Send
        </Button>
      </form>
      {agent?.showBadge ? (
        <p className="border-t px-3 py-2 text-center text-[11px] text-muted-foreground">Powered by PlugMyChat</p>
      ) : null}
    </div>
  );
}
