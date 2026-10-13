import { useEffect, useMemo, useState } from "react";
import { logDrill, markCard, type UserState } from "../../app/state";
import { TopicRail } from "../../components/ui/TopicRail";
import type { AtlasContent } from "../../domain/atlas/content";
import { getTopicCards } from "../../domain/atlas/graph";
import { getDueCards } from "../../domain/review/srs";
import { searchCards } from "../../domain/atlas/search";
import type { EvidenceRecord, ImageManifestEntry, KnowledgeCard } from "../../domain/atlas/schema";
import { KnowledgeCardPanel } from "../cards/KnowledgeCardPanel";

type AtlasViewProps = {
  content: AtlasContent;
  userState: UserState;
  onUserStateChange: (state: UserState) => void;
};

type AtlasMode = "all" | "equipment";
type EquipmentStatusFilter = "all" | "imageCandidate" | "bookmarked" | "confusing" | "mastered" | "due";

type EquipmentGroup = {
  id: string;
  label: string;
  description: string;
  categories: string[];
};

const EQUIPMENT_GROUPS: EquipmentGroup[] = [
  {
    id: "balls",
    label: "网球",
    description: "压力、球毛、弹跳衰减和用球选择",
    categories: ["equipment-ball"]
  },
  {
    id: "racquets",
    label: "球拍",
    description: "拍面、重量、平衡、挥重、硬度和选拍",
    categories: ["equipment-racquet"]
  },
  {
    id: "strings",
    label: "球线",
    description: "材质、线径、磅数、掉磅、混线和维护",
    categories: ["equipment-string"]
  },
  {
    id: "grips",
    label: "握把",
    description: "手柄号、底胶、吸汗带和换握手感",
    categories: ["equipment-grip"]
  },
  {
    id: "shoes",
    label: "球鞋",
    description: "鞋底纹路、支撑、磨损和场地适配",
    categories: ["equipment-footwear"]
  },
  {
    id: "accessories",
    label: "配件维护",
    description: "减震器、网球包、防晒补水、热身和装备日志",
    categories: ["equipment-accessory", "equipment-maintenance"]
  }
];

const EQUIPMENT_STATUS_LABELS: Record<EquipmentStatusFilter, string> = {
  all: "全部",
  imageCandidate: "候选图",
  bookmarked: "收藏",
  confusing: "有疑问",
  mastered: "已掌握",
  due: "待复习"
};

const IMAGE_STATUS_LABELS: Record<ImageManifestEntry["status"], string> = {
  "needs-generation": "待生成",
  candidate: "候选图",
  approved: "已批准",
  replace: "需重做"
};

function getImageForCard(content: AtlasContent, card: KnowledgeCard): ImageManifestEntry | undefined {
  return content.imageManifest.find((image) => image.id === card.generatedImage.assetId);
}

function getEvidenceForCard(content: AtlasContent, card: KnowledgeCard): EvidenceRecord | undefined {
  return content.evidenceLedger.find((record) => record.cardId === card.id);
}

function imageReady(image: ImageManifestEntry | undefined): image is ImageManifestEntry {
  return image?.status === "approved" || image?.status === "candidate";
}

function topicLabel(content: AtlasContent, topicId: string): string {
  return content.topics.find((topic) => topic.id === topicId)?.label ?? topicId;
}

function isEquipmentCard(card: KnowledgeCard): boolean {
  return card.category.startsWith("equipment-");
}

function groupCardsByEquipment(cards: KnowledgeCard[]): Array<EquipmentGroup & { cards: KnowledgeCard[] }> {
  return EQUIPMENT_GROUPS.map((group) => ({
    ...group,
    cards: cards.filter((card) => group.categories.includes(card.category))
  })).filter((group) => group.cards.length > 0);
}

function filterCardsByEquipmentStatus(
  cards: KnowledgeCard[],
  statusFilter: EquipmentStatusFilter,
  content: AtlasContent,
  userState: UserState
): KnowledgeCard[] {
  if (statusFilter === "all") return cards;

  if (statusFilter === "imageCandidate") {
    return cards.filter((card) => getImageForCard(content, card)?.status === "candidate");
  }

  if (statusFilter === "due") {
    const dueIds = new Set(getDueCards(cards.map((card) => card.id), userState));
    return cards.filter((card) => dueIds.has(card.id));
  }

  return cards.filter((card) => userState.cards[card.id]?.[statusFilter]);
}

