import { getRouteDefinition, RouteId } from './routes';

export type NavigationCommand = {
  to: RouteId;
};

export const linkTo = (route: RouteId): NavigationCommand => ({ to: route });

export const commandToHref = (command: NavigationCommand): string => {
  return getRouteDefinition(command.to).path;
};

