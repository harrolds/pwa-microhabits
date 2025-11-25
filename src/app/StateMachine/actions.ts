import { BottomSheetSnapPoint, ToastIntent } from './state';

export type AppAction =
  | { type: 'OPEN_LEFT_PANEL' }
  | { type: 'CLOSE_LEFT_PANEL' }
  | { type: 'OPEN_RIGHT_PANEL' }
  | { type: 'CLOSE_RIGHT_PANEL' }
  | { type: 'SET_BOTTOM_SHEET_SNAP'; snapPoint: BottomSheetSnapPoint | null }
  | { type: 'SET_BOTTOM_SHEET_VISIBILITY'; visible: boolean }
  | { type: 'SET_BOTTOM_SHEET_LOCK'; locked: boolean }
  | { type: 'SET_BOTTOM_SHEET_DRAG'; dragOffset: number }
  | {
      type: 'PUSH_TOAST';
      toast: { id: string; message: string; intent: ToastIntent; duration: number };
    }
  | { type: 'SHIFT_TOAST' }
  | { type: 'SET_OVERLAY'; active: boolean; reason: 'panel' | 'sheet' | 'custom' | null };

export const openLeftPanel = (): AppAction => ({ type: 'OPEN_LEFT_PANEL' });
export const closeLeftPanel = (): AppAction => ({ type: 'CLOSE_LEFT_PANEL' });
export const openRightPanel = (): AppAction => ({ type: 'OPEN_RIGHT_PANEL' });
export const closeRightPanel = (): AppAction => ({ type: 'CLOSE_RIGHT_PANEL' });

export const setBottomSheetSnap = (snapPoint: BottomSheetSnapPoint | null): AppAction => ({
  type: 'SET_BOTTOM_SHEET_SNAP',
  snapPoint,
});

export const setBottomSheetVisibility = (visible: boolean): AppAction => ({
  type: 'SET_BOTTOM_SHEET_VISIBILITY',
  visible,
});

export const setBottomSheetLock = (locked: boolean): AppAction => ({
  type: 'SET_BOTTOM_SHEET_LOCK',
  locked,
});

export const setBottomSheetDrag = (dragOffset: number): AppAction => ({
  type: 'SET_BOTTOM_SHEET_DRAG',
  dragOffset,
});

export const pushToast = (
  message: string,
  intent: ToastIntent = 'info',
  duration = 3500,
): AppAction => ({
  type: 'PUSH_TOAST',
  toast: {
    id: crypto.randomUUID(),
    message,
    intent,
    duration,
  },
});

export const shiftToast = (): AppAction => ({ type: 'SHIFT_TOAST' });

export const setOverlay = (
  active: boolean,
  reason: 'panel' | 'sheet' | 'custom' | null,
): AppAction => ({
  type: 'SET_OVERLAY',
  active,
  reason,
});

