import { z } from "zod";

export const painPointSchema = z.enum(["knowledge", "progression", "technique", "spacing", "mindset", "strength"]);
export const difficultySchema = z.enum(["starter", "building", "advanced"]);
export const verificationStatusSchema = z.enum(["verified", "needs-review", "personal-note"]);
export const relationTypeSchema = z.enum(["prerequisite", "next", "supporting", "application"]);

export const topicSchema = z
  .object({
    id: z.string().min(1),
    label: z.string().min(1),
    description: z.string().min(1)
  })
  .strict();

export const practiceDrillSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    durationMinutes: z.number().int().min(1).max(120),
    instruction: z.string().min(1),
    successSignal: z.string().min(1)
  })
  .strict();

export const imageAssetRefSchema = z
  .object({
    assetId: z.string().min(1),
    alt: z.string().min(1)
  })
  .strict();

export const cardRelationSchema = z
  .object({
    targetId: z.string().min(1),
    type: relationTypeSchema
  })
  .strict();

export const knowledgeCardSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    category: z.string().min(1),
    topicIds: z.array(z.string().min(1)).min(1),
    tags: z.array(z.string().min(1)),
    difficulty: difficultySchema,
    painPoints: z.array(painPointSchema).min(1),
    summary: z.string().min(1),
    encyclopedia: z.string().min(1),
    generatedImage: imageAssetRefSchema,
    progressionLens: z
      .object({
        targetLevel: z.enum(["2.7-3.0", "3.0-3.5", "3.5-4.0"]),
        whyItMatters: z.string().min(1),
        commonFailure: z.string().min(1),
        onCourtCue: z.string().min(1),
        verificationTest: z.string().min(1)
      })
      .strict(),
    practice: z
      .object({
        vrDrill: practiceDrillSchema,
        realCourtCheck: practiceDrillSchema.optional()
      })
      .strict(),
    reviewPrompt: z.string().min(1),
    relatedCards: z.array(cardRelationSchema),
    verificationStatus: verificationStatusSchema
  })
  .strict();

export const graphRelationSchema = z
  .object({
    sourceId: z.string().min(1),
    targetId: z.string().min(1),
    type: relationTypeSchema,
    label: z.string().min(1)
  })
  .strict();

export const imageManifestEntrySchema = z
  .object({
    id: z.string().min(1),
    path: z.string().startsWith("/assets/knowledge/"),
    cardIds: z.array(z.string().min(1)).min(1),
    kind: z.enum(["hero", "step", "comparison"]),
    status: z.enum(["needs-generation", "candidate", "approved", "replace"]),
    prompt: z.string().min(1),
    version: z.number().int().min(1)
  })
  .strict();

const evidenceSourceSchema = z.string().min(1).refine(
  (value) => /^https?:\/\//.test(value) || value.startsWith("/") || /\d{4}-\d{2}-\d{2}/.test(value),
  {
    message: "Evidence source must include a URL, local path, or YYYY-MM-DD observation date"
  }
);

export const evidenceRecordSchema = z
  .object({
    cardId: z.string().min(1),
    evidenceType: z.enum(["verified-source", "repeated-training-observation", "coach-feedback", "source-synthesis"]),
    title: z.string().min(1),
    source: evidenceSourceSchema,
    verificationNote: z.string().min(1),
    reviewer: z.string().min(1),
    reviewedAt: z.string().min(1)
  })
  .strict();

export type AtlasTopic = z.infer<typeof topicSchema>;
export type PracticeDrill = z.infer<typeof practiceDrillSchema>;
export type KnowledgeCard = z.infer<typeof knowledgeCardSchema>;
export type GraphRelation = z.infer<typeof graphRelationSchema>;
export type ImageManifestEntry = z.infer<typeof imageManifestEntrySchema>;
export type EvidenceRecord = z.infer<typeof evidenceRecordSchema>;
