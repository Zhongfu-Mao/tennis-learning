import { useState } from "react";
import { AtlasView } from "../features/atlas/AtlasView";
import { PathView } from "../features/path/PathView";
import { DrillView } from "../features/practice/DrillView";
import { ReviewView } from "../features/review/ReviewView";
import { SettingsView } from "../features/settings/SettingsView";
import { AppShell } from "../components/layout/AppShell";
import { atlasContent } from "../domain/atlas/content";
import { defaultUserState, loadUserState, saveUserState, type UserState } from "./state";
import type { PrimaryView } from "./navigation";

export function V2App() {
  const [view, setView] = useState<PrimaryView>("atlas");
  const [userState, setUserState] = useState<UserState>(() => loadUserState() ?? defaultUserState);

  function handleUserStateChange(nextState: UserState) {
    setUserState(nextState);
    saveUserState(nextState);
  }

  return (
    <AppShell view={view} onViewChange={setView}>
      {view === "atlas" && (
        <AtlasView content={atlasContent} userState={userState} onUserStateChange={handleUserStateChange} />
      )}
      {view === "path" && <PathView content={atlasContent} userState={userState} />}
      {view === "drill" && (
        <DrillView content={atlasContent} userState={userState} onUserStateChange={handleUserStateChange} />
      )}
      {view === "review" && (
        <ReviewView content={atlasContent} userState={userState} onUserStateChange={handleUserStateChange} />
      )}
      {view === "settings" && (
        <SettingsView content={atlasContent} userState={userState} onUserStateChange={handleUserStateChange} />
      )}
    </AppShell>
  );
}
