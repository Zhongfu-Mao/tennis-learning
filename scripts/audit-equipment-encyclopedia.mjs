import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, "..");
const strict = process.argv.includes("--strict-approved");

const manifest = JSON.parse(fs.readFileSync(path.join(appRoot, "content/atlas/image-manifest.json"), "utf8"));
const evidenceLedger = JSON.parse(fs.readFileSync(path.join(appRoot, "content/atlas/evidence-ledger.json"), "utf8"));
const cardDir = path.join(appRoot, "content/atlas/cards");
const cards = fs
  .readdirSync(cardDir)
  .filter((name) => name.endsWith(".json"))
  .flatMap((name) => JSON.parse(fs.readFileSync(path.join(cardDir, name), "utf8")));

const manifestById = new Map(manifest.map((entry) => [entry.id, entry]));
const evidenceCardIds = new Set(evidenceLedger.map((record) => record.cardId));
const equipmentCards = cards.filter((card) => card.id.startsWith("equipment."));
const equipmentImages = manifest.filter((entry) => entry.id.startsWith("img-equipment-"));
const statusCounts = {};
const problems = [];

for (const image of equipmentImages) {
  statusCounts[image.status] = (statusCounts[image.status] ?? 0) + 1;
}

if (equipmentCards.length !== 62) {
  problems.push(`Expected 62 equipment cards, got ${equipmentCards.length}.`);
}

if (equipmentImages.length !== 62) {
  problems.push(`Expected 62 equipment images, got ${equipmentImages.length}.`);
}

for (const card of equipmentCards) {
  const image = manifestById.get(card.generatedImage.assetId);

  if (!image) {
    problems.push(`${card.id}: missing manifest image ${card.generatedImage.assetId}.`);
    continue;
  }

  const assetPath = path.join(appRoot, "public", image.path);
  if (!fs.existsSync(assetPath)) {
    problems.push(`${card.id}: missing image file ${assetPath}.`);
  }

  if (card.verificationStatus !== "verified") {
    problems.push(`${card.id}: expected verificationStatus verified, got ${card.verificationStatus}.`);
  }

  if (!evidenceCardIds.has(card.id)) {
    problems.push(`${card.id}: missing evidence-ledger record.`);
  }
}

if (strict && (statusCounts.approved ?? 0) !== 62) {
  problems.push(`Strict mode requires 62 approved equipment images, got ${statusCounts.approved ?? 0}.`);
}

if (strict && ((statusCounts.candidate ?? 0) > 0 || (statusCounts.replace ?? 0) > 0 || (statusCounts["needs-generation"] ?? 0) > 0)) {
  problems.push(`Strict mode requires 0 non-approved equipment images, got ${JSON.stringify(statusCounts)}.`);
}

const reviewPackPath = path.join(appRoot, "docs/equipment-candidate-review-pack-2026-05-25.md");
const reviewBoardPath = path.join(appRoot, "docs/equipment-candidate-review-board-2026-05-25.png");

if (!fs.existsSync(reviewPackPath)) {
  problems.push("Missing equipment candidate review pack.");
}

if (!fs.existsSync(reviewBoardPath)) {
  problems.push("Missing equipment candidate review board.");
}

const summary = {
  equipmentCards: equipmentCards.length,
  equipmentImages: equipmentImages.length,
  statusCounts,
  strictApproved: strict,
  problems
};

console.log(JSON.stringify(summary, null, 2));

if (problems.length > 0) {
  process.exitCode = 1;
}
