import type { CommandName } from "./NavigationTypes";
import { commandRegistry } from "./CommandRegistry";

export function resolveCommandFromPath(path: string): CommandName | null {
  const commands = Object.keys(commandRegistry) as CommandName[];
  for (const cmd of commands) {
    const def = commandRegistry[cmd];
    const regex = new RegExp(
      "^" +
        def.path
          .replace(/:[^/]+/g, "([^/]+)")
          .replace(/\//g, "\\/") +
        "$"
    );
    if (regex.test(path)) {
      return cmd;
    }
  }
  return null;
}
