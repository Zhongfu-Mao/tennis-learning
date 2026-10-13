import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const appRoot = path.resolve(__dirname, "../..");
const manifestPath = path.join(appRoot, "content/atlas/image-manifest.json");

function runScript(scriptName: string, args: string[] = []) {
  return spawnSync(process.execPath, [path.join(appRoot, "scripts", scriptName), ...args], {
    cwd: appRoot,
    encoding: "utf8"
  });
}

function readEquipmentStatusCounts() {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as Array<{ id: string; status: string }>;
  return manifest
    .filter((entry) => entry.id.startsWith("img-equipment-"))
    .reduce<Record<string, number>>((counts, entry) => {
      counts[entry.status] = (counts[entry.status] ?? 0) + 1;
      return counts;
    }, {});
}

describe("equipment encyclopedia scripts", () => {
  it("keeps candidate approval and finalize scripts as dry runs by default", () => {
    const before = fs.readFileSync(manifestPath, "utf8");

    const approve = runScript("approve-equipment-candidates.mjs");
    const finalize = runScript("finalize-equipment-encyclopedia.mjs");

    const after = fs.readFileSync(manifestPath, "utf8");

    expect(approve.status).toBe(0);
    expect(approve.stdout).toMatch(/Dry run OK/);
    expect(finalize.status).toBe(0);
    expect(finalize.stdout).toMatch(/Finalize dry run OK/);
    expect(after).toBe(before);
    expect(readEquipmentStatusCounts()).toEqual({ approved: 56, candidate: 6 });
  });

  it("passes structural equipment audit before final approval", () => {
    const result = runScript("audit-equipment-encyclopedia.mjs");

    expect(result.status).toBe(0);
    expect(result.stdout).toMatch(/"equipmentCards": 62/);
    expect(result.stdout).toMatch(/"equipmentImages": 62/);
    expect(result.stdout).toMatch(/"problems": \[\]/);
  });

  it("blocks strict completion audit while candidate images remain", () => {
    const result = runScript("audit-equipment-encyclopedia.mjs", ["--strict-approved"]);

    expect(result.status).toBe(1);
    expect(result.stdout).toMatch(/Strict mode requires 62 approved equipment images/);
    expect(result.stdout).toMatch(/"candidate": 6/);
  });

  it("refuses apply mode without explicit user confirmation", () => {
    const result = runScript("finalize-equipment-encyclopedia.mjs", ["--apply"]);

    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/without --confirm-user-approved/);
  });

  it("exposes npm script aliases for the equipment workflow", () => {
    const packageJson = JSON.parse(fs.readFileSync(path.join(appRoot, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };

    expect(packageJson.scripts["equipment:approve-candidates"]).toBe("node scripts/approve-equipment-candidates.mjs");
    expect(packageJson.scripts["equipment:audit"]).toBe("node scripts/audit-equipment-encyclopedia.mjs");
    expect(packageJson.scripts["equipment:finalize"]).toBe("node scripts/finalize-equipment-encyclopedia.mjs");
  });
});
