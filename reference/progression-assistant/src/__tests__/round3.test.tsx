import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { defaultAppState } from "../domain/defaults";
import { importState } from "../storage/localStore";

describe("V2 clean rebuild regression boundaries", () => {
  it("keeps retired V1 hero court selectors out of the V2 stylesheet", () => {
    const css = readFileSync(join(process.cwd(), "src/styles.css"), "utf8");

    expect(css).not.toMatch(/\.hero-court\b/);
    expect(css).not.toMatch(/\.court-frame\b/);
    expect(css).not.toMatch(/\.court-net\b/);
    expect(css).not.toMatch(/\.court-zone\b/);
    expect(css).not.toMatch(/\.court-player\b/);
    expect(css).not.toMatch(/\.court-trajectory\b/);
  });

  it("gives the mobile rail a horizontally scrollable nav instead of relying on 320px fitting", () => {
    const css = readFileSync(join(process.cwd(), "src/styles.css"), "utf8");
    const mobileBlock = css.slice(css.indexOf("@media (max-width: 780px)"));

    expect(mobileBlock).toContain(".atlas-rail");
    expect(mobileBlock).toContain("position: fixed");
    expect(mobileBlock).toContain(".atlas-nav");
    expect(mobileBlock).toContain("overflow-x: auto");
    expect(mobileBlock).toContain(".atlas-nav-button");
    expect(mobileBlock).toContain("flex: 0 0 56px");
  });

  it("migrates existing v4 users to schema v5 as already onboarded", () => {
    const imported = importState(JSON.stringify({ ...defaultAppState, version: 4 }));

    expect(imported?.version).toBe(5);
    expect(imported?.onboardingCompletedAt).toMatch(/T/);
  });
});
