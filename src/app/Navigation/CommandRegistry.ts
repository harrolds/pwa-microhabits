import { lazy } from "react";
import type { CommandRouteMap } from "./NavigationTypes";

const wrap = (loader: () => Promise<any>) =>
  lazy(() => loader().then((m) => ({ default: m.default ?? m })));

export const commandRegistry: CommandRouteMap = {
  home: {
    path: "/",
    load: () =>
      import("../Screens/Home").then((m) => ({
        default: m.HomeScreen,
      })),
    preload: () => import("../Screens/Home"),
  },

  habitList: {
    path: "/habits",
    load: () =>
      import("../Screens/Habits").then((m) => ({
        default: m.HabitListScreen,
      })),
    preload: () => import("../Screens/Habits"),
  },

  habitDetail: {
    path: "/habit/:id",
    load: () =>
      import("../Screens/Habits").then((m) => ({
        default: m.HabitDetailScreen,
      })),
  },

  settingsPanel: {
    path: "/_panel/settings",
    load: () =>
      import("../Panels/SettingsPanel").then((m) => ({
        default: m.SettingsPanel,
      })),
  },

  profilePanel: {
    path: "/_panel/profile",
    load: () =>
      import("../Panels/ProfilePanel").then((m) => ({
        default: m.ProfilePanel,
      })),
  },

  habitCreateSheet: {
    path: "/_sheet/habit-create",
    load: () =>
      import("../Sheets/Habits").then((m) => ({
        default: m.HabitCreateSheet,
      })),
  },

  habitEditSheet: {
    path: "/_sheet/habit-edit/:id",
    load: () =>
      import("../Sheets/Habits").then((m) => ({
        default: m.HabitEditSheet,
      })),
  },
};
