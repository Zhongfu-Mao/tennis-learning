import { describe, expect, it } from "vitest";
import { createSession, defaultAppState } from "../domain/defaults";
import { getBodyTrend, getMatchJournalSummary } from "../domain/insights";

describe("insights", () => {
  it("summarizes recent body status trends", () => {
    const now = new Date("2026-05-13T10:00:00.000Z");
    const state = {
      ...defaultAppState,
      sessions: [
        createSession({ id: "s1", date: now.toISOString(), bodyStatus: "shoulder" }),
        createSession({ id: "s2", date: "2026-05-12T10:00:00.000Z", bodyStatus: "shoulder" }),
        createSession({ id: "s3", date: "2026-05-11T10:00:00.000Z", bodyStatus: "knee" }),
        createSession({ id: "s4", date: "2026-04-01T10:00:00.000Z", bodyStatus: "ankle" })
      ]
    };

    const trend = getBodyTrend(state, 30, now);

    expect(trend.totalFlagged).toBe(3);
    expect(trend.topStatus?.status).toBe("shoulder");
    expect(trend.items.map((item) => `${item.status}:${item.count}`)).toEqual(["shoulder:2", "knee:1"]);
  });

  it("summarizes match journal pressure patterns", () => {
    const state = {
      ...defaultAppState,
      matchJournals: [
        {
          id: "m1",
          createdAt: "2026-05-13T10:00:00.000Z",
          score: "4-6",
          doubleFaults: 5,
          firstServeEstimate: 45,
          keyPointIssues: ["double_fault", "rush"]
        },
        {
          id: "m2",
          createdAt: "2026-05-12T10:00:00.000Z",
          score: "6-4",
          doubleFaults: 1,
          firstServeEstimate: 65,
          keyPointIssues: ["rush", "net_error"]
        }
      ]
    };

    const summary = getMatchJournalSummary(state);

    expect(summary.matchCount).toBe(2);
    expect(summary.averageDoubleFaults).toBe(3);
    expect(summary.averageFirstServeEstimate).toBe(55);
    expect(summary.topIssue?.issue).toBe("rush");
  });
});
