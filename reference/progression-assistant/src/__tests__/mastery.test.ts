import { describe, expect, it } from "vitest";
import {
  fatigueRules,
  footworkDrills,
  learningMode,
  matchPlaybooks,
  painPointCompletion,
  progressionBlocks,
  scoreTriggers,
  stageAssessments,
  strengthPhases,
  techniqueAtlas
} from "../domain/mastery";

describe("six pain point mastery system", () => {
  it("marks all six original pain points as complete with proof and a next habit", () => {
    expect(painPointCompletion).toHaveLength(6);
    painPointCompletion.forEach((item) => {
      expect(item.status).toBe("complete");
      expect(item.proof.length).toBeGreaterThanOrEqual(3);
      expect(item.nextHabit.length).toBeGreaterThan(8);
    });
  });

  it("turns broad tennis knowledge into a daily learning and recall system", () => {
    expect(learningMode.dailyCards).toBeGreaterThanOrEqual(5);
    expect(learningMode.reviewCadence.length).toBeGreaterThanOrEqual(4);
    expect(learningMode.quizTypes).toEqual(expect.arrayContaining(["看图说概念", "场上应用填空"]));
    expect(learningMode.masteryRules.length).toBeGreaterThanOrEqual(3);
  });

  it("provides progression planning with stage assessments", () => {
    expect(progressionBlocks).toHaveLength(6);
    expect(stageAssessments).toHaveLength(3);
    progressionBlocks.forEach((block) => {
      expect(block.acceptanceTest).toContain("。");
    });
  });

  it("covers core technique, spacing, mindset, and strength systems", () => {
    expect(techniqueAtlas.map((item) => item.stroke)).toEqual(
      expect.arrayContaining(["正手", "反手", "发球", "接发", "截击", "高压"])
    );
    expect(footworkDrills.length).toBeGreaterThanOrEqual(6);
    expect(matchPlaybooks.map((item) => item.phase)).toEqual(["赛前", "赛中", "赛后"]);
    expect(scoreTriggers.map((item) => item.trigger)).toEqual(expect.arrayContaining(["30-30", "双误后", "机会球"]));
    expect(strengthPhases).toHaveLength(4);
    expect(fatigueRules.map((rule) => rule.bodyStatus)).toEqual(
      expect.arrayContaining(["normal", "sore", "shoulder", "knee", "ankle", "back"])
    );
  });
});
