import { knowledgeMap } from "./knowledge";
import { progressionBlocks } from "./mastery";
import type { AppState, BodyStatus, KnowledgeCardProgress, TrainingIntent } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

export function getActiveIntent(state: AppState): TrainingIntent | undefined {
  return state.intents
    .filter((intent) => intent.status === "pending")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
}

export function createTrainingIntent(cue: string, scenario: string): TrainingIntent {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    cue,
    scenario,
    status: "pending"
  };
}

export function getDueKnowledgeCards(state: AppState, limit = 5, now = new Date()) {
  const nowTime = now.getTime();
  return knowledgeMap
    .map((card) => {
      const progress = state.knowledgeProgress[card.id] ?? createInitialProgress(card.id, now);
      return { card, progress };
    })
    .filter(({ progress }) => new Date(progress.dueAt).getTime() <= nowTime)
    .sort((a, b) => new Date(a.progress.dueAt).getTime() - new Date(b.progress.dueAt).getTime())
    .slice(0, limit);
}

export function reviewKnowledgeCard(state: AppState, cardId: string, remembered: boolean, now = new Date()): AppState {
  const current = state.knowledgeProgress[cardId] ?? createInitialProgress(cardId, now);
  const nextInterval = remembered ? Math.max(1, Math.round(current.intervalDays * current.ease)) : 1;
  const nextEase = remembered ? Math.min(3.2, current.ease + 0.15) : Math.max(1.3, current.ease - 0.25);
  const next: KnowledgeCardProgress = {
    ...current,
    lastReviewAt: now.toISOString(),
    dueAt: new Date(now.getTime() + nextInterval * DAY_MS).toISOString(),
    ease: nextEase,
    intervalDays: nextInterval,
    lapses: remembered ? current.lapses : current.lapses + 1,
    correct: remembered ? current.correct + 1 : current.correct,
    consecutiveCorrect: remembered ? current.consecutiveCorrect + 1 : 0,
    attempts: current.attempts + 1
  };

  return {
    ...state,
    knowledgeProgress: {
      ...state.knowledgeProgress,
      [cardId]: next
    }
  };
}

export function getUserProgress(state: AppState) {
  const reviewedCards = Object.values(state.knowledgeProgress).filter((item) => item.attempts > 0);
  const masteredCards = reviewedCards.filter((item) => item.correct >= 2 && item.consecutiveCorrect >= 2);
  const completedIntents = state.intents.filter((intent) => intent.status !== "pending");
  const successfulIntents = completedIntents.filter((intent) => intent.status === "done" || intent.status === "partial");
  const bodyIssues = state.sessions.slice(0, 12).filter((session) => session.bodyStatus !== "normal");
  const completedTests = state.programProgress.completedAcceptanceTests.length;

  return {
    knowledgeMastery: ratio(masteredCards.length, knowledgeMap.length),
    intentCompletion: ratio(successfulIntents.length, completedIntents.length),
    stageProgress: ratio(completedTests, progressionBlocks.length),
    bodyLoad: getBodyLoad(bodyIssues.map((session) => session.bodyStatus)),
    dueCards: getDueKnowledgeCards(state).length,
    activeIntent: getActiveIntent(state)
  };
}

function createInitialProgress(cardId: string, now: Date): KnowledgeCardProgress {
  return {
    cardId,
    dueAt: now.toISOString(),
    ease: 2,
    intervalDays: 1,
    lapses: 0,
    correct: 0,
    consecutiveCorrect: 0,
    attempts: 0
  };
}

function ratio(done: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((done / total) * 100);
}

function getBodyLoad(statuses: BodyStatus[]) {
  if (statuses.length >= 4) return "需要降负荷";
  if (statuses.length >= 2) return "注意恢复";
  return "正常";
}
