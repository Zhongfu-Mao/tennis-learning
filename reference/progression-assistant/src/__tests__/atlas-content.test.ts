import { atlasContent, getContentHealth, parseContentArray } from "../domain/atlas/content";
import { evidenceRecordSchema, knowledgeCardSchema } from "../domain/atlas/schema";

const SEED_CARD_IDS = [
  "spacing.split-timing",
  "spacing.contact-distance",
  "tactics.deep-middle",
  "serve.toss-window"
];

describe("atlas content", () => {
  it("keeps the verified seed pack intact as the library grows", () => {
    expect(atlasContent.cards.length).toBeGreaterThanOrEqual(4);
    const seed = atlasContent.cards.filter((card) => SEED_CARD_IDS.includes(card.id));
    expect(seed.map((card) => card.id).sort()).toEqual([...SEED_CARD_IDS].sort());
    expect(seed.every((card) => card.verificationStatus === "verified")).toBe(true);
  });

  it("loads the serve toss-window pilot card with complete V2 fields", () => {
    const card = atlasContent.cards.find((item) => item.id === "serve.toss-window");

    expect(card).toBeDefined();
    expect(card?.title).toBe("发球先练抛球窗口，不先堆动作链");
    expect(card?.topicIds).toEqual(expect.arrayContaining(["technique-models", "vr-practice"]));
    expect(card?.practice.vrDrill.id).toBe("vr-serve-toss-window-rhythm");
    expect(card?.practice.realCourtCheck?.id).toBe("court-serve-toss-window-5");
    expect(card?.generatedImage.assetId).toBe("img-serve-toss-window-v2");
    expect(card?.reviewPrompt).toMatch(/抛球窗口/);
  });

  it("requires every default card to connect pain point, topic, practice, and image", () => {
    for (const card of atlasContent.cards) {
      expect(card.painPoints.length).toBeGreaterThan(0);
      expect(card.topicIds.length).toBeGreaterThan(0);
      expect(card.practice.vrDrill.title.length).toBeGreaterThan(0);
      expect(card.generatedImage.assetId.length).toBeGreaterThan(0);
    }
  });

  it("keeps the equipment encyclopedia verified with evidence records", () => {
    const equipmentCards = atlasContent.cards.filter((card) => card.category.startsWith("equipment-"));
    const evidenceCardIds = new Set(atlasContent.evidenceLedger.map((record) => record.cardId));

    expect(equipmentCards.length).toBeGreaterThan(50);
    expect(equipmentCards.every((card) => card.verificationStatus === "verified")).toBe(true);
    expect(equipmentCards.filter((card) => !evidenceCardIds.has(card.id))).toEqual([]);
  });

  it("keeps the court, rules, match basics, and environment pack broad enough to open the 300-card expansion", () => {
    const phaseOneTopicIds = new Set(["court-geometry", "rules-scoring", "match-basics", "ball-environment"]);
    const phaseOneCards = atlasContent.cards.filter((card) =>
      card.topicIds.some((topicId) => phaseOneTopicIds.has(topicId))
    );
    const imagesById = new Map(atlasContent.imageManifest.map((image) => [image.id, image]));

    expect(phaseOneCards.length).toBeGreaterThanOrEqual(30);

    for (const card of phaseOneCards) {
      const image = imagesById.get(card.generatedImage.assetId);

      expect(card.verificationStatus).toBe("personal-note");
      expect(image).toBeDefined();
      expect(image?.status).toMatch(/^(candidate|needs-generation)$/);
      expect(image?.prompt).toMatch(/知识图|规则|场地|环境|计分|流程/);
    }
  });

  it("keeps the training basics and body management pack ready for generation review", () => {
    const phaseTwoTopicIds = new Set(["training-routine", "recovery-load", "injury-prevention", "movement-conditioning"]);
    const phaseTwoCards = atlasContent.cards.filter((card) =>
      card.topicIds.some((topicId) => phaseTwoTopicIds.has(topicId))
    );
    const imagesById = new Map(atlasContent.imageManifest.map((image) => [image.id, image]));

    expect(phaseTwoCards.length).toBeGreaterThanOrEqual(30);

    for (const card of phaseTwoCards) {
      const image = imagesById.get(card.generatedImage.assetId);

      expect(card.verificationStatus).toBe("personal-note");
      expect(image).toBeDefined();
      expect(image?.status).toMatch(/^(candidate|needs-generation)$/);
      expect(image?.prompt).toMatch(/知识图|训练|身体|恢复|伤病|体能|热身/);
    }
  });

  it("keeps the match tactics pack broad enough to be a standalone module", () => {
    const tacticsCards = atlasContent.cards.filter((card) => card.category === "tactics");
    const imagesById = new Map(atlasContent.imageManifest.map((image) => [image.id, image]));

    expect(tacticsCards.length).toBeGreaterThanOrEqual(30);
    expect(tacticsCards.every((card) => card.topicIds.includes("match-tactics"))).toBe(true);

    for (const card of tacticsCards) {
      const image = imagesById.get(card.generatedImage.assetId);

      expect(image).toBeDefined();
      expect(image?.prompt.length).toBeGreaterThan(0);
      expect(image?.status).toMatch(/^(approved|candidate|replace|needs-generation)$/);
    }
  });

  it("reports no structural breakage as the content pack grows", () => {
    const health = getContentHealth(atlasContent);

    expect(health.cardCount).toBe(atlasContent.cards.length);
    expect(health.topicCount).toBe(atlasContent.topics.length);
    // every card resolves an image, topic, relation, and evidence reference
    expect(health.missingImageRefs).toEqual([]);
    expect(health.missingTopicRefs).toEqual([]);
    expect(health.brokenRelations).toEqual([]);
    expect(health.brokenCardRelations).toEqual([]);
    expect(health.brokenImageCardRefs).toEqual([]);
    expect(health.brokenEvidenceCardRefs).toEqual([]);
    expect(health.missingEvidenceRefs).toEqual([]);
    expect(health.duplicateIds).toEqual([]);
    // approved images must have files on disk; this run has none approved yet
    expect(health.missingImageFiles).toEqual([]);
    // any unready ref must be a real, not-yet-approved manifest status
    for (const ref of health.unreadyImageRefs) {
      expect(ref).toMatch(/:(needs-generation|candidate|replace)$/);
    }
  });

  it("reports cards that reference a missing manifest image id", () => {
    const [firstCard] = atlasContent.cards;
    const health = getContentHealth({
      ...atlasContent,
      cards: [{ ...firstCard, generatedImage: { ...firstCard.generatedImage, assetId: "missing-image" } }]
    });

    expect(health.missingImageRefs).toEqual(["spacing.split-timing:missing-image"]);
  });

  it("reports image refs that are not approved yet", () => {
    const [firstCard] = atlasContent.cards;
    const firstImage = atlasContent.imageManifest.find((image) => image.id === firstCard.generatedImage.assetId);
    if (!firstImage) throw new Error("first card image must exist");
    const health = getContentHealth({
      ...atlasContent,
      cards: [firstCard],
      imageManifest: [{ ...firstImage, status: "candidate" }]
    });

    expect(health.unreadyImageRefs).toEqual([
      `${firstCard.id}:${firstCard.generatedImage.assetId}:candidate`
    ]);
  });

  it("does not report unready images as missing physical files", () => {
    const health = getContentHealth(atlasContent);

    expect(health.unreadyImageRefs.length).toBeGreaterThan(0);
    expect(health.missingImageFiles).toEqual([]);
  });

  it("reports approved images whose physical paths are unavailable", () => {
    const [firstCard] = atlasContent.cards;
    const approvedImage = { ...atlasContent.imageManifest[0], status: "approved" as const };
    const health = getContentHealth(
      {
        ...atlasContent,
        cards: [firstCard],
        imageManifest: [approvedImage]
      },
      { availableImagePaths: [] }
    );

    expect(health.missingImageFiles).toEqual([`${approvedImage.id}:${approvedImage.path}`]);
  });

  it("does not report approved images whose physical paths are available", () => {
    const [firstCard] = atlasContent.cards;
    const approvedImage = { ...atlasContent.imageManifest[0], status: "approved" as const };
    const health = getContentHealth(
      {
        ...atlasContent,
        cards: [firstCard],
        imageManifest: [approvedImage]
      },
      { availableImagePaths: [approvedImage.path] }
    );

    expect(health.missingImageFiles).toEqual([]);
  });

  it("reports image manifest card ids that do not exist", () => {
    const [firstCard] = atlasContent.cards;
    const health = getContentHealth({
      ...atlasContent,
      cards: [firstCard],
      imageManifest: [{ ...atlasContent.imageManifest[0], cardIds: ["missing.card"] }]
    });

    expect(health.brokenImageCardRefs).toEqual(["img-split-timing-field-guide-v1:missing.card"]);
  });

  it("reports verified cards without evidence records", () => {
    const [firstCard] = atlasContent.cards;
    const health = getContentHealth({
      ...atlasContent,
      cards: [firstCard],
      evidenceLedger: []
    });

    expect(health.missingEvidenceRefs).toEqual(["spacing.split-timing"]);
  });

  it("reports evidence records that point at missing cards", () => {
    const [firstCard] = atlasContent.cards;
    const health = getContentHealth({
      ...atlasContent,
      cards: [firstCard],
      evidenceLedger: [{ ...atlasContent.evidenceLedger[0], cardId: "missing.card" }]
    });

    expect(health.brokenEvidenceCardRefs).toEqual(["missing.card"]);
  });

  it("rejects evidence records without auditable source references", () => {
    const invalidEvidence = {
      ...atlasContent.evidenceLedger[0],
      source: "coach said so"
    };

    expect(() => parseContentArray("evidence", [invalidEvidence], evidenceRecordSchema)).toThrow(
      /Evidence source/
    );
  });

  it("reports broken graph relations from relationships json", () => {
    const health = getContentHealth({
      ...atlasContent,
      relationships: [{ ...atlasContent.relationships[0], targetId: "missing.card" }]
    });

    expect(health.brokenRelations).toEqual(["spacing.split-timing->missing.card"]);
  });

  it("reports broken card-level relatedCards", () => {
    const [firstCard] = atlasContent.cards;
    const health = getContentHealth({
      ...atlasContent,
      cards: [{ ...firstCard, relatedCards: [{ targetId: "missing.card", type: "next" }] }]
    });

    expect(health.brokenCardRelations).toEqual(["spacing.split-timing->missing.card"]);
  });

  it("reports card topic ids that do not exist", () => {
    const [firstCard] = atlasContent.cards;
    const health = getContentHealth({
      ...atlasContent,
      cards: [{ ...firstCard, topicIds: ["missing-topic"] }, ...atlasContent.cards.slice(1)]
    });

    expect(health.missingTopicRefs).toEqual(["spacing.split-timing:missing-topic"]);
    expect(health.brokenRelations).toEqual([]);
  });

  it("reports duplicate card ids", () => {
    const [firstCard] = atlasContent.cards;
    const health = getContentHealth({
      ...atlasContent,
      cards: [firstCard, { ...firstCard }]
    });

    expect(health.duplicateIds).toEqual(["cards:spacing.split-timing"]);
  });

  it("rejects schema typos with source name and item index", () => {
    const typoCard = {
      ...atlasContent.cards[0],
      unexpectedField: true
    };

    expect(() => parseContentArray("test-cards", [typoCard], knowledgeCardSchema)).toThrow(/test-cards\[0\]/);
  });
});
