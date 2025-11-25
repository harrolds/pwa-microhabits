import { AppAction } from './actions';
import { AppState, initialAppState } from './state';

export const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'OPEN_LEFT_PANEL':
      return {
        ...state,
        panels: { ...state.panels, leftOpen: true, rightOpen: false },
        overlays: { active: true, reason: 'panel' },
      };
    case 'CLOSE_LEFT_PANEL':
      return {
        ...state,
        panels: { ...state.panels, leftOpen: false },
        overlays: deriveOverlayState({ ...state, panels: { ...state.panels, leftOpen: false } }),
      };
    case 'OPEN_RIGHT_PANEL':
      return {
        ...state,
        panels: { ...state.panels, rightOpen: true, leftOpen: false },
        overlays: { active: true, reason: 'panel' },
      };
    case 'CLOSE_RIGHT_PANEL':
      return {
        ...state,
        panels: { ...state.panels, rightOpen: false },
        overlays: deriveOverlayState({ ...state, panels: { ...state.panels, rightOpen: false } }),
      };
    case 'SET_BOTTOM_SHEET_SNAP':
      return {
        ...state,
        bottomSheet: { ...state.bottomSheet, snapPoint: action.snapPoint },
        overlays:
          action.snapPoint === null
            ? deriveOverlayState({ ...state, bottomSheet: { ...state.bottomSheet, snapPoint: null } })
            : { active: true, reason: 'sheet' },
      };
    case 'SET_BOTTOM_SHEET_VISIBILITY':
      return {
        ...state,
        bottomSheet: { ...state.bottomSheet, visible: action.visible },
        overlays: action.visible ? { active: true, reason: 'sheet' } : deriveOverlayState({
          ...state,
          bottomSheet: { ...state.bottomSheet, visible: action.visible },
        }),
      };
    case 'SET_BOTTOM_SHEET_LOCK':
      return {
        ...state,
        bottomSheet: { ...state.bottomSheet, locked: action.locked },
      };
    case 'SET_BOTTOM_SHEET_DRAG':
      return {
        ...state,
        bottomSheet: { ...state.bottomSheet, dragOffset: action.dragOffset },
      };
    case 'PUSH_TOAST':
      return {
        ...state,
        toasts: [...state.toasts, action.toast],
      };
    case 'SHIFT_TOAST':
      return {
        ...state,
        toasts: state.toasts.slice(1),
      };
    case 'SET_OVERLAY':
      return {
        ...state,
        overlays: { active: action.active, reason: action.reason },
      };
    default:
      return state;
  }
};

const deriveOverlayState = (state: AppState) => {
  if (state.panels.leftOpen || state.panels.rightOpen) {
    return { active: true, reason: 'panel' as const };
  }
  if (state.bottomSheet.visible || state.bottomSheet.snapPoint) {
    return { active: true, reason: 'sheet' as const };
  }
  return { active: false, reason: null };
};

