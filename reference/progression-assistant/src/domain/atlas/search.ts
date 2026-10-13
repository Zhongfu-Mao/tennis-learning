import type { KnowledgeCard, PracticeDrill } from "./schema";

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function drillText(drill: PracticeDrill | undefined): string[] {
  if (!drill) return [];

  return [drill.title, drill.instruction, drill.successSignal];
}

function haystack(card: KnowledgeCard): string {
  return [
    card.title,
    card.summary,
    card.encyclopedia,
    ...card.tags,
    card.progressionLens.whyItMatters,
    card.progressionLens.commonFailure,
    card.progressionLens.onCourtCue,
    card.progressionLens.verificationTest,
    ...drillText(card.practice.vrDrill),
    ...drillText(card.practice.realCourtCheck)
  ].join(" ");
}

export function searchCards(cards: KnowledgeCard[], query: string): KnowledgeCard[] {
  const normalized = normalize(query);
  if (!normalized) return cards;

  return cards.filter((card) => normalize(haystack(card)).includes(normalized));
}
