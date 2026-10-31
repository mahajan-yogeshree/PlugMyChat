import type { PlanId } from "./types";

export type Plan = {
  id: PlanId;
  name: string;
  monthly: number;
  yearly: number;
  trialDays: number;
  credits: number;
  conversations: number;
  characters: number;
  agents: number;
  mcpCalls: number;
  autoTrain: string;
  notifications: string;
  removeBranding: boolean;
  customDomain: boolean;
  ownKey: boolean;
  actions: boolean;
  guardrails: boolean;
  api: boolean;
  messaging: boolean;
};

export const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    monthly: 9,
    yearly: 90,
    trialDays: 0,
    credits: 250,
    conversations: 50,
    characters: 2_000_000,
    agents: 1,
    mcpCalls: 0,
    autoTrain: "Monthly",
    notifications: "Email",
    removeBranding: false,
    customDomain: false,
    ownKey: false,
    actions: false,
    guardrails: false,
    api: false,
    messaging: false,
  },
  {
    id: "hobby",
    name: "Hobby",
    monthly: 19,
    yearly: 190,
    trialDays: 7,
    credits: 1_000,
    conversations: 200,
    characters: 10_000_000,
    agents: 3,
    mcpCalls: 250,
    autoTrain: "Daily",
    notifications: "Email and webhooks",
    removeBranding: false,
    customDomain: false,
    ownKey: false,
    actions: true,
    guardrails: false,
    api: false,
    messaging: true,
  },
  {
    id: "standard",
    name: "Standard",
    monthly: 99,
    yearly: 990,
    trialDays: 7,
    credits: 10_000,
    conversations: 2_000,
    characters: 20_000_000,
    agents: 5,
    mcpCalls: 1_250,
    autoTrain: "Daily",
    notifications: "Email and webhooks",
    removeBranding: true,
    customDomain: false,
    ownKey: false,
    actions: true,
    guardrails: true,
    api: true,
    messaging: true,
  },
  {
    id: "business",
    name: "Business",
    monthly: 399,
    yearly: 3990,
    trialDays: 7,
    credits: 40_000,
    conversations: 8_000,
    characters: 50_000_000,
    agents: 20,
    mcpCalls: 5_000,
    autoTrain: "Daily",
    notifications: "Email and webhooks",
    removeBranding: true,
    customDomain: true,
    ownKey: true,
    actions: true,
    guardrails: true,
    api: true,
    messaging: true,
  },
];

export function getPlan(id: PlanId) {
  return plans.find((plan) => plan.id === id) ?? plans[0];
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}
