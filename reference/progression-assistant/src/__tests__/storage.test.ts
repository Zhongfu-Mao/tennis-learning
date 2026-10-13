import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defaultAppState } from "../domain/defaults";
import { importState, loadState, saveState } from "../storage/localStore";

describe("localStore", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the default profile on first run", () => {
    const state = loadState();

    expect(state.profile.currentLevel).toBe("2.7");
    expect(state.profile.targetLevels).toEqual(["3.5", "4.0"]);
  });

  it("round trips saved state", () => {
    const state = {
      ...defaultAppState,
      profile: { ...defaultAppState.profile, weeklyTennisSessions: 3 }
    };

    saveState(state);

    expect(loadState().profile.weeklyTennisSessions).toBe(3);
  });

  it("falls back safely when localStorage contains corrupted JSON", () => {
    localStorage.setItem("tennis-progression-state", "{bad json");

    expect(loadState().sessions).toEqual([]);
  });

  it("falls back safely when localStorage getItem throws", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("blocked");
      }
    });

    expect(loadState()).toEqual(defaultAppState);
  });

  it("does not throw when localStorage setItem throws", () => {
    vi.stubGlobal("localStorage", {
      setItem: () => {
        throw new Error("quota exceeded");
      }
    });

    expect(() => saveState(defaultAppState)).not.toThrow();
  });

  it("migrates v2 state to include current progress fields", () => {
    const legacy = {
      ...defaultAppState,
      version: 2,
      videoAttachments: undefined,
      matchJournals: undefined
    };

    const imported = importState(JSON.stringify(legacy));

    expect(imported?.version).toBe(5);
    expect(imported?.recommendationLog).toEqual([]);
    expect(imported?.videoAttachments).toEqual([]);
    expect(imported?.matchJournals).toEqual([]);
  });
});
