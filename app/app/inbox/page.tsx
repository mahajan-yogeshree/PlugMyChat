"use client";

import { useEffect, useState } from "react";

type Message = { role: string; content: string; pageUrl?: string };
type Conversation = {
  id: string;
  agentName: string;
  visitor: string;
  createdAt: string;
  messages: Message[];
};

export default function InboxPage() {
  const [items, setItems] = useState<Conversation[] | null>(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/conversations").then(async (response) => {
      const body = await response.json();
      if (!response.ok) {
        setError(body.error || "Could not load conversations.");
        return;
      }
      setItems(body.conversations);
    });
  }, []);

  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!items) return <p className="text-sm text-muted-foreground">Loading inbox…</p>;
  if (items.length === 0) return (
    <div>
      <h1 className="text-2xl font-semibold">Inbox</h1>
      <p className="mt-3 text-sm text-muted-foreground">No conversations yet. Send a message from the homepage demo or an agent test tab.</p>
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold">Inbox</h1>
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item.id} className="rounded-2xl border bg-card">
            <button type="button" className="w-full px-4 py-3 text-left" onClick={() => setOpen(open === item.id ? null : item.id)}>
              <span className="font-medium">{item.agentName}</span>
              <span className="ml-2 text-sm text-muted-foreground">{item.messages.length} messages</span>
            </button>
            {open === item.id ? (
              <div className="space-y-2 border-t px-4 py-3 text-sm">
                {item.messages.map((message, index) => (
                  <p key={index} className="whitespace-pre-wrap">
                    <span className="font-medium">{message.role === "user" ? "Visitor" : "Agent"}: </span>
                    {message.content}
                    {message.role === "user" && message.pageUrl ? <span className="mt-1 block text-muted-foreground">{message.pageUrl}</span> : null}
                  </p>
                ))}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
