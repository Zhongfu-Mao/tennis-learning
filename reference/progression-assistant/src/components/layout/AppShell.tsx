import type { ReactNode } from "react";
import { brandIcon, primaryNavigation, type PrimaryView } from "../../app/navigation";

type AppShellProps = {
  view: PrimaryView;
  onViewChange: (view: PrimaryView) => void;
  children: ReactNode;
};

export function AppShell({ view, onViewChange, children }: AppShellProps) {
  const BrandIcon = brandIcon;

  return (
    <div className="atlas-app">
      <aside className="atlas-rail" aria-label="Primary navigation">
        <div className="atlas-brand" aria-label="Tennis Knowledge Atlas">
          <BrandIcon size={24} strokeWidth={2.4} />
        </div>
        <nav className="atlas-nav">
          {primaryNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                className={view === item.id ? "atlas-nav-button active" : "atlas-nav-button"}
                aria-label={item.label}
                aria-pressed={view === item.id}
                onClick={() => onViewChange(item.id)}
              >
                <Icon size={21} strokeWidth={2.2} />
                <span>{item.shortLabel}</span>
              </button>
            );
          })}
        </nav>
      </aside>
      <main className="atlas-main">{children}</main>
    </div>
  );
}
