import { describe, expect, it } from "vitest";
import { createSession } from "../domain/defaults";
import { buildWeeklyPlan, getProgressionRoadmap, knowledgeMap, mentalResetProtocols } from "../domain/roadmap";

describe("V2-V4 roadmap modules", () => {
  it("covers every original pain point across the knowledge map and roadmap", () => {
    const painPoints = new Set([
      "knowledge_breadth",
      "progression_route",
      "technique_principles",
      "spacing_footwork",
      "match_mindset",
      "strength_integration"
    ]);

    const covered = new Set([
      ...knowledgeMap.map((item) => item.category),
      ...getProgressionRoadmap().flatMap((stage) => stage.categories)
    ]);

    painPoints.forEach((category) => {
      expect(covered.has(category)).toBe(true);
    });
  });

  it("expands the knowledge map into a broad visual-card library", () => {
    const requiredChapters = new Set([
      "history_rules",
      "courts_balls",
      "gear_strings",
      "spin_physics",
      "court_zones",
      "levels_training",
      "tactics_language",
      "body_recovery"
    ]);

    expect(knowledgeMap.length).toBeGreaterThanOrEqual(40);
    requiredChapters.forEach((chapter) => {
      expect(knowledgeMap.some((item) => item.chapter === chapter)).toBe(true);
    });
    knowledgeMap.forEach((item) => {
      expect(item.visual).toBeTruthy();
      expect(item.memoryImage).toBeTruthy();
      expect(item.comparison).toBeTruthy();
      expect(item.fieldApplication).toBeTruthy();
      expect(item.recallPrompt).toBeTruthy();
    });
  });

  it("builds a periodized week that balances tennis and strength training", () => {
    const plan = buildWeeklyPlan(
      {
        currentLevel: "2.7",
        targetLevels: ["3.5", "4.0"],
        weeklyTennisSessions: 2,
        weeklyStrengthSessions: 2,
        schoolContext: "日本网球学校 + 自主练习",
        commonProblems: ["too_close", "serve_inconsistent"]
      },
      [
        createSession({
          sessionType: "match",
          mainProblems: ["too_close", "opportunity_error"],
          matchPressure: "high",
          bodyStatus: "normal"
        })
      ]
    );

    expect(plan.days).toHaveLength(7);
    expect(plan.days.some((day) => day.kind === "strength")).toBe(true);
    expect(plan.days.some((day) => day.kind === "tennis")).toBe(true);
    expect(plan.focus).toContain("空间");
  });

  it("provides concrete reset protocols for double faults and opportunity balls", () => {
    expect(mentalResetProtocols.map((protocol) => protocol.trigger)).toEqual(
      expect.arrayContaining(["double_fault", "opportunity_ball"])
    );
    mentalResetProtocols.forEach((protocol) => {
      expect(protocol.steps.length).toBeGreaterThanOrEqual(3);
    });
  });
});
