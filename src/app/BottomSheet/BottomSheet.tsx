import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";
import clsx from "clsx";
import styles from "./BottomSheet.module.css";
import {
  setBottomSheetDrag,
  setBottomSheetLock,
  setBottomSheetSnap,
  setBottomSheetVisibility,
} from "../StateMachine/actions";
import { appStore, BottomSheetSnapPoint, useAppState } from "../StateMachine/state";
import { lockBodyScroll, unlockBodyScroll } from "../utils/dom";

const SNAP_POINTS: BottomSheetSnapPoint[] = [0.25, 0.55, 1];

type BottomSheetProps = {
  children: ReactNode;
};

export const BottomSheet = ({ children }: BottomSheetProps) => {
  const initialYRef = useRef<number | null>(null);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const sheetState = useAppState((state) => state.bottomSheet);

  const translateY = useMemo(() => {
    if (!sheetState.snapPoint) {
      return 100 + sheetState.dragOffset;
    }
    const snapPercentage = 100 - sheetState.snapPoint * 100;
    return Math.max(0, snapPercentage + sheetState.dragOffset);
  }, [sheetState.dragOffset, sheetState.snapPoint]);

  useEffect(() => {
    if (sheetState.visible || sheetState.snapPoint) {
      lockBodyScroll();
    } else {
      unlockBodyScroll();
    }
  }, [sheetState.visible, sheetState.snapPoint]);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const handleViewport = () => {
      const offset = window.innerHeight - viewport.height;
      setKeyboardOffset(offset > 0 ? offset : 0);
    };
    viewport.addEventListener('resize', handleViewport);
    viewport.addEventListener('scroll', handleViewport);
    return () => {
      viewport.removeEventListener('resize', handleViewport);
      viewport.removeEventListener('scroll', handleViewport);
    };
  }, []);

  const finishDrag = () => {
    const offset = sheetState.dragOffset;
    appStore.dispatch(setBottomSheetDrag(0));
    if (offset > 25) {
      appStore.dispatch(setBottomSheetSnap(null));
      appStore.dispatch(setBottomSheetVisibility(false));
      return;
    }
    const current = sheetState.snapPoint ?? 0.25;
    const resolved = resolveSnap(current, offset);
    appStore.dispatch(setBottomSheetSnap(resolved));
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (sheetState.locked) {
      return;
    }
    initialYRef.current = event.clientY;
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
    appStore.dispatch(setBottomSheetLock(true));
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (initialYRef.current == null) return;
    const delta = event.clientY - initialYRef.current;
    if (delta > 0) {
      appStore.dispatch(setBottomSheetDrag(delta * 0.25));
    } else {
      appStore.dispatch(setBottomSheetDrag(delta * 0.1));
    }
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (initialYRef.current == null) return;
    (event.target as HTMLElement).releasePointerCapture(event.pointerId);
    initialYRef.current = null;
    appStore.dispatch(setBottomSheetLock(false));
    finishDrag();
  };

  return (
    <div
      className={clsx(styles.sheetRoot, {
        [styles.sheetVisible]: sheetState.visible || !!sheetState.snapPoint,
      })}
      style={{
        transform: `translateY(calc(${translateY}% + ${keyboardOffset}px))`,
      }}
      aria-hidden={!sheetState.visible && !sheetState.snapPoint}
    >
      <div
        className={styles.sheetBody}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        role="dialog"
      >
        <div className={styles.dragHandle} />
        {children}
      </div>
    </div>
  );
};

const resolveSnap = (current: BottomSheetSnapPoint, delta: number): BottomSheetSnapPoint => {
  const currentIndex = SNAP_POINTS.indexOf(current);
  if (delta < -15 && currentIndex < SNAP_POINTS.length - 1) {
    return SNAP_POINTS[currentIndex + 1];
  }
  if (delta > 15 && currentIndex > 0) {
    return SNAP_POINTS[currentIndex - 1];
  }
  return current;
};

