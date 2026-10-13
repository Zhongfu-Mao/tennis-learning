import { useMemo, useState } from "react";
import { parseUserStatePayload, type UserState } from "../../app/state";
import { getContentHealth, type AtlasContent } from "../../domain/atlas/content";

type SettingsViewProps = {
  content: AtlasContent;
  userState: UserState;
  onUserStateChange: (state: UserState) => void;
};

export function SettingsView({ content, userState, onUserStateChange }: SettingsViewProps) {
  const [importText, setImportText] = useState("");
  const [importStatus, setImportStatus] = useState<"idle" | "restored" | "invalid">("idle");
  const health = getContentHealth(content);
  const exportedState = useMemo(() => JSON.stringify(userState, null, 2), [userState]);
  const needsGeneration = content.imageManifest.filter((image) => image.status === "needs-generation").length;
  const candidates = content.imageManifest.filter((image) => image.status === "candidate").length;
  const approved = content.imageManifest.filter((image) => image.status === "approved").length;
  const replace = content.imageManifest.filter((image) => image.status === "replace").length;

  return (
    <section className="page-surface secondary-page settings-view">
      <header className="secondary-header">
        <div>
          <p className="eyebrow">Settings</p>
          <h1>Settings</h1>
          <p className="lede">Inspect profile, content health, image manifest health, and the local state snapshot.</p>
        </div>
        <div className="route-meter" aria-label="Local state summary">
          <span>Local logs</span>
          <strong>{userState.drillLogs.length}</strong>
          <small>{Object.keys(userState.cards).length} card states</small>
        </div>
      </header>

      <div className="settings-grid">
        <article>
          <h2>Profile</h2>
          <p>Current level: {userState.profile.currentLevel}</p>
          <p>Target level: {userState.profile.targetLevel}</p>
          <p>Focus: {userState.profile.focusPainPoints.join(" / ")}</p>
        </article>
        <article>
          <h2>Content Health</h2>
          <p>Cards: {health.cardCount}</p>
          <p>Topics: {health.topicCount}</p>
          <p>Missing image refs: {health.missingImageRefs.length}</p>
          <p>Unready image refs: {health.unreadyImageRefs.length}</p>
          <p>Missing evidence refs: {health.missingEvidenceRefs.length}</p>
          <p>Broken relations: {health.brokenRelations.length + health.brokenCardRelations.length}</p>
        </article>
        <article>
          <h2>Image Manifest</h2>
          <p>Needs generation: {needsGeneration}</p>
          <p>Candidates: {candidates}</p>
          <p>Approved: {approved}</p>
          <p>Replace: {replace}</p>
        </article>
      </div>

      <div className="snapshot-panel">
        <label>
          <span>Exported state</span>
          <textarea aria-label="Exported state" readOnly value={exportedState} />
        </label>
        <label>
          <span>Import state</span>
          <textarea
            aria-label="Import state"
            value={importText}
            placeholder="Paste a V2 exported state JSON snapshot here."
            onChange={(event) => {
              setImportText(event.target.value);
              setImportStatus("idle");
            }}
          />
        </label>
        <button
          type="button"
          className="action-primary"
          onClick={() => {
            const nextState = parseUserStatePayload(importText);
            if (!nextState) {
              setImportStatus("invalid");
              return;
            }
            onUserStateChange(nextState);
            setImportStatus("restored");
          }}
        >
          Restore imported state
        </button>
        {importStatus === "restored" && <p className="snapshot-status">State restored.</p>}
        {importStatus === "invalid" && <p className="snapshot-status error">Import JSON is not valid V2 state.</p>}
      </div>
    </section>
  );
}
