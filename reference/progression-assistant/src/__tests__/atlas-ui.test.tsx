import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import App from "../App";
import { defaultUserState, STORAGE_KEY, type UserState } from "../app/state";
import { atlasContent } from "../domain/atlas/content";
import { AtlasView } from "../features/atlas/AtlasView";

function renderAtlas(onUserStateChange: (state: UserState) => void = () => undefined) {
  return render(
    <AtlasView
      content={atlasContent}
      userState={defaultUserState}
      onUserStateChange={onUserStateChange}
    />
  );
}

function StatefulAtlas({ onStateChange }: { onStateChange: (state: UserState) => void }) {
  const [userState, setUserState] = useState<UserState>(defaultUserState);

  return (
    <AtlasView
      content={atlasContent}
      userState={userState}
      onUserStateChange={(nextState) => {
        setUserState(nextState);
        onStateChange(nextState);
      }}
    />
  );
}

describe("Atlas UI", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("opens a knowledge card from the atlas map and exposes practice actions", async () => {
    const user = userEvent.setup();

    renderAtlas();

    expect(screen.getByRole("heading", { name: /knowledge atlas/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /split 不是跳/i }));

    expect(screen.getByRole("heading", { name: /split 不是跳/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /start vr drill/i })).toBeInTheDocument();
  });

  it("filters cards by topic and restores them from All", async () => {
    const user = userEvent.setup();
    renderAtlas();

    const topicRail = screen.getByRole("navigation", { name: /atlas topics/i });
    const allButton = within(topicRail).getByRole("button", { name: /all/i });
    const tacticsButton = within(topicRail).getByRole("button", { name: /战术比分/i });

    expect(allButton).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /split 不是跳/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /深中路是/i })).toBeInTheDocument();

    await user.click(tacticsButton);

    expect(tacticsButton).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /深中路是/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /split 不是跳/i })).not.toBeInTheDocument();

    await user.click(allButton);

    expect(allButton).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /split 不是跳/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /深中路是/i })).toBeInTheDocument();
  });

  it("switches into the equipment encyclopedia and filters by equipment group", async () => {
    const user = userEvent.setup();
    renderAtlas();

    await user.click(screen.getByRole("button", { name: /装备百科/i }));

    expect(screen.getByRole("heading", { name: "装备百科" })).toBeInTheDocument();
    expect(screen.getByText(/按网球、球拍、球线、握把/)).toBeInTheDocument();
    expect(within(screen.getByLabelText("装备百科状态")).getByText("候选图")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /全部装备/i })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("heading", { name: "网球" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "球拍" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "球线" })).toBeInTheDocument();
    expect(screen.getAllByRole("img").length).toBeGreaterThan(0);

    const equipmentGroupRail = screen.getByRole("group", { name: /装备百科分组/i });
    await user.click(within(equipmentGroupRail).getByRole("button", { name: /球线/i }));

    expect(screen.getByText("16 / 16")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /聚酯线给旋转/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /第一支拍要买稳定范围/i })).not.toBeInTheDocument();

    await user.click(within(equipmentGroupRail).getByRole("button", { name: /全部装备/i }));

    expect(screen.getByText("62 / 62")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /第一支拍要买稳定范围/i })).toBeInTheDocument();
  });

  it("filters equipment images by saved review states", async () => {
    const user = userEvent.setup();
    const bookmarkedCard = atlasContent.cards.find((card) => card.category === "equipment-ball");
    const confusingCard = atlasContent.cards.find((card) => card.category === "equipment-racquet");
    if (!bookmarkedCard || !confusingCard) throw new Error("equipment cards must exist");

    const userState: UserState = {
      ...defaultUserState,
      cards: {
        [bookmarkedCard.id]: {
          bookmarked: true,
          confusing: false,
          mastered: false
        },
        [confusingCard.id]: {
          bookmarked: false,
          confusing: true,
          mastered: false
        }
      }
    };

    render(
      <AtlasView
        content={atlasContent}
        userState={userState}
        onUserStateChange={() => undefined}
      />
    );

    await user.click(screen.getByRole("button", { name: /装备百科/i }));

    const statusRail = screen.getByRole("group", { name: /装备图状态筛选/i });
    expect(within(statusRail).getByRole("button", { name: /全部/i })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(bookmarkedCard.title)).toBeInTheDocument();
    expect(screen.getByText(confusingCard.title)).toBeInTheDocument();
    expect(screen.getAllByText("收藏").length).toBeGreaterThan(0);
    expect(screen.getByText("疑问")).toBeInTheDocument();

    await user.click(within(statusRail).getByRole("button", { name: /收藏/i }));

    expect(screen.getByText("1 / 62")).toBeInTheDocument();
    expect(screen.getByText(bookmarkedCard.title)).toBeInTheDocument();
    expect(screen.queryByText(confusingCard.title)).not.toBeInTheDocument();

    await user.click(within(statusRail).getByRole("button", { name: /有疑问/i }));

    expect(screen.getByText("1 / 62")).toBeInTheDocument();
    expect(screen.queryByText(bookmarkedCard.title)).not.toBeInTheDocument();
    expect(screen.getByText(confusingCard.title)).toBeInTheDocument();
  });

  it("filters equipment images down to candidate review cards", async () => {
    const user = userEvent.setup();
    renderAtlas();

    await user.click(screen.getByRole("button", { name: /装备百科/i }));

    const statusRail = screen.getByRole("group", { name: /装备图状态筛选/i });
    await user.click(within(statusRail).getByRole("button", { name: /候选图/i }));

    expect(screen.getByText("6 / 62")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /球毛决定空气阻力和咬球感/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /罐装球也需要保存逻辑/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /拍框厚度改变力量来源/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /减震器主要改声音和手感/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /掉磅会让线床换性格/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /防晒和补水也是装备/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /压力球为什么更像比赛球/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /球毛决定空气阻力和咬球感/i }));

    expect(screen.getByRole("dialog", { name: /球毛决定空气阻力和咬球感/i })).toBeInTheDocument();
    expect(screen.getByText(/Image Candidate/i)).toBeInTheDocument();
    expect(screen.getByText(/Evidence Verified Source/i)).toBeInTheDocument();
  });

  it("shows verification evidence when opening an equipment knowledge image", async () => {
    const user = userEvent.setup();
    const card = atlasContent.cards.find((entry) => entry.id === "equipment.ball.pressurized");
    const image = atlasContent.imageManifest.find((entry) => entry.id === card?.generatedImage.assetId);
    const imageStatusLabel = image ? `${image.status[0].toUpperCase()}${image.status.slice(1)}` : "Missing";

    renderAtlas();

    await user.click(screen.getByRole("button", { name: /装备百科/i }));
    await user.click(screen.getByRole("button", { name: /压力球为什么更像比赛球/i }));

    expect(screen.getByRole("dialog", { name: /压力球为什么更像比赛球/i })).toBeInTheDocument();
    expect(screen.getByText(`Image ${imageStatusLabel}`)).toBeInTheDocument();
    expect(screen.getByText(/Evidence Verified Source/i)).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /verification evidence/i })).toBeInTheDocument();
    expect(screen.getByText(/How to Choose the Right Tennis Balls/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Source · 2026-05-25/i })).toHaveAttribute(
      "href",
      expect.stringContaining("choose_right_tennis_balls")
    );
  });

  it("shows an empty search state and finds cards by search text", async () => {
    const user = userEvent.setup();
    renderAtlas();

    const search = screen.getByRole("searchbox", { name: /search cards/i });

    await user.type(search, "not-a-real-tennis-card");

    expect(screen.getByText(/no matching concepts/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /split 不是跳/i })).not.toBeInTheDocument();

    await user.clear(search);
    await user.type(search, "深中路");

    expect(screen.getByRole("button", { name: /深中路是/i })).toBeInTheDocument();
    expect(screen.queryByText(/no matching concepts/i)).not.toBeInTheDocument();
  });

  it("shows the missing image brief state for an unready asset without rendering an image element", async () => {
    const user = userEvent.setup();
    const splitCard = atlasContent.cards.find((card) => card.id === "spacing.split-timing");
    if (!splitCard) throw new Error("split timing card must exist");
    const unreadyContent = {
      ...atlasContent,
      imageManifest: atlasContent.imageManifest.map((image) =>
        image.id === splitCard.generatedImage.assetId
          ? { ...image, status: "needs-generation" as const }
          : image
      )
    };
    const { container } = render(
      <AtlasView
        content={unreadyContent}
        userState={defaultUserState}
        onUserStateChange={() => undefined}
      />
    );

    await user.click(screen.getByRole("button", { name: /split 不是跳/i }));

    expect(screen.getByText(/image brief pending/i)).toBeInTheDocument();
    expect(screen.getAllByText(/needs generation/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("img", { name: /image brief pending/i })).toBeInTheDocument();
    expect(container.querySelector("img")).not.toBeInTheDocument();
  });

  it("marks the selected card as bookmarked, confusing, and mastered", async () => {
    const user = userEvent.setup();
    let latestState = defaultUserState;

    render(<StatefulAtlas onStateChange={(state) => (latestState = state)} />);
    await user.click(screen.getByRole("button", { name: /split 不是跳/i }));

    await user.click(screen.getByRole("button", { name: /bookmark/i }));
    expect(latestState.cards["spacing.split-timing"]?.bookmarked).toBe(true);
    expect(screen.getByRole("button", { name: /bookmark/i })).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: /confusing/i }));
    expect(latestState.cards["spacing.split-timing"]?.confusing).toBe(true);
    expect(screen.getByRole("button", { name: /confusing/i })).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: /mastered/i }));
    expect(latestState.cards["spacing.split-timing"]?.mastered).toBe(true);
    expect(screen.getByRole("button", { name: /mastered/i })).toHaveAttribute("aria-pressed", "true");
  });

  it("logs VR drills and real-court checks from the selected card", async () => {
    const user = userEvent.setup();
    let latestState = defaultUserState;

    render(<StatefulAtlas onStateChange={(state) => (latestState = state)} />);
    await user.click(screen.getByRole("button", { name: /split 不是跳/i }));

    await user.click(screen.getByRole("button", { name: /start vr drill/i }));
    expect(latestState.drillLogs[0]).toMatchObject({
      cardId: "spacing.split-timing",
      drillId: "vr-split-depth-read",
      mode: "vr"
    });

    await user.click(screen.getByRole("button", { name: /save court check/i }));
    expect(latestState.drillLogs[0]).toMatchObject({
      cardId: "spacing.split-timing",
      drillId: "court-split-distance-check",
      mode: "real-court"
    });
    expect(latestState.drillLogs[1]).toMatchObject({
      drillId: "vr-split-depth-read",
      mode: "vr"
    });
  });

  it("persists card marks and drill logs through the root app storage contract", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /split 不是跳/i }));
    await user.click(screen.getByRole("button", { name: /bookmark/i }));
    await user.click(screen.getByRole("button", { name: /start vr drill/i }));

    const storedState = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as UserState | null;

    expect(storedState?.cards["spacing.split-timing"]?.bookmarked).toBe(true);
    expect(storedState?.drillLogs[0]).toMatchObject({
      cardId: "spacing.split-timing",
      drillId: "vr-split-depth-read",
      mode: "vr"
    });
  });
});
