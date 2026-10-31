import { AgentStudio } from "@/components/agent-studio";

export default async function AgentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AgentStudio agentId={id} />;
}