function countCardsByEquipmentStatus(
  cards: KnowledgeCard[],
  statusFilter: EquipmentStatusFilter,
  content: AtlasContent,
  userState: UserState
): number {
  return filterCardsByEquipmentStatus(cards, statusFilter, content, userState).length;
}

type GalleryCardProps = {
  card: KnowledgeCard;
  image: ImageManifestEntry | undefined;
  imageFirst?: boolean;
  cardState: { bookmarked?: boolean; confusing?: boolean; mastered?: boolean } | undefined;
  onOpen: () => void;
};

function GalleryCard({ card, image, imageFirst = false, cardState, onOpen }: GalleryCardProps) {
  const ready = imageReady(image);
  const imageStatusLabel = image ? IMAGE_STATUS_LABELS[image.status] : "缺失图";
  return (
    <button
      type="button"
      className={imageFirst ? "gallery-card gallery-card-image-first" : "gallery-card"}
      onClick={onOpen}
    >
      <span
        className={ready ? "gallery-thumb" : "gallery-thumb gallery-thumb-pending"}
        aria-hidden={imageFirst ? undefined : true}
        style={ready && !imageFirst ? { backgroundImage: `url(${image!.path})` } : undefined}
      >
        {ready && imageFirst && <img src={image.path} alt={card.generatedImage.alt} loading="lazy" />}
        {imageFirst && <span className={`image-status-badge image-status-${image?.status ?? "missing"}`}>{imageStatusLabel}</span>}
        {!ready && <span className="gallery-thumb-tag">Image pending</span>}
      </span>
      <span className="gallery-card-body">
        <span className="gallery-card-title">{card.title}</span>
        <span className="gallery-card-meta">
          {card.category} · {card.progressionLens.targetLevel}
        </span>
        {(cardState?.bookmarked || cardState?.confusing || cardState?.mastered) && (
          <span className="gallery-card-marks">
            {cardState?.bookmarked && <span className="gallery-status gallery-status-book">收藏</span>}
            {cardState?.confusing && <span className="gallery-status gallery-status-confuse">疑问</span>}
            {cardState?.mastered && <span className="gallery-status gallery-status-master">掌握</span>}
          </span>
        )}
      </span>
    </button>
  );
}

type CardDetailOverlayProps = {
  card: KnowledgeCard;
  image: ImageManifestEntry | undefined;
  evidence: EvidenceRecord | undefined;
  cardState: UserState["cards"][string] | undefined;
  onClose: () => void;
  onMark: (field: "bookmarked" | "confusing" | "mastered", value: boolean) => void;
  onStartDrill: (mode: "vr" | "real-court") => void;
};

function CardDetailOverlay({ card, image, evidence, cardState, onClose, onMark, onStartDrill }: CardDetailOverlayProps) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="card-overlay-backdrop" onClick={onClose}>
      <div
        className="card-overlay"
        role="dialog"
        aria-modal="true"
        aria-label={card.title}
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="card-overlay-close" onClick={onClose} aria-label="Close card">
          ×
        </button>
        <KnowledgeCardPanel
          card={card}
          image={image}
          evidence={evidence}
          cardState={cardState}
          onMark={onMark}
          onStartDrill={onStartDrill}
        />
      </div>
    </div>
  );
}

