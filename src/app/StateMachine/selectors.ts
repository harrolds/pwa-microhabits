import {
  AppLifecyclePhase,
  ManifestModuleState,
  PanelSlot,
  PWAFactoryState,
  SheetSlot,
} from './globalState';

export const selectLifecyclePhase = (state: PWAFactoryState): AppLifecyclePhase => state.lifecycle.phase;

export const selectLifecycle = (state: PWAFactoryState) => state.lifecycle;

export const selectNavigation = (state: PWAFactoryState) => state.navigation;

export const selectCurrentRoute = (state: PWAFactoryState) => state.navigation.currentRoute;

export const selectPendingRoute = (state: PWAFactoryState) => state.navigation.pendingRoute;

export const selectRouteHistory = (state: PWAFactoryState) => state.navigation.history;

export const selectIsPanelOpen =
  (panel: PanelSlot) =>
  (state: PWAFactoryState): boolean =>
    Boolean(state.shell.panels.slots[panel]?.isOpen);

export const selectPanelState =
  (panel: PanelSlot) =>
  (state: PWAFactoryState) =>
    state.shell.panels.slots[panel];

export const selectIsSheetOpen =
  (sheet: SheetSlot) =>
  (state: PWAFactoryState): boolean =>
    Boolean(state.shell.sheets.slots[sheet]?.isOpen);

export const selectSheetState =
  (sheet: SheetSlot) =>
  (state: PWAFactoryState) =>
    state.shell.sheets.slots[sheet];

export const selectLoadingTokens = (state: PWAFactoryState) => state.ux.loadingTokens;

export const selectDisabledTokens = (state: PWAFactoryState) => state.ux.disabledTokens;

export const selectIsLoading =
  (token: string) =>
  (state: PWAFactoryState): boolean =>
    state.ux.loadingTokens.includes(token);

export const selectIsDisabled =
  (token: string) =>
  (state: PWAFactoryState): boolean =>
    state.ux.disabledTokens.includes(token);

export const selectManifestModules = (state: PWAFactoryState): ManifestModuleState[] =>
  Object.values(state.manifest.modules);

export const selectModuleState =
  (moduleId: string) =>
  (state: PWAFactoryState): ManifestModuleState | undefined =>
    state.manifest.modules[moduleId];

