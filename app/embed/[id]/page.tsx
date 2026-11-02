import { ChatPanel } from "@/components/chat-panel";

export default async function EmbedPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  return (
    <main className="h-screen bg-background">
      <ChatPanel
        agentId={id}
        pageUrl={query.page || ""}
        className="h-screen max-h-none rounded-none border-0 shadow-none"
      />
    </main>
  );
}