export function AtlasView({ content, userState, onUserStateChange }: AtlasViewProps) {
  const [mode, setMode] = useState<AtlasMode>("all");
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [activeEquipmentGroupId, setActiveEquipmentGroupId] = useState<string | null>(null);
  const [equipmentStatusFilter, setEquipmentStatusFilter] = useState<EquipmentStatusFilter>("all");
  const [query, setQuery] = useState("");
  const [openCardId, setOpenCardId] = useState<string | null>(null);

  const equipmentCards = useMemo(() => content.cards.filter(isEquipmentCard), [content.cards]);
  const equipmentImages = useMemo(
    () => content.imageManifest.filter((image) => image.cardIds.some((cardId) => equipmentCards.some((card) => card.id === cardId))),
    [content.imageManifest, equipmentCards]
  );
  const readyEquipmentImages = useMemo(
    () => equipmentImages.filter((image) => imageReady(image)).length,
    [equipmentImages]
  );
  const candidateEquipmentImages = useMemo(
    () => equipmentImages.filter((image) => image.status === "candidate").length,
    [equipmentImages]
  );
  const approvedEquipmentImages = useMemo(
    () => equipmentImages.filter((image) => image.status === "approved").length,
    [equipmentImages]
  );
  const activeEquipmentGroup = activeEquipmentGroupId
    ? EQUIPMENT_GROUPS.find((group) => group.id === activeEquipmentGroupId)
    : undefined;

  const topicCards = useMemo(
    () => {
      if (mode === "equipment") {
        if (!activeEquipmentGroup) return equipmentCards;
        return equipmentCards.filter((card) => activeEquipmentGroup.categories.includes(card.category));
      }
      return activeTopicId ? getTopicCards(content, activeTopicId) : content.cards;
    },
    [activeEquipmentGroup, activeTopicId, content, equipmentCards, mode]
  );
  const searchedCards = useMemo(() => searchCards(topicCards, query), [topicCards, query]);
  const visibleCards = useMemo(
    () =>
      mode === "equipment"
        ? filterCardsByEquipmentStatus(searchedCards, equipmentStatusFilter, content, userState)
        : searchedCards,
    [content, equipmentStatusFilter, mode, searchedCards, userState]
  );
  const modeTotal = mode === "equipment" ? topicCards.length : content.cards.length;

  const groups = useMemo(() => {
    if (mode === "equipment") {
      if (activeEquipmentGroup) {
        return [{ id: activeEquipmentGroup.id, label: activeEquipmentGroup.label, cards: visibleCards }];
      }
      return groupCardsByEquipment(visibleCards);
    }
    if (activeTopicId) {
      return [{ id: activeTopicId, label: topicLabel(content, activeTopicId), cards: visibleCards }];
    }
    return content.topics
      .map((topic) => ({
        id: topic.id,
        label: topic.label,
        cards: visibleCards.filter((card) => card.topicIds[0] === topic.id)
      }))
      .filter((group) => group.cards.length > 0);
  }, [activeEquipmentGroup, activeTopicId, content, mode, visibleCards]);

  const openCard = openCardId ? content.cards.find((card) => card.id === openCardId) : undefined;

  useEffect(() => {
    if (openCardId && !content.cards.some((card) => card.id === openCardId)) {
      setOpenCardId(null);
    }
  }, [openCardId, content]);

  function handleMark(card: KnowledgeCard, field: "bookmarked" | "confusing" | "mastered", value: boolean) {
    onUserStateChange(markCard(userState, card.id, field, value));
  }

  function handleStartDrill(card: KnowledgeCard, mode: "vr" | "real-court") {
    const drill = mode === "vr" ? card.practice.vrDrill : card.practice.realCourtCheck;
    if (!drill) return;
    onUserStateChange(logDrill(userState, card.id, drill.id, mode));
  }

  function handleModeChange(nextMode: AtlasMode) {
    setMode(nextMode);
    setActiveTopicId(null);
    setActiveEquipmentGroupId(null);
    setEquipmentStatusFilter("all");
    setOpenCardId(null);
  }

  return (
    <section className="atlas-view">
      <div className="atlas-toolbar">
        <div className="atlas-titlebar">
          <p className="eyebrow">Knowledge Atlas</p>
          <h1>Knowledge Atlas</h1>
        </div>
        <label className="atlas-search">
          <span>Search cards</span>
          <input
            type="search"
            value={query}
            placeholder="split, 深中路, spacing..."
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <span className="atlas-count">
          {visibleCards.length} / {modeTotal}
        </span>
      </div>

      <div className="atlas-mode-switch" aria-label="Atlas mode">
        <button
          type="button"
          className={mode === "all" ? "active" : ""}
          aria-pressed={mode === "all"}
          onClick={() => handleModeChange("all")}
        >
          全部 Atlas
        </button>
        <button
          type="button"
          className={mode === "equipment" ? "active" : ""}
          aria-pressed={mode === "equipment"}
          onClick={() => handleModeChange("equipment")}
        >
          装备百科
        </button>
      </div>

      {mode === "equipment" ? (
        <section className="equipment-module" aria-label="装备百科">
          <header className="equipment-module-head">
            <div>
              <p className="eyebrow">Equipment Encyclopedia</p>
              <h2>装备百科</h2>
              <span>按网球、球拍、球线、握把、球鞋、配件维护来翻图，不再混在通用 topic 里。</span>
            </div>
            <div className="equipment-stats" aria-label="装备百科状态">
              <strong>{equipmentCards.length}</strong>
              <span>知识图</span>
              <strong>{candidateEquipmentImages}</strong>
              <span>候选图</span>
              <strong>{approvedEquipmentImages}</strong>
              <span>已批准</span>
              <strong>{equipmentImages.length - readyEquipmentImages}</strong>
              <span>待处理</span>
            </div>
          </header>

          <div className="equipment-group-rail" role="group" aria-label="装备百科分组">
            <button
              type="button"
              className={activeEquipmentGroupId === null ? "equipment-group-pill active" : "equipment-group-pill"}
              aria-pressed={activeEquipmentGroupId === null}
              onClick={() => setActiveEquipmentGroupId(null)}
            >
              <span>全部装备</span>
              <strong>{equipmentCards.length}</strong>
              <small>完整装备百科</small>
            </button>
            {EQUIPMENT_GROUPS.map((group) => {
              const groupCount = equipmentCards.filter((card) => group.categories.includes(card.category)).length;
              return (
                <button
                  key={group.id}
                  type="button"
                  className={
                    activeEquipmentGroupId === group.id ? "equipment-group-pill active" : "equipment-group-pill"
                  }
                  aria-pressed={activeEquipmentGroupId === group.id}
                  onClick={() => setActiveEquipmentGroupId(group.id)}
                >
                  <span>{group.label}</span>
                  <strong>{groupCount}</strong>
                  <small>{group.description}</small>
                </button>
              );
            })}
          </div>

          <div className="equipment-status-rail" role="group" aria-label="装备图状态筛选">
            {(Object.keys(EQUIPMENT_STATUS_LABELS) as EquipmentStatusFilter[]).map((statusFilter) => {
              const count = countCardsByEquipmentStatus(searchedCards, statusFilter, content, userState);
              return (
                <button
                  key={statusFilter}
                  type="button"
                  className={
                    equipmentStatusFilter === statusFilter
                      ? "equipment-status-pill active"
                      : "equipment-status-pill"
                  }
                  aria-pressed={equipmentStatusFilter === statusFilter}
                  onClick={() => setEquipmentStatusFilter(statusFilter)}
                >
                  <span>{EQUIPMENT_STATUS_LABELS[statusFilter]}</span>
                  <strong>{count}</strong>
                </button>
              );
            })}
          </div>
        </section>
      ) : (
        <TopicRail topics={content.topics} activeTopicId={activeTopicId} onSelect={setActiveTopicId} />
      )}

      {visibleCards.length > 0 ? (
        <div className="atlas-gallery">
          {groups.map((group) => (
            <section className="gallery-group" key={group.id}>
              <header className="gallery-group-head">
                <h2>{group.label}</h2>
                <span>{group.cards.length}</span>
              </header>
              <div className="gallery-grid">
                {group.cards.map((card) => (
                  <GalleryCard
                    key={card.id}
                    card={card}
                    image={getImageForCard(content, card)}
                    imageFirst={mode === "equipment"}
                    cardState={userState.cards[card.id]}
                    onOpen={() => setOpenCardId(card.id)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="atlas-empty-state atlas-gallery-empty">
          <strong>No matching concepts</strong>
          <p>Clear the search or switch topics to bring the card gallery back.</p>
        </div>
      )}

      {openCard && (
        <CardDetailOverlay
          card={openCard}
          image={getImageForCard(content, openCard)}
          evidence={getEvidenceForCard(content, openCard)}
          cardState={userState.cards[openCard.id]}
          onClose={() => setOpenCardId(null)}
          onMark={(field, value) => handleMark(openCard, field, value)}
          onStartDrill={(mode) => handleStartDrill(openCard, mode)}
        />
      )}
    </section>
  );
}
