import {
  closeLeftPanel,
  closeRightPanel,
  openLeftPanel,
  openRightPanel,
  setBottomSheetSnap,
  setBottomSheetVisibility,
  setOverlay,
} from '../StateMachine/actions';
import { appStore, useAppState } from '../StateMachine/state';

export const PanelController = {
  openLeft() {
    appStore.dispatch(openLeftPanel());
  },
  openRight() {
    appStore.dispatch(openRightPanel());
  },
  closeAll() {
    appStore.dispatch(closeLeftPanel());
    appStore.dispatch(closeRightPanel());
    appStore.dispatch(setBottomSheetSnap(null));
    appStore.dispatch(setBottomSheetVisibility(false));
    appStore.dispatch(setOverlay(false, null));
  },
};

export const usePanelState = () =>
  useAppState((state) => ({
    leftOpen: state.panels.leftOpen,
    rightOpen: state.panels.rightOpen,
  }));

