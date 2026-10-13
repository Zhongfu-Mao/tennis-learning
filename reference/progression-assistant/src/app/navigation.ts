import { BookOpen, Dumbbell, Map, Route, Settings, Sparkles } from "lucide-react";
import type { ComponentType } from "react";

export type PrimaryView = "atlas" | "path" | "drill" | "review" | "settings";

export type NavigationItem = {
  id: PrimaryView;
  label: string;
  shortLabel: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
};

export const primaryNavigation: NavigationItem[] = [
  { id: "atlas", label: "Atlas", shortLabel: "Atlas", icon: Map },
  { id: "path", label: "Path", shortLabel: "Path", icon: Route },
  { id: "drill", label: "Drill", shortLabel: "Drill", icon: Dumbbell },
  { id: "review", label: "Review", shortLabel: "Review", icon: BookOpen },
  { id: "settings", label: "Settings", shortLabel: "Set", icon: Settings }
];

export const brandIcon = Sparkles;
