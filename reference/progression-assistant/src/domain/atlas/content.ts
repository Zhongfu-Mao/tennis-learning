import topicsJson from "../../../content/atlas/topics.json";
import spacingCardsJson from "../../../content/atlas/cards/spacing-foundations.json";
import serveCardsJson from "../../../content/atlas/cards/serve-foundations.json";
import spinTrajectoryCardsJson from "../../../content/atlas/cards/spin-trajectory.json";
import tacticsCardsJson from "../../../content/atlas/cards/tactics-foundations.json";
import progressionCardsJson from "../../../content/atlas/cards/progression-mindset.json";
import spacingMovementCardsJson from "../../../content/atlas/cards/spacing-movement.json";
import serveReturnCardsJson from "../../../content/atlas/cards/serve-return.json";
import strokeCardsJson from "../../../content/atlas/cards/stroke-foundations.json";
import courtRulesEnvironmentCardsJson from "../../../content/atlas/cards/court-rules-environment.json";
import bodyTrainingCardsJson from "../../../content/atlas/cards/body-training-basics.json";
import equipmentCardsJson from "../../../content/atlas/cards/equipment-foundations.json";
import equipmentExtensionCardsJson from "../../../content/atlas/cards/equipment-extensions.json";
import equipmentDeepDiveCardsJson from "../../../content/atlas/cards/equipment-deep-dive.json";
import relationshipsJson from "../../../content/atlas/relationships.json";
import imageManifestJson from "../../../content/atlas/image-manifest.json";
import evidenceLedgerJson from "../../../content/atlas/evidence-ledger.json";
import {
  evidenceRecordSchema,
  graphRelationSchema,
  imageManifestEntrySchema,
  knowledgeCardSchema,
  topicSchema,
  type AtlasTopic,
  type EvidenceRecord,
  type GraphRelation,
  type ImageManifestEntry,
  type KnowledgeCard
} from "./schema";
import type { z } from "zod";

export type AtlasContent = {
  topics: AtlasTopic[];
  cards: KnowledgeCard[];
  relationships: GraphRelation[];
  imageManifest: ImageManifestEntry[];
  evidenceLedger: EvidenceRecord[];
};

export type ContentHealth = {
  cardCount: number;
  topicCount: number;
  missingImageRefs: string[];
  unreadyImageRefs: string[];
  missingImageFiles: string[];
  brokenRelations: string[];
  brokenCardRelations: string[];
  brokenImageCardRefs: string[];
  brokenEvidenceCardRefs: string[];
  missingEvidenceRefs: string[];
  missingTopicRefs: string[];
  duplicateIds: string[];
};

export type ContentHealthOptions = {
  availableImagePaths?: Set<string> | string[];
};

export function parseContentArray<T>(name: string, value: unknown, schema: z.ZodType<T>): T[] {
  if (!Array.isArray(value)) throw new Error(`${name} must be an array`);
  return value.map((item, index) => {
    const result = schema.safeParse(item);

    if (!result.success) {
      throw new Error(`${name}[${index}] failed validation: ${result.error.message}`);
    }

    return result.data;
  });
}

export const atlasContent: AtlasContent = {
  topics: parseContentArray("topics", topicsJson, topicSchema),
  cards: [
    ...parseContentArray("spacingCards", spacingCardsJson, knowledgeCardSchema),
    ...parseContentArray("serveCards", serveCardsJson, knowledgeCardSchema),
    ...parseContentArray("spinTrajectoryCards", spinTrajectoryCardsJson, knowledgeCardSchema),
    ...parseContentArray("tacticsCards", tacticsCardsJson, knowledgeCardSchema),
    ...parseContentArray("progressionCards", progressionCardsJson, knowledgeCardSchema),
    ...parseContentArray("spacingMovementCards", spacingMovementCardsJson, knowledgeCardSchema),
    ...parseContentArray("serveReturnCards", serveReturnCardsJson, knowledgeCardSchema),
    ...parseContentArray("strokeCards", strokeCardsJson, knowledgeCardSchema),
    ...parseContentArray("courtRulesEnvironmentCards", courtRulesEnvironmentCardsJson, knowledgeCardSchema),
    ...parseContentArray("bodyTrainingCards", bodyTrainingCardsJson, knowledgeCardSchema),
    ...parseContentArray("equipmentCards", equipmentCardsJson, knowledgeCardSchema),
    ...parseContentArray("equipmentExtensionCards", equipmentExtensionCardsJson, knowledgeCardSchema),
    ...parseContentArray("equipmentDeepDiveCards", equipmentDeepDiveCardsJson, knowledgeCardSchema)
  ],
  relationships: parseContentArray("relationships", relationshipsJson, graphRelationSchema),
  imageManifest: parseContentArray("imageManifest", imageManifestJson, imageManifestEntrySchema),
  evidenceLedger: parseContentArray("evidenceLedger", evidenceLedgerJson, evidenceRecordSchema)
};

