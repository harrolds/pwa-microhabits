import { commandRegistry } from "./CommandRegistry";
import { CommandName, CommandPayload } from "./NavigationTypes";

// ➜ Resolve absolute path from command
export function commandToPath(command: CommandName, payload?: CommandPayload): string {
  const entry = commandRegistry[command];
  if (!entry) return "/";

  let path = entry.path;

  if (payload?.id) {
    path = path.replace(":id", payload.id);
  }

  return path;
}

// ➜ Construct a navigation command descriptor
export function linkTo(command: CommandName, payload?: CommandPayload) {
  return {
    command,
    payload,
    href: commandToPath(command, payload),
  };
}
