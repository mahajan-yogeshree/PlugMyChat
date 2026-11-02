import { NextResponse } from "next/server";

import { cleanPageUrl, composeAnswer, extractEmail, rankSources } from "@/lib/answer";
import { getPlan } from "@/lib/plans";
import { createId, updateDatabase } from "@/lib/store";
import type { Conversation } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    agentId?: string;
    conversationId?: string;
    message?: string;
    visitor?: string;
    pageUrl?: string;
  } | null;
  const message = body?.message?.trim() ?? "";
  if (!body?.agentId || message.length < 1 || message.length > 2000) {
    return NextResponse.json({ error: "Send a message to an agent." }, { status: 400 });
  }
  try {
    const result = await updateDatabase((db) => {
      const agent = db.agents.find((item) => item.id === body.agentId);
      if (!agent) throw new Error("This agent is not available.");
      const owner = db.users.find((item) => item.id === agent.userId);
      const plan = getPlan(owner?.plan ?? "starter");
      const month = new Date().toISOString().slice(0, 7);
      const ids = new Set(
        db.agents.filter((item) => item.userId === agent.userId).map((item) => item.id),
      );
      const used = db.conversations
        .filter((conversation) => ids.has(conversation.agentId))
        .flatMap((conversation) => conversation.messages)
        .filter((item) => item.role === "assistant" && item.createdAt.slice(0, 7) === month)
        .length;
      if (used >= plan.credits) {
        throw new Error("This workspace has used its message credits for the month.");
      }
      let conversation = db.conversations.find(
        (item) => item.id === body.conversationId && item.agentId === agent.id,
      );
      if (!conversation) {
        conversation = {
          id: createId("cnv"),
          agentId: agent.id,
          visitor: body.visitor?.slice(0, 80) || "Visitor",
          messages: [],
          createdAt: new Date().toISOString(),
        } satisfies Conversation;
        db.conversations.push(conversation);
      }
      const now = new Date().toISOString();
      const pageUrl = cleanPageUrl(body.pageUrl);
      conversation.messages.push({
        id: createId("msg"),
        role: "user",
        content: message,
        citations: [],
        pageUrl,
        createdAt: now,
      });
      const email = extractEmail(message);
      let leadSaved = false;
      if (email && agent.collectLeads) {
        const exists = db.leads.some(
          (lead) => lead.agentId === agent.id && lead.email.toLowerCase() === email.toLowerCase(),
        );
        if (!exists) {
          db.leads.push({
            id: createId("led"),
            agentId: agent.id,
            email,
            name: conversation.visitor,
            note: message.slice(0, 280),
            createdAt: now,
          });
          leadSaved = true;
        }
      }
      const ranked = rankSources(message, agent.sources);
      const answer = composeAnswer(message, ranked);
      if (answer.missed) {
        const duplicate = db.misses.some(
          (miss) => miss.agentId === agent.id && miss.question === message && miss.pageUrl === pageUrl,
        );
        if (!duplicate) {
          db.misses.push({
            id: createId("mis"),
            agentId: agent.id,
            question: message.slice(0, 500),
            pageUrl,
            closestTitle: answer.closestTitle,
            closestText: answer.closestText.slice(0, 400),
            createdAt: now,
          });
          db.misses = db.misses.slice(-200);
        }
      }
      if (leadSaved) {
        answer.content = `Saved ${email}. ${answer.content}`;
      }
      const reply = {
        id: createId("msg"),
        role: "assistant" as const,
        content: answer.content,
        citations: answer.citations,
        pageUrl: "",
        createdAt: new Date().toISOString(),
      };
      conversation.messages.push(reply);
      return {
        conversationId: conversation.id,
        message: reply,
        leadSaved,
      };
    });
    return NextResponse.json(result);
  } catch (error) {
    const messageText = error instanceof Error ? error.message : "The agent could not answer.";
    const status = messageText === "This agent is not available." ? 404 : 400;
    return NextResponse.json({ error: messageText }, { status });
  }
}
