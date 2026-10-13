import type { CardUserState } from "../../app/state";
import type { EvidenceRecord, ImageManifestEntry, KnowledgeCard } from "../../domain/atlas/schema";

type MarkField = "bookmarked" | "confusing" | "mastered";
type DrillMode = "vr" | "real-court";

type KnowledgeCardPanelProps = {
  card: KnowledgeCard;
  image: ImageManifestEntry | undefined;
  evidence?: EvidenceRecord;
  cardState?: CardUserState;
  onMark: (field: MarkField, value: boolean) => void;
  onStartDrill: (mode: DrillMode) => void;
};

function titleCase(value: string): string {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function canUseImagePath(image: ImageManifestEntry | undefined): image is ImageManifestEntry {
  return image?.status === "approved" || image?.status === "candidate";
}

function MarkButton({
  label,
  active,
  onClick
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={active ? "mark-button active" : "mark-button"}
      aria-pressed={active}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export function KnowledgeCardPanel({ card, image, evidence, cardState, onMark, onStartDrill }: KnowledgeCardPanelProps) {
  const vrDrill = card.practice.vrDrill;
  const realCourtCheck = card.practice.realCourtCheck;
  const bookmarked = Boolean(cardState?.bookmarked);
  const confusing = Boolean(cardState?.confusing);
  const mastered = Boolean(cardState?.mastered);
  const imageStatusLabel = image ? titleCase(image.status) : "Missing manifest entry";

  return (
    <article className="knowledge-card-panel" aria-labelledby={`${card.id}-title`}>
      <div className="card-hero">
        {canUseImagePath(image) ? (
          <img src={image.path} alt={card.generatedImage.alt} />
        ) : (
          <div className="image-brief-state" role="img" aria-label={`Image brief pending: ${card.generatedImage.alt}`}>
            <span>Image brief pending</span>
            <strong>{card.title}</strong>
            <small>{imageStatusLabel}</small>
          </div>
        )}
      </div>

      <div className="card-panel-body">
        <div className="card-title-row">
          <div>
            <p className="eyebrow">Card Detail</p>
            <h2 id={`${card.id}-title`}>{card.title}</h2>
          </div>
          <div className="card-mark-actions" aria-label="Card marks">
            <MarkButton label="Bookmark" active={bookmarked} onClick={() => onMark("bookmarked", !bookmarked)} />
            <MarkButton label="Confusing" active={confusing} onClick={() => onMark("confusing", !confusing)} />
            <MarkButton label="Mastered" active={mastered} onClick={() => onMark("mastered", !mastered)} />
          </div>
        </div>

        <div className="card-pills" aria-label="Card metadata">
          <span>{titleCase(card.difficulty)}</span>
          <span>Target {card.progressionLens.targetLevel}</span>
          <span>Status {card.verificationStatus}</span>
          <span>Image {imageStatusLabel}</span>
          {evidence && <span>Evidence {titleCase(evidence.evidenceType)}</span>}
        </div>

        {evidence && (
          <section className="evidence-panel" aria-label="Verification evidence">
            <div>
              <p className="eyebrow">Verified Source</p>
              <h3>{evidence.title}</h3>
              <p>{evidence.verificationNote}</p>
            </div>
            <a href={evidence.source} target="_blank" rel="noreferrer">
              Source · {evidence.reviewedAt}
            </a>
          </section>
        )}

        <div className="primary-actions">
          <button type="button" className="action-primary" onClick={() => onStartDrill("vr")}>
            Start VR Drill
          </button>
          {realCourtCheck && (
            <button type="button" className="action-secondary" onClick={() => onStartDrill("real-court")}>
              Save Court Check
            </button>
          )}
        </div>

        <div className="lesson-grid practice-grid">
          <section>
            <h3>{vrDrill.title}</h3>
            <p>{vrDrill.instruction}</p>
            <small>{vrDrill.durationMinutes} min · {vrDrill.successSignal}</small>
          </section>
          {realCourtCheck && (
            <section>
              <h3>{realCourtCheck.title}</h3>
              <p>{realCourtCheck.instruction}</p>
              <small>{realCourtCheck.durationMinutes} min · {realCourtCheck.successSignal}</small>
            </section>
          )}
        </div>

        <details className="card-fold">
          <summary>文字版 · 讲解 / 复盘 / 验收</summary>
          <p className="card-summary">{card.summary}</p>
          <div className="detail-stack">
            <section>
              <h3>Why It Matters</h3>
              <p>{card.progressionLens.whyItMatters}</p>
            </section>
            <section>
              <h3>Common Failure</h3>
              <p>{card.progressionLens.commonFailure}</p>
            </section>
            <section>
              <h3>Full Explanation</h3>
              <p>{card.encyclopedia}</p>
            </section>
            <section>
              <h3>Review Prompt</h3>
              <p>{card.reviewPrompt}</p>
            </section>
            <section>
              <h3>On-Court Cue</h3>
              <p>{card.progressionLens.onCourtCue}</p>
            </section>
            <section>
              <h3>Verification</h3>
              <p>{card.progressionLens.verificationTest}</p>
            </section>
          </div>
        </details>
      </div>
    </article>
  );
}
