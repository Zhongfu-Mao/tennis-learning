import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { defaultUserState, markCard, updateReviewResult, type UserState } from "../app/state";
import { atlasContent, type AtlasContent } from "../domain/atlas/content";
import type { KnowledgeCard } from "../domain/atlas/schema";
import { getPathCards } from "../domain/path/recommendations";
import { DrillView } from "../features/practice/DrillView";
import { PathView } from "../features/path/PathView";
import { ReviewView } from "../features/review/ReviewView";
import { SettingsView } from "../features/settings/SettingsView";
import App from "../App";

function syntheticCard(
  id: string,
  targetLevel: KnowledgeCard["progressionLens"]["targetLevel"],
  overrides: Partial<KnowledgeCard> = {}
): KnowledgeCard {
  return {
    id,
    title: `${id} title`,
    category: "synthetic",
    topicIds: ["synthetic-topic"],
    tags: ["synthetic"],
    difficulty: "starter",
    painPoints: ["spacing"],
    summary: `${id} summary`,
    encyclopedia: `${id} encyclopedia`,
    generatedImage: {
      assetId: `${id}-image`,
      alt: `${id} image`
    },
    progressionLens: {
      targetLevel,
      whyItMatters: `${id} matters`,
      commonFailure: `${id} failure`,
      onCourtCue: `${id} cue`,
      verificationTest: `${id} test`
    },
    practice: {
      vrDrill: {
        id: `${id}-vr`,
        title: `${id} VR drill`,
        durationMinutes: 8,
        instruction: `${id} instruction`,
        successSignal: `${id} signal`
      }
    },
    reviewPrompt: `${id} prompt`,
    relatedCards: [],
    verificationStatus: "verified",
    ...overrides
  };
}

function syntheticContent(cards: KnowledgeCard[]): AtlasContent {
  return {
    topics: [{ id: "synthetic-topic", label: "Synthetic", description: "Synthetic topic" }],
    cards,
    relationships: [],
    evidenceLedger: cards.map((card) => ({
      cardId: card.id,
      evidenceType: "source-synthesis",
      title: `${card.id} evidence`,
      source: "synthetic test",
      verificationNote: `${card.id} verification`,
      reviewer: "test",
      reviewedAt: "2026-05-16"
    })),
    imageManifest: cards.map((card) => ({
      id: card.generatedImage.assetId,
      path: `/assets/knowledge/${card.generatedImage.assetId}.png`,
      cardIds: [card.id],
      kind: "hero",
      status: "needs-generation",
      prompt: `${card.id} prompt`,
      version: 1
    }))
  };
}

function StatefulDrill({ onStateChange }: { onStateChange: (state: UserState) => void }) {
  const [userState, setUserState] = useState(defaultUserState);

  return (
    <DrillView
      content={atlasContent}
      userState={userState}
      onUserStateChange={(nextState) => {
        setUserState(nextState);
        onStateChange(nextState);
      }}
    />
  );
}

function StatefulReview({
  initialState,
  onStateChange
}: {
  initialState: UserState;
  onStateChange: (state: UserState) => void;
}) {
  const [userState, setUserState] = useState(initialState);

  return (
    <ReviewView
      content={atlasContent}
      userState={userState}
      onUserStateChange={(nextState) => {
        setUserState(nextState);
        onStateChange(nextState);
      }}
    />
  );
}

