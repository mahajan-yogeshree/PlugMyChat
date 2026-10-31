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
  showBadge: boolean;
};

type Bubble = { role: "user" | "assistant"; content: string };

export function ChatPanel({
  agentId,
  className = "",
}: {
  agentId: string;
  className?: string;
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
          setMessages([{ role: "assistant", content: body.agent.welcome }]);
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
  }, [agentId]);

  async function send(event: React.FormEvent) {
    event.preventDefault();
    const message = draft.trim();
    if (!message || busy) return;
    setDraft("");
    setBusy(true);
    setError("");
    setMessages((current) => [...current, { role: "user", content: message }]);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ agentId, conversationId, message }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "The agent could not answer.");
      setConversationId(body.conversationId);
      setMessages((current) => [...current, { role: "assistant", content: body.message.content }]);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The agent could not answer.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={cn("flex h-[520px] flex-col overflow-hidden rounded-2xl border bg-card shadow-xl", className)}>
      <div
        className="flex items-center justify-between px-4 py-3 text-primary-foreground"
        style={{ background: agent?.accent || "#4f46e5" }}
      >
        <div>
          <p className="text-sm font-semibold">{agent?.name || "Agent"}</p>
          <p className="text-xs opacity-80">{busy ? "Looking through sources…" : "Usually replies in under a second"}</p>
        </div>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto bg-muted/40 p-4">
        {loading ? <p className="text-sm text-muted-foreground">Opening the agent…</p> : null}
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
              message.role === "user" ? "ml-auto bg-foreground text-background" : "bg-card"
            }`}
          >
            {message.content}
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
          disabled={loading || busy}
        />
        <Button type="submit" disabled={loading || busy || !draft.trim()}>
          Send
        </Button>
      </form>
      {agent?.showBadge ? (
        <p className="border-t px-3 py-2 text-center text-[11px] text-muted-foreground">Powered by chatwith.</p>
      ) : null}
    </div>
  );
}
