import { lazy, type ComponentType } from "react";
import { CommandRouteMap } from "./NavigationTypes";

const lazyComponent = <T extends ComponentType<any>>(loader: () => Promise<T>) =>
  lazy(async () => {
    const Component = await loader();
    return { default: Component };
  });

export const commandRegistry: CommandRouteMap = {
  home: {
    path: "/",
    component: lazyComponent(() => import("../Screens/Home").then((m) => m.HomeScreen)),
    preload: () => import("../Screens/Home"),
  },
  habitList: {
    path: "/habits",
    component: lazyComponent(() => import("../Screens/Habits").then((m) => m.HabitListScreen)),
    preload: () => import("../Screens/Habits"),
  },
  habitDetail: {
    path: "/habit/:id",
    component: lazyComponent(() => import("../Screens/Habits").then((m) => m.HabitDetailScreen)),
  },
  // Panels
  settingsPanel: {
    path: "/_panel/settings",
    component: lazyComponent(() => import("../Panels/SettingsPanel").then((m) => m.SettingsPanel)),
  },
  profilePanel: {
    path: "/_panel/profile",
    component: lazyComponent(() => import("../Panels/ProfilePanel").then((m) => m.ProfilePanel)),
  },
  // Sheets
  habitCreateSheet: {
    path: "/_sheet/habit-create",
    component: lazyComponent(() => import("../Sheets/Habits").then((m) => m.HabitCreateSheet)),
  },
  habitEditSheet: {
    path: "/_sheet/habit-edit/:id",
    component: lazyComponent(() => import("../Sheets/Habits").then((m) => m.HabitEditSheet)),
  },
};