describe("secondary pages", () => {
  it("builds a personal path from target level and card learning state", () => {
    const state = markCard(defaultUserState, "spacing.split-timing", "mastered", true);

    render(<PathView content={atlasContent} userState={state} />);

    expect(screen.getByRole("heading", { name: /my path/i })).toBeInTheDocument();
    expect(screen.getByText(/2.7 to 3.5/i)).toBeInTheDocument();
    expect(screen.getByText(/personal route/i)).toBeInTheDocument();

    // the route renders up to 6 step cards
    const stepCards = screen.getAllByRole("article");
    expect(stepCards.length).toBeGreaterThan(0);
    expect(stepCards.length).toBeLessThanOrEqual(6);

    const cards = getPathCards(atlasContent, state);
    // mastered card is deprioritised to the very end of the full ordering
    expect(cards.at(-1)?.id).toBe("spacing.split-timing");
    // and is therefore not surfaced among the first 6 path steps
    expect(cards.slice(0, 6).map((card) => card.id)).not.toContain("spacing.split-timing");
    // foundational (current-level) cards lead the personal route
    expect(cards[0]?.progressionLens.targetLevel).toBe("2.7-3.0");
  });

  it("renders the actual current and target levels for a non-default profile", () => {
    const state: UserState = {
      ...defaultUserState,
      profile: {
        ...defaultUserState.profile,
        currentLevel: "3.0",
        targetLevel: "4.0"
      }
    };

    render(<PathView content={atlasContent} userState={state} />);

    expect(screen.getByText(/3.0 to 4.0/i)).toBeInTheDocument();
    expect(screen.queryByText(/2.7 to 4.0/i)).not.toBeInTheDocument();
  });

  it("orders foundational and intermediate path cards before future target-range cards", () => {
    const content = syntheticContent([
      syntheticCard("future", "3.5-4.0"),
      syntheticCard("foundation", "2.7-3.0"),
      syntheticCard("intermediate", "3.0-3.5")
    ]);
    const state: UserState = {
      ...defaultUserState,
      profile: {
        ...defaultUserState.profile,
        currentLevel: "2.7",
        targetLevel: "4.0"
      }
    };

    expect(getPathCards(content, state).map((card) => card.id)).toEqual(["foundation", "intermediate", "future"]);
  });

  it("keeps future path cards behind foundations despite ordinary priority markers", () => {
    const content = syntheticContent([
      syntheticCard("future-prioritized", "3.5-4.0", { painPoints: ["spacing"] }),
      syntheticCard("foundation", "2.7-3.0", { painPoints: ["knowledge"] }),
      syntheticCard("intermediate", "3.0-3.5", { painPoints: ["knowledge"] })
    ]);
    const reviewedFuture = updateReviewResult(
      markCard(
        markCard(defaultUserState, "future-prioritized", "bookmarked", true),
        "future-prioritized",
        "confusing",
        true
      ),
      "future-prioritized",
      false,
      new Date("2026-05-16T00:00:00Z")
    );
    const state: UserState = {
      ...reviewedFuture,
      profile: {
        ...reviewedFuture.profile,
        currentLevel: "2.7",
        targetLevel: "4.0",
        focusPainPoints: ["spacing"]
      }
    };

    expect(getPathCards(content, state).map((card) => card.id)).toEqual([
      "foundation",
      "intermediate",
      "future-prioritized"
    ]);
  });

  it("renders VR drills from cards and logs a drill through app state", async () => {
    const user = userEvent.setup();
    let latestState = defaultUserState;

    render(<StatefulDrill onStateChange={(state) => (latestState = state)} />);

    expect(screen.getByRole("heading", { name: /vr drill library/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /VR 深浅判断 8 分钟/i })).toBeInTheDocument();

    const splitDrill = screen.getByRole("article", { name: /VR 深浅判断 8 分钟/i });
    await user.click(within(splitDrill).getByRole("button", { name: /log vr drill/i }));

    expect(latestState.drillLogs[0]).toMatchObject({
      cardId: "spacing.split-timing",
      drillId: "vr-split-depth-read",
      mode: "vr"
    });
    expect(screen.getByText(/1 logged/i)).toBeInTheDocument();

    await user.click(within(splitDrill).getByRole("button", { name: /save court check/i }));
    expect(latestState.drillLogs[0]).toMatchObject({
      cardId: "spacing.split-timing",
      drillId: "court-split-distance-check",
      mode: "real-court"
    });
    expect(screen.getByText(/1 saved/i)).toBeInTheDocument();
  });

  it("renders empty states for path and drill pages with no cards", () => {
    const emptyContent = syntheticContent([]);

    render(<PathView content={emptyContent} userState={defaultUserState} />);
    expect(screen.getByText(/no path recommendations yet/i)).toBeInTheDocument();

    render(<DrillView content={emptyContent} userState={defaultUserState} onUserStateChange={() => undefined} />);
    expect(screen.getByText(/no vr drills yet/i)).toBeInTheDocument();
  });

  it("shows due, bookmarked, confusing, and mastered review state with review and clear actions", async () => {
    const user = userEvent.setup();
    const reviewed = updateReviewResult(defaultUserState, "spacing.split-timing", false, new Date("2026-05-16T00:00:00Z"));
    const initialState = markCard(
      markCard(
        markCard(
          {
            ...reviewed,
            cards: {
              ...reviewed.cards,
              "spacing.split-timing": {
                ...reviewed.cards["spacing.split-timing"],
                review: {
                  ...reviewed.cards["spacing.split-timing"].review!,
                  dueAt: "2026-05-15T00:00:00.000Z"
                }
              }
            }
          },
          "spacing.contact-distance",
          "bookmarked",
          true
        ),
        "tactics.deep-middle",
        "confusing",
        true
      ),
      "spacing.contact-distance",
      "mastered",
      true
    );
    let latestState = initialState;

    render(<StatefulReview initialState={initialState} onStateChange={(state) => (latestState = state)} />);

    expect(screen.getByRole("heading", { name: /review queue/i })).toBeInTheDocument();
    expect(screen.getAllByText(/due now/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/bookmarked: 1/i)).toBeInTheDocument();
    expect(screen.getByText(/confusing: 1/i)).toBeInTheDocument();
    expect(screen.getByText(/mastered: 1/i)).toBeInTheDocument();

    const splitReview = screen.getByRole("article", { name: /review split/i });
    await user.click(within(splitReview).getByRole("button", { name: /remembered/i }));
    expect(latestState.cards["spacing.split-timing"].review?.attempts).toBeGreaterThan(1);

    await user.click(screen.getByRole("button", { name: /clear confusing/i }));
    expect(latestState.cards["tactics.deep-middle"].confusing).toBe(false);
  });

  it("can focus the review queue on equipment encyclopedia cards", async () => {
    const user = userEvent.setup();
    const equipmentCard = atlasContent.cards.find((card) => card.category === "equipment-ball");
    if (!equipmentCard) throw new Error("equipment card must exist");
    const initialState = markCard(
      markCard(defaultUserState, equipmentCard.id, "bookmarked", true),
      "spacing.split-timing",
      "confusing",
      true
    );

    render(<ReviewView content={atlasContent} userState={initialState} onUserStateChange={() => undefined} />);

    const scopeSwitch = screen.getByLabelText("Review scope");
    expect(within(scopeSwitch).getByRole("button", { name: /全部 atlas/i })).toHaveAttribute("aria-pressed", "true");

    await user.click(within(scopeSwitch).getByRole("button", { name: /装备百科/i }));

    expect(within(scopeSwitch).getByRole("button", { name: /装备百科/i })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByLabelText("Review queue summary")).toHaveTextContent("62");
    expect(screen.getByText(/bookmarked: 1/i)).toBeInTheDocument();
    expect(screen.getByText(/confusing: 0/i)).toBeInTheDocument();
    expect(screen.getByRole("article", { name: new RegExp(`review ${equipmentCard.title}`, "i") })).toBeInTheDocument();
    expect(screen.queryByRole("article", { name: /review split/i })).not.toBeInTheDocument();
  });

  it("renders a caught-up state when review has no due cards", () => {
    const futureState: UserState = atlasContent.cards.reduce(
      (state, card) =>
        updateReviewResult(state, card.id, true, new Date("2999-01-01T00:00:00Z")),
      defaultUserState
    );

    render(<ReviewView content={atlasContent} userState={futureState} onUserStateChange={() => undefined} />);

    expect(screen.getByText(/review caught up/i)).toBeInTheDocument();
  });

  it("renders a true empty state when review has no content cards", () => {
    render(<ReviewView content={syntheticContent([])} userState={defaultUserState} onUserStateChange={() => undefined} />);

    expect(screen.getByText(/no reviewable cards yet/i)).toBeInTheDocument();
    expect(screen.queryByText(/review caught up/i)).not.toBeInTheDocument();
  });

  it("renders profile, content health, image manifest health, and export/import affordances in settings", async () => {
    const user = userEvent.setup();
    let restoredState = defaultUserState;

    render(<SettingsView content={atlasContent} userState={defaultUserState} onUserStateChange={(state) => (restoredState = state)} />);

    expect(screen.getByRole("heading", { name: /settings/i })).toBeInTheDocument();
    expect(screen.getByText(/current level: 2.7/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /content health/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /image manifest/i })).toBeInTheDocument();
    const exportedState = screen.getByRole("textbox", { name: /exported state/i }) as HTMLTextAreaElement;
    expect(exportedState.value).toContain('"targetLevel": "3.5"');

    const importState: UserState = {
      ...defaultUserState,
      profile: { ...defaultUserState.profile, currentLevel: "3.0", targetLevel: "4.0" }
    };
    fireEvent.change(screen.getByRole("textbox", { name: /import state/i }), {
      target: { value: JSON.stringify(importState) }
    });
    await user.click(screen.getByRole("button", { name: /restore imported state/i }));

    expect(restoredState.profile.currentLevel).toBe("3.0");
    expect(restoredState.profile.targetLevel).toBe("4.0");
    expect(screen.getByText(/state restored/i)).toBeInTheDocument();
  });

  it("replaces root App stubs with the real secondary pages", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /path/i }));
    expect(screen.getByText(/personal route/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /drill/i }));
    expect(screen.getByRole("heading", { name: /VR 深浅判断 8 分钟/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /review/i }));
    expect(screen.getByRole("heading", { name: /saved states/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /settings/i }));
    expect(screen.getByRole("heading", { name: /content health/i })).toBeInTheDocument();
  });
});
