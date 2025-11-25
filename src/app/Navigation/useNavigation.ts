import { useEffect, useState } from "react";
import { commandToPath } from "./LinkNavigation";
import { resolveCommandFromPath } from "./routes";
import { CommandName, CommandPayload } from "./NavigationTypes";
import { commandRegistry } from "./CommandRegistry";

const FALLBACK_COMMAND: CommandName = "home";

export function useNavigation() {
  const [command, setCommand] = useState<CommandName>(FALLBACK_COMMAND);

  // Resolve initial command from current URL
  useEffect(() => {
    const resolved = resolveCommandFromPath(window.location.pathname);
    if (resolved) {
      setCommand(resolved);
    }
  }, []);

  const navigate = (cmd: CommandName, payload?: CommandPayload) => {
    const href = commandToPath(cmd, payload);
    window.history.pushState({}, "", href);
    setCommand(cmd);
  };

  // Compute component dynamically
  const entry = commandRegistry[command] ?? commandRegistry[FALLBACK_COMMAND];
  const Component = entry?.component ?? commandRegistry[FALLBACK_COMMAND].component;

  return {
    command: entry ? command : FALLBACK_COMMAND,
    navigate,
    Component,
  };
}
