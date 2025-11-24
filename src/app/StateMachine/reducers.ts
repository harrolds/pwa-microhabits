import {
  AppLifecyclePhase,
  ManifestModuleState,
  ManifestModuleStatus,
  PanelSlot,
  PanelState,
  PWAFactoryState,
  SheetSlot,
  SheetState,
  initialState,
} from './globalState';

type PanelPayload = { panel: PanelSlot; isOpen: boolean; lockedByModule?: string | null };
type SheetPayload = { sheet: SheetSlot; isOpen: boolean; anchoredTo?: string | null };

export type StateAction =
  | { type: 'LIFECYCLE/SET_PHASE'; payload: { phase: AppLifecyclePhase; error?: string | null } }
  | { type: 'LIFECYCLE/SET_VISIBILITY'; payload: { phase: Exclude<AppLifecyclePhase, 'error'>; timestamp?: number } }
  | { type: 'NAVIGATION/SET_PENDING'; payload: { routeId?: string; params?: Record<string, unknown> } }
  | { type: 'NAVIGATION/RESOLVE_ROUTE'; payload: { routeId: string; params?: Record<string, unknown> } }
  | { type: 'SHELL/SET_PANEL_STATE'; payload: PanelPayload }
  | { type: 'SHELL/SET_SHEET_STATE'; payload: SheetPayload }
  | { type: 'UX/SET_LOADING'; payload: { token: string; active: boolean } }
  | { type: 'UX/SET_DISABLED'; payload: { token: string; active: boolean } }
  | { type: 'MANIFEST/REGISTER_MODULE'; payload: { module: ManifestModuleState } }
  | {
      type: 'MANIFEST/UPDATE_MODULE';
      payload: {
        moduleId: string;
        patch?: Record<string, unknown>;
        status?: ManifestModuleStatus;
        version?: string;
        lastError?: string | null;
      };
    }
  | { type: 'MANIFEST/UNREGISTER_MODULE'; payload: { moduleId: string } };

type TokenStateKey = 'loadingTokens' | 'disabledTokens';

const pushUniqueToken = (tokens: string[], token: string): string[] =>
  tokens.includes(token) ? tokens : [...tokens, token];

const removeToken = (tokens: string[], token: string): string[] => tokens.filter((value) => value !== token);

const updatePanel = (panel: PanelState | undefined, payload: PanelPayload): PanelState => {
  const base: PanelState = panel ?? { isOpen: false };
  return {
    ...base,
    isOpen: payload.isOpen,
    lockedByModule: payload.lockedByModule ?? base.lockedByModule,
    lastToggledAt: Date.now(),
  };
};

const updateSheet = (sheet: SheetState | undefined, payload: SheetPayload): SheetState => {
  const base: SheetState = sheet ?? { isOpen: false };
  return {
    ...base,
    isOpen: payload.isOpen,
    anchoredTo: payload.anchoredTo ?? base.anchoredTo,
    lastToggledAt: Date.now(),
  };
};

export const rootReducer = (state: PWAFactoryState = initialState, action: StateAction): PWAFactoryState => {
  switch (action.type) {
    case 'LIFECYCLE/SET_PHASE':
      return {
        ...state,
        lifecycle: {
          ...state.lifecycle,
          phase: action.payload.phase,
          lastError: action.payload.error ?? undefined,
          resumeCount: action.payload.phase === 'ready' ? state.lifecycle.resumeCount + 1 : state.lifecycle.resumeCount,
        },
      };

    case 'LIFECYCLE/SET_VISIBILITY':
      return {
        ...state,
        lifecycle: {
          ...state.lifecycle,
          phase: action.payload.phase,
          lastVisibilityChange: action.payload.timestamp ?? Date.now(),
        },
      };

    case 'NAVIGATION/SET_PENDING':
      return {
        ...state,
        navigation: {
          ...state.navigation,
          pendingRoute: action.payload.routeId,
          params: action.payload.params ?? state.navigation.params,
        },
      };

    case 'NAVIGATION/RESOLVE_ROUTE':
      return {
        ...state,
        navigation: {
          ...state.navigation,
          currentRoute: action.payload.routeId,
          pendingRoute: undefined,
          params: action.payload.params,
          lastResolvedAt: Date.now(),
          history: [...state.navigation.history, action.payload.routeId].slice(-25),
        },
      };

    case 'SHELL/SET_PANEL_STATE': {
      const panelSlot = action.payload.panel;
      const nextPanel = updatePanel(state.shell.panels.slots[panelSlot], action.payload);
      return {
        ...state,
        shell: {
          ...state.shell,
          panels: {
            ...state.shell.panels,
            slots: {
              ...state.shell.panels.slots,
              [panelSlot]: nextPanel,
            },
          },
        },
      };
    }

    case 'SHELL/SET_SHEET_STATE': {
      const sheetSlot = action.payload.sheet;
      const nextSheet = updateSheet(state.shell.sheets.slots[sheetSlot], action.payload);
      return {
        ...state,
        shell: {
          ...state.shell,
          sheets: {
            ...state.shell.sheets,
            slots: {
              ...state.shell.sheets.slots,
              [sheetSlot]: nextSheet,
            },
          },
        },
      };
    }

    case 'UX/SET_LOADING':
      return {
        ...state,
        ux: {
          ...state.ux,
          loadingTokens: updateTokenArray(state.ux.loadingTokens, action.payload.token, action.payload.active),
        },
      };

    case 'UX/SET_DISABLED':
      return {
        ...state,
        ux: {
          ...state.ux,
          disabledTokens: updateTokenArray(state.ux.disabledTokens, action.payload.token, action.payload.active),
        },
      };

    case 'MANIFEST/REGISTER_MODULE':
      return {
        ...state,
        manifest: {
          modules: {
            ...state.manifest.modules,
            [action.payload.module.id]: action.payload.module,
          },
        },
      };

    case 'MANIFEST/UPDATE_MODULE': {
      const moduleState = state.manifest.modules[action.payload.moduleId];
      if (!moduleState) {
        return state;
      }

      return {
        ...state,
        manifest: {
          modules: {
            ...state.manifest.modules,
            [action.payload.moduleId]: {
              ...moduleState,
              state: action.payload.patch ? { ...moduleState.state, ...action.payload.patch } : moduleState.state,
              status: action.payload.status ?? moduleState.status,
              version: action.payload.version ?? moduleState.version,
              lastError: action.payload.lastError ?? undefined,
            },
          },
        },
      };
    }

    case 'MANIFEST/UNREGISTER_MODULE': {
      const { [action.payload.moduleId]: _, ...remaining } = state.manifest.modules;
      return {
        ...state,
        manifest: {
          modules: remaining,
        },
      };
    }

    default:
      return state;
  }
};

const updateTokenArray = (tokens: string[], token: string, active: boolean): string[] =>
  active ? pushUniqueToken(tokens, token) : removeToken(tokens, token);

