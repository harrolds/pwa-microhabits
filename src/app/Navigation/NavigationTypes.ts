export type CommandName =
  | "home"
  | "habitList"
  | "habitDetail"
  | "settingsPanel"
  | "profilePanel"
  | "habitCreateSheet"
  | "habitEditSheet";

export interface RouteDefinition {
  path: string;
  load: () => Promise<{ default: React.ComponentType<any> }>;
  preload?: () => Promise<unknown>;
}

export type CommandRouteMap = Record<CommandName, RouteDefinition>;
