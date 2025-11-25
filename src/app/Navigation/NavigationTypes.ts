import type { ComponentType, LazyExoticComponent } from "react";

// Command-First Navigation Types v2.1

export type CommandName =
  | "home"
  | "settingsPanel"
  | "profilePanel"
  | "habitList"
  | "habitDetail"
  | "habitCreateSheet"
  | "habitEditSheet";

export interface CommandPayload {
  id?: string;
}

export interface RouteDefinition {
  path: string;
  component: LazyExoticComponent<ComponentType<any>>;
  preload?: () => Promise<unknown>;
}

export type CommandRouteMap = Record<CommandName, RouteDefinition>;

export type PanelRouteName = "settingsPanel" | "profilePanel";

export type SheetRouteName = "habitCreateSheet" | "habitEditSheet";
