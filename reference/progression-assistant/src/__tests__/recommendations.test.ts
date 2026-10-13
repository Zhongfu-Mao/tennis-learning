import { describe, expect, it } from "vitest";
import { createSession } from "../domain/defaults";
import { getRecommendations } from "../domain/recommendations";

describe("getRecommendations", () => {
  it("prioritizes spacing cards when the player reports late contact and being too close", () => {
    const session = createSession({
      mainProblems: ["late_contact", "too_close"],
      strokeFocus: "footwork",
      worstPattern: "被挤到，机会球也打飞"
    });

    const result = getRecommendations([session]);

    expect(result.activeFocus).toBe("spacing_footwork");
    expect(result.cards.map((card) => card.id)).toEqual(
      expect.arrayContaining(["P02", "P03"])
    );
    expect(result.nextIntent).toContain("split");
  });

  it("marks a repeated seven-day problem as active focus", () => {
    const sessions = [0, 2, 4].map((daysAgo) =>
      createSession({
        date: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
        mainProblems: ["serve_inconsistent"],
        strokeFocus: "serve"
      })
    );

    const result = getRecommendations(sessions);

    expect(result.repeatedProblems).toContain("serve_inconsistent");
    expect(result.activeFocus).toBe("technique_principles");
    expect(result.cards[0].id).toBe("P06");
  });
});
