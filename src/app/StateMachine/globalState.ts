/**
 * Global state definitions for the generic PWA Factory state machine (v2.0).
 * This file intentionally avoids product-specific fields so it can be reused
 * across multiple PWA Factory apps.
 */

export type AppLifecyclePhase = 'booting' | 'ready' | 'background' | 'suspended' | 'error';

export interface AppLifecycleState {
  phase: AppLifecyclePhase;
  launchedAt: number;
  lastVisibilityChange?: number;
  lastError?: string;
  resumeCount: number;
}

export type PanelSlot = 'leftPanel' | 'rightPanel';
export type SheetSlot = 'bottomSheet';

export interface PanelState {
  isOpen: boolean;
  lockedByModule?: string;
  lastToggledAt?: number;
}

export interface SheetState {
  isOpen: boolean;
  anchoredTo?: string;
  lastToggledAt?: number;
}

export interface PanelsState {
  slots: Record<PanelSlot, PanelState>;
}

export interface SheetsState {
  slots: Record<SheetSlot, SheetState>;
}

export interface ShellState {
  panels: PanelsState;
  sheets: SheetsState;
  activeFocusTarget?: string;
}

export interface NavigationState {
  currentRoute?: string;
  pendingRoute?: string;
  params?: Record<string, unknown>;
  history: string[];
  lastResolvedAt?: number;
}

export interface UXState {
  loadingTokens: string[];
  disabledTokens: string[];
}

export type ManifestModuleStatus = 'registered' | 'activated' | 'error';

export interface ManifestModuleState {
  id: string;
  status: ManifestModuleStatus;
  version?: string;
  state: Record<string, unknown>;
  lastError?: string;
}

export interface ManifestState {
  modules: Record<string, ManifestModuleState>;
}

export interface PWAFactoryState {
  lifecycle: AppLifecycleState;
  shell: ShellState;
  navigation: NavigationState;
  ux: UXState;
  manifest: ManifestState;
}

const defaultPanelState = (): PanelState => ({
  isOpen: false,
});

const defaultSheetState = (): SheetState => ({
  isOpen: false,
});

export const initialState: PWAFactoryState = {
  lifecycle: {
    phase: 'booting',
    launchedAt: Date.now(),
    resumeCount: 0,
  },
  shell: {
    panels: {
      slots: {
        leftPanel: defaultPanelState(),
        rightPanel: defaultPanelState(),
      },
    },
    sheets: {
      slots: {
        bottomSheet: defaultSheetState(),
      },
    },
  },
  navigation: {
    history: [],
  },
  ux: {
    loadingTokens: [],
    disabledTokens: [],
  },
  manifest: {
    modules: {},
  },
};
