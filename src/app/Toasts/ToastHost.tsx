import clsx from 'clsx';
import { useEffect } from 'react';
import styles from './ToastHost.module.css';
import { shiftToast } from '../StateMachine/actions';
import { appStore, useAppState } from '../StateMachine/state';

export const ToastHost = () => {
  const toasts = useAppState((state) => state.toasts);

  useEffect(() => {
    if (!toasts.length) return;
    const timeout = setTimeout(() => appStore.dispatch(shiftToast()), toasts[0].duration);
    return () => clearTimeout(timeout);
  }, [toasts]);

  return (
    <div className={styles.toastHost} aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={clsx(styles.toast, styles[toast.intent])}>
          {toast.message}
        </div>
      ))}
    </div>
  );
};

