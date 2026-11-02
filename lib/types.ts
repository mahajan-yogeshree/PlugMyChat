export type PlanId = "starter" | "hobby" | "standard" | "business";

export type SourceKind = "text" | "url" | "file" | "note";

export type Source = {
  id: string;
  title: string;
  kind: SourceKind;
  body: string;
  origin?: string;
  createdAt: string;
};

export type Agent = {
  id: string;
  userId: string;
  name: string;
  welcome: string;
  accent: string;
  launcherLabel: string;
  instructions: string;
  collectLeads: boolean;
  sources: Source[];
  createdAt: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations: string[];
  pageUrl: string;
  createdAt: string;
};

export type Miss = {
  id: string;
  agentId: string;
  question: string;
  pageUrl: string;
  closestTitle: string;
  closestText: string;
  createdAt: string;
};

export type Conversation = {
  id: string;
  agentId: string;
  visitor: string;
  messages: ChatMessage[];
  createdAt: string;
};

export type Lead = {
  id: string;
  agentId: string;
  email: string;
  name: string;
  note: string;
  createdAt: string;
};

export type PartnerRequest = {
  id: string;
  agency: string;
  website: string;
  clients: string;
  sellsRetainers: string;
  createdAt: string;
};

export type User = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  plan: PlanId;
  createdAt: string;
};

export type Session = {
  token: string;
  userId: string;
  createdAt: string;
};

export type Database = {
  users: User[];
  sessions: Session[];
  agents: Agent[];
  conversations: Conversation[];
  leads: Lead[];
  partners: PartnerRequest[];
  misses: Miss[];
};
