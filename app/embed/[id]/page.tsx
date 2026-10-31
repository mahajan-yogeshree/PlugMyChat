import { ChatPanel } from "@/components/chat-panel";

export default async function EmbedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main className="h-screen bg-background">
      <ChatPanel agentId={id} className="h-screen max-h-none rounded-none border-0 shadow-none" />
    </main>
  );
}
