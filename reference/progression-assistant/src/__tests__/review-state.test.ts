import { afterEach, beforeEach, vi } from "vitest";
import {
  defaultUserState,
  loadUserState,
  logDrill,
  markCard,
  saveUserState,
  STORAGE_KEY,
  updateReviewResult,
  type UserState
} from "../app/state";
import { getDueCards, reviewCard } from "../domain/review/srs";

describe("review state", () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("marks cards as bookmarked, confusing, and mastered", () => {
    const bookmarked = markCard(defaultUserState, "spacing.split-timing", "bookmarked", true);
    expect(bookmarked.cards["spacing.split-timing"].bookmarked).toBe(true);

    const confusing = markCard(bookmarked, "spacing.split-timing", "confusing", true);
    expect(confusing.cards["spacing.split-timing"].confusing).toBe(true);

    const mastered = markCard(confusing, "spacing.split-timing", "mastered", true);
    expect(mastered.cards["spacing.split-timing"].mastered).toBe(true);
  });

  it("schedules review after remembered and forgotten results", () => {
    const now = new Date("2026-05-16T00:00:00Z");
    const remembered = reviewCard(undefined, true, now);
    expect(remembered.consecutiveCorrect).toBe(1);
    expect(remembered.intervalDays).toBe(1);

    const second = reviewCard(remembered, true, new Date("2026-05-17T00:00:00Z"));
    expect(second.consecutiveCorrect).toBe(2);
    expect(second.intervalDays).toBeGreaterThanOrEqual(2);

    const forgotten = reviewCard(second, false, new Date("2026-05-18T00:00:00Z"));
    expect(forgotten.consecutiveCorrect).toBe(0);
    expect(forgotten.intervalDays).toBe(1);
  });

  it("finds due cards from state", () => {
    const state = updateReviewResult(defaultUserState, "spacing.split-timing", false, new Date("2026-05-16T00:00:00Z"));
    const due = getDueCards(["spacing.split-timing"], state, new Date("2026-05-17T00:00:01Z"));

    expect(due).toEqual(["spacing.split-timing"]);
  });

  it("falls back to default state for invalid persisted JSON, schema, and dates", () => {
    globalThis.localStorage.setItem(STORAGE_KEY, "{not-json");
    expect(loadUserState()).toEqual(defaultUserState);

    globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, profile: {}, cards: {}, drillLogs: [] }));
    expect(loadUserState()).toEqual(defaultUserState);

    const invalidDateState: UserState = {
      ...defaultUserState,
      cards: {
        "spacing.split-timing": {
          bookmarked: false,
          confusing: false,
          mastered: false,
          review: {
            dueAt: "not-a-date",
            ease: 2,
            intervalDays: 1,
            attempts: 1,
            correct: 0,
            consecutiveCorrect: 0
          }
        }
      }
    };
    globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(invalidDateState));
    expect(loadUserState()).toEqual(defaultUserState);
  });

  it("falls back to default state if localStorage getItem throws", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("blocked");
      }
    });

    expect(loadUserState()).toEqual(defaultUserState);
  });

  it("does not throw if localStorage setItem throws", () => {
    vi.stubGlobal("localStorage", {
      setItem: () => {
        throw new Error("quota exceeded");
      }
    });

    expect(() => saveUserState(defaultUserState)).not.toThrow();
  });

  it("returns cards only when review due time has arrived", () => {
    const state = updateReviewResult(defaultUserState, "spacing.split-timing", true, new Date("2026-05-16T00:00:00Z"));

    expect(getDueCards(["spacing.split-timing"], state, new Date("2026-05-16T23:59:59Z"))).toEqual([]);
    expect(getDueCards(["spacing.split-timing"], state, new Date("2026-05-17T00:00:00Z"))).toEqual([
      "spacing.split-timing"
    ]);
  });

  it("treats invalid runtime dueAt as due", () => {
    const state: UserState = {
      ...defaultUserState,
      cards: {
        "spacing.split-timing": {
          bookmarked: false,
          confusing: false,
          mastered: false,
          review: {
            dueAt: "not-a-date",
            ease: 2,
            intervalDays: 1,
            attempts: 1,
            correct: 0,
            consecutiveCorrect: 0
          }
        }
      }
    };

    expect(getDueCards(["spacing.split-timing"], state, new Date("2026-05-16T00:00:00Z"))).toEqual([
      "spacing.split-timing"
    ]);
  });

  it("keeps drill logs capped at 200 with the newest entry first", () => {
    const existingLogs = Array.from({ length: 200 }, (_, index) => ({
      id: `old-${index}`,
      cardId: "spacing.split-timing",
      drillId: `drill-${index}`,
      completedAt: new Date(Date.UTC(2026, 4, 1, 0, index)).toISOString(),
      mode: "vr" as const
    }));
    const state: UserState = {
      ...defaultUserState,
      drillLogs: existingLogs
    };

    const next = logDrill(
      state,
      "spacing.contact-distance",
      "contact-vr",
      "real-court",
      new Date("2026-05-16T10:00:00Z")
    );

    expect(next.drillLogs).toHaveLength(200);
    expect(next.drillLogs[0]).toMatchObject({
      cardId: "spacing.contact-distance",
      drillId: "contact-vr",
      completedAt: "2026-05-16T10:00:00.000Z",
      mode: "real-court"
    });
    expect(next.drillLogs.map((log) => log.id)).not.toContain("old-199");
    expect(next.drillLogs.map((log) => log.id)).toContain("old-0");
  });

  it("does not mutate original state objects when marking or reviewing cards", () => {
    const original: UserState = {
      ...defaultUserState,
      cards: {
        "spacing.split-timing": {
          bookmarked: false,
          confusing: false,
          mastered: true
        }
      }
    };
    const originalCard = original.cards["spacing.split-timing"];

    const marked = markCard(original, "spacing.split-timing", "bookmarked", true);
    expect(original.cards["spacing.split-timing"]).toBe(originalCard);
    expect(original.cards["spacing.split-timing"].bookmarked).toBe(false);
    expect(marked).not.toBe(original);
    expect(marked.cards["spacing.split-timing"]).not.toBe(originalCard);

    const reviewed = updateReviewResult(original, "spacing.split-timing", false, new Date("2026-05-16T00:00:00Z"));
    expect(original.cards["spacing.split-timing"]).toBe(originalCard);
    expect(original.cards["spacing.split-timing"].mastered).toBe(true);
    expect(original.cards["spacing.split-timing"].review).toBeUndefined();
    expect(reviewed).not.toBe(original);
    expect(reviewed.cards["spacing.split-timing"]).not.toBe(originalCard);
  });
});
