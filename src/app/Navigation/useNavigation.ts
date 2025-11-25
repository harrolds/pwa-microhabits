import { useLocation, useNavigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { commandRegistry } from "./CommandRegistry";
import type { CommandName } from "./NavigationTypes";
import { resolveCommandFromPath } from "./routes";
import { FallbackScreen } from "../Fallback/FallbackScreen";

const FALLBACK: CommandName = "home";

export function useNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  const command: CommandName =
    resolveCommandFromPath(location.pathname) ?? FALLBACK;

  const entry = commandRegistry[command];

  let Component: React.ComponentType<any> = FallbackScreen;

  try {
    Component = lazy(entry.load);
  } catch {
    Component = FallbackScreen;
  }

  return {
    command,
    Component,
    navigate: (cmd: CommandName, params?: Record<string, string>) => {
      const def = commandRegistry[cmd];
      if (!def) return;
      let path = def.path;
      if (params) {
        Object.entries(params).forEach(([key, val]) => {
          path = path.replace(":" + key, val);
        });
      }
      navigate(path);
    },
  };
}
