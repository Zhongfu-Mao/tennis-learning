import { describe, expect, it } from "vitest";
import { defaultAppState } from "../domain/defaults";
import { getUserProgress, reviewKnowledgeCard } from "../domain/progress";

describe("progress mastery", () => {
  it("allows a card to become mastered after a lapse and two consecutive correct reviews", () => {
    const now = new Date("2026-05-13T10:00:00.000Z");
    const missed = reviewKnowledgeCard(defaultAppState, "K01", false, now);
    const firstCorrect = reviewKnowledgeCard(missed, "K01", true, new Date("2026-05-14T10:00:00.000Z"));
    const secondCorrect = reviewKnowledgeCard(firstCorrect, "K01", true, new Date("2026-05-15T10:00:00.000Z"));

    expect(secondCorrect.knowledgeProgress.K01.lapses).toBe(1);
    expect(secondCorrect.knowledgeProgress.K01.consecutiveCorrect).toBe(2);
    expect(getUserProgress(secondCorrect).knowledgeMastery).toBeGreaterThan(0);
  });
});
