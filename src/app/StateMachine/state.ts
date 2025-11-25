import { useMemo, useSyncExternalStore } from 'react';
import { AppAction } from './actions';
import { appReducer } from './reducer';

export type PanelState = {
  leftOpen: boolean;
  rightOpen: boolean;
};

export type BottomSheetSnapPoint = 0.25 | 0.55 | 1;

export type BottomSheetState = {
  snapPoint: BottomSheetSnapPoint | null;
  dragOffset: number;
  locked: boolean;
  visible: boolean;
};

export type ToastIntent = 'info' | 'success' | 'error';

export type Toast = {
  id: string;
  message: string;
  intent: ToastIntent;
  duration: number;
};

export type OverlayState = {
  active: boolean;
  reason: 'panel' | 'sheet' | 'custom' | null;
};

export type AppState = {
  panels: PanelState;
  bottomSheet: BottomSheetState;
  toasts: Toast[];
  overlays: OverlayState;
};

export const initialAppState: AppState = {
  panels: {
    leftOpen: false,
    rightOpen: false,
  },
  bottomSheet: {
    snapPoint: null,
    dragOffset: 0,
    locked: false,
    visible: false,
  },
  toasts: [],
  overlays: {
    active: false,
    reason: null,
  },
};

type Listener = () => void;

class AppStore {
  private state: AppState = initialAppState;
  private listeners = new Set<Listener>();

  getState(): AppState {
    return this.state;
  }

  dispatch(action: AppAction): void {
    this.state = appReducer(this.state, action);
    this.listeners.forEach((listener) => listener());
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const appStore = new AppStore();

export const useAppState = <Selected,>(
  selector: (state: AppState) => Selected,
): Selected => {
  return useSyncExternalStore(
    (listener) => appStore.subscribe(listener),
    () => selector(appStore.getState()),
    () => selector(appStore.getState()),
  );
};

export const useAppDispatch = () => {
  return useMemo(() => appStore.dispatch.bind(appStore), []);
};

