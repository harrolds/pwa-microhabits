import { useCallback } from 'react';
import { pushToast } from '../StateMachine/actions';
import { useAppDispatch } from '../StateMachine/state';

export const useToast = () => {
  const dispatch = useAppDispatch();

  const showToast = useCallback(
    (message: string, intent: 'info' | 'success' | 'error' = 'info') => {
      dispatch(pushToast(message, intent));
    },
    [dispatch],
  );

  return { showToast };
};

