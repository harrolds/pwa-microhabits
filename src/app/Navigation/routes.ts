import { commandRegistry } from "./CommandRegistry";
import type { CommandName } from "./NavigationTypes";

// URL → command resolver
export function resolveCommandFromPath(path: string): CommandName | null {
  const commands = Object.keys(commandRegistry) as CommandName[];

  for (const cmd of commands) {
    const def = commandRegistry[cmd];

    const pattern = def.path
      .replace(/:[a-zA-Z]+/g, "([^/]+)")
      .replace(/\//g, "\\/");

    const regex = new RegExp(`^${pattern}$`);

    if (regex.test(path)) {
      return cmd;
    }
  }
  return null;
}