function duplicateRefs(source: string, ids: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const id of ids) {
    if (seen.has(id)) {
      duplicates.add(`${source}:${id}`);
    }
    seen.add(id);
  }

  return Array.from(duplicates);
}

function toPathSet(paths: Set<string> | string[] | undefined): Set<string> {
  return paths instanceof Set ? paths : new Set(paths ?? []);
}

export function getContentHealth(content: AtlasContent, options: ContentHealthOptions = {}): ContentHealth {
  const cardIds = new Set(content.cards.map((card) => card.id));
  const topicIds = new Set(content.topics.map((topic) => topic.id));
  const imagesById = new Map(content.imageManifest.map((image) => [image.id, image]));
  const evidenceCardIds = new Set(content.evidenceLedger.map((record) => record.cardId));
  const shouldCheckImageFiles = options.availableImagePaths !== undefined;
  const availableImagePaths = toPathSet(options.availableImagePaths);
  const missingImageRefs = content.cards
    .filter((card) => !imagesById.has(card.generatedImage.assetId))
    .map((card) => `${card.id}:${card.generatedImage.assetId}`);
  const unreadyImageRefs = content.cards.flatMap((card) => {
    const image = imagesById.get(card.generatedImage.assetId);
    if (!image || image.status === "approved") return [];
    return [`${card.id}:${image.id}:${image.status}`];
  });
  const missingImageFiles = shouldCheckImageFiles
    ? content.imageManifest
        .filter((image) => image.status === "approved" && !availableImagePaths.has(image.path))
        .map((image) => `${image.id}:${image.path}`)
    : [];
  const brokenRelations = content.relationships
    .filter((relation) => !cardIds.has(relation.sourceId) || !cardIds.has(relation.targetId))
    .map((relation) => `${relation.sourceId}->${relation.targetId}`);
  const brokenCardRelations = content.cards.flatMap((card) =>
    card.relatedCards
      .filter((relation) => !cardIds.has(relation.targetId))
      .map((relation) => `${card.id}->${relation.targetId}`)
  );
  const brokenImageCardRefs = content.imageManifest.flatMap((image) =>
    image.cardIds.filter((cardId) => !cardIds.has(cardId)).map((cardId) => `${image.id}:${cardId}`)
  );
  const brokenEvidenceCardRefs = content.evidenceLedger
    .filter((record) => !cardIds.has(record.cardId))
    .map((record) => record.cardId);
  const missingEvidenceRefs = content.cards
    .filter((card) => card.verificationStatus === "verified" && !evidenceCardIds.has(card.id))
    .map((card) => card.id);
  const missingTopicRefs = content.cards.flatMap((card) =>
    card.topicIds.filter((topicId) => !topicIds.has(topicId)).map((topicId) => `${card.id}:${topicId}`)
  );
  const duplicateIds = [
    ...duplicateRefs("topics", content.topics.map((topic) => topic.id)),
    ...duplicateRefs("cards", content.cards.map((card) => card.id)),
    ...duplicateRefs("images", content.imageManifest.map((image) => image.id)),
    ...duplicateRefs("evidence", content.evidenceLedger.map((record) => record.cardId))
  ];

  return {
    cardCount: content.cards.length,
    topicCount: content.topics.length,
    missingImageRefs,
    unreadyImageRefs,
    missingImageFiles,
    brokenRelations,
    brokenCardRelations,
    brokenImageCardRefs,
    brokenEvidenceCardRefs,
    missingEvidenceRefs,
    missingTopicRefs,
    duplicateIds
  };
}
