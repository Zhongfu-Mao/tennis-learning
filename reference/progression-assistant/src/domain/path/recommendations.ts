import type { UserState } from "../../app/state";
import type { AtlasContent } from "../atlas/content";
import type { KnowledgeCard } from "../atlas/schema";

const levelRank = {
  "2.7": 0,
  "3.0": 1,
  "3.5": 2,
  "4.0": 3
} as const;

function targetRangeScore(card: KnowledgeCard, state: UserState): number {
  const [start, end] = card.progressionLens.targetLevel.split("-") as [
    keyof typeof levelRank,
    keyof typeof levelRank
  ];
  const current = levelRank[state.profile.currentLevel];
  const target = levelRank[state.profile.targetLevel];
  const startRank = levelRank[start];
  const endRank = levelRank[end];

  if (startRank <= current && endRank <= target) return 0;
  if (startRank <= current + 1 && endRank <= target) return 1;
  if (startRank <= target && endRank <= target) return 2;
  return 3;
}

function stateScore(card: KnowledgeCard, state: UserState): number {
  const cardState = state.cards[card.id];
  const painPointHit = card.painPoints.some((painPoint) => state.profile.focusPainPoints.includes(painPoint)) ? -2 : 0;
  const confusing = cardState?.confusing ? -3 : 0;
  const bookmarked = cardState?.bookmarked ? -1 : 0;
  const mastered = cardState?.mastered ? 100 : 0;
  const reviewed = cardState?.review ? 1 : 0;

  return targetRangeScore(card, state) * 10 + painPointHit + confusing + bookmarked + mastered + reviewed;
}

export function getPathCards(content: AtlasContent, state: UserState): KnowledgeCard[] {
  return [...content.cards].sort((a, b) => {
    const scoreDiff = stateScore(a, state) - stateScore(b, state);
    if (scoreDiff !== 0) return scoreDiff;

    return content.cards.indexOf(a) - content.cards.indexOf(b);
  });
}
