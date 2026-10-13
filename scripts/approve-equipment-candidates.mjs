import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, "..");
const manifestPath = path.join(appRoot, "content/atlas/image-manifest.json");
const publicRoot = path.join(appRoot, "public");

const candidateImageIds = [
  "img-equipment-ball-felt-v1",
  "img-equipment-ball-storage-v1",
  "img-equipment-racquet-beam-v1",
  "img-equipment-accessory-dampener-v1",
  "img-equipment-string-tension-loss-v1",
  "img-equipment-accessory-sun-hydration-v1"
];

const args = new Set(process.argv.slice(2));
const shouldApply = args.has("--apply");
const hasUserConfirmation = args.has("--confirm-user-approved");

if (shouldApply && !hasUserConfirmation) {
  throw new Error("Refusing to approve images without --confirm-user-approved.");
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const byId = new Map(manifest.map((entry) => [entry.id, entry]));
const problems = [];

for (const imageId of candidateImageIds) {
  const entry = byId.get(imageId);

  if (!entry) {
    problems.push(`${imageId}: missing manifest entry`);
    continue;
  }

  if (entry.status !== "candidate") {
    problems.push(`${imageId}: expected candidate, got ${entry.status}`);
  }

  if (!entry.path.startsWith("/assets/knowledge/")) {
    problems.push(`${imageId}: path must be served from /assets/knowledge/`);
  }

  const assetPath = path.join(publicRoot, entry.path);
  if (!fs.existsSync(assetPath)) {
    problems.push(`${imageId}: missing asset file ${assetPath}`);
  }
}

if (problems.length > 0) {
  throw new Error(`Equipment candidate approval check failed:\n${problems.join("\n")}`);
}

if (!shouldApply) {
  console.log("Dry run OK. Add --apply --confirm-user-approved after user approval to promote 6 images.");
  console.log(candidateImageIds.join("\n"));
  process.exit(0);
}

for (const imageId of candidateImageIds) {
  byId.get(imageId).status = "approved";
}

fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log("Approved 6 equipment candidate images:");
console.log(candidateImageIds.join("\n"));
