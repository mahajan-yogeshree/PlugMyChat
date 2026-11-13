import { MISS_LINE, composeAnswer, rankSources } from "./answer";
import { MODEL_UNAVAILABLE, rephraseGrounded } from "./model";

export async function answerFromSources(
  question: string,
  sources: { title: string; body: string; origin?: string }[],
  pageUrl = "",
) {
  const ranked = rankSources(question, sources, pageUrl);
  const draft = composeAnswer(question, ranked);
  if (draft.missed) return draft;
  const strong = ranked.filter((chunk) => chunk.strong).slice(0, 3);
  const modeled = await rephraseGrounded(question, strong);
  if (modeled.status === "answer") {
    return {
      content: modeled.content,
      citations: [modeled.title],
      missed: false,
      closestTitle: modeled.title,
      closestText: draft.closestText,
    };
  }
  if (modeled.status === "miss") {
    return {
      content: MISS_LINE,
      citations: [] as string[],
      missed: true,
      closestTitle: draft.closestTitle,
      closestText: draft.closestText,
    };
  }
  return {
    ...draft,
    content: `${MODEL_UNAVAILABLE}\n\n${draft.content}`,
  };
}
