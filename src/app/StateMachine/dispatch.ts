import { PWAFactoryState, initialState } from './globalState';
import { StateAction, rootReducer } from './reducers';

export type SyncAction = StateAction;
export type AsyncAction = (api: DispatchAPI) => Promise<void> | void;
export type AnyAction = SyncAction | AsyncAction;

export type Dispatch = (action: AnyAction) => Promise<PWAFactoryState>;

export interface DispatchAPI {
  getState: () => PWAFactoryState;
  dispatch: Dispatch;
}

export type Listener = (state: PWAFactoryState, action: StateAction) => void;

export interface StateMachine {
  getState: () => PWAFactoryState;
  dispatch: Dispatch;
  subscribe: (listener: Listener) => () => void;
}

export interface CreateStateMachineOptions {
  reducer?: typeof rootReducer;
  preloadedState?: PWAFactoryState;
}

export const createStateMachine = (options?: CreateStateMachineOptions): StateMachine => {
  const reducer = options?.reducer ?? rootReducer;
  let state: PWAFactoryState = options?.preloadedState ?? initialState;
  const listeners = new Set<Listener>();

  const notify = (action: StateAction): void => {
    listeners.forEach((listener) => listener(state, action));
  };

  const dispatch: Dispatch = async (action: AnyAction) => {
    if (typeof action === 'function') {
      await action({ getState, dispatch });
      return state;
    }

    const nextState = reducer(state, action);
    if (nextState !== state) {
      state = nextState;
      notify(action);
    }
    return state;
  };

  const getState = (): PWAFactoryState => state;

  const subscribe = (listener: Listener): (() => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  return {
    getState,
    dispatch,
    subscribe,
  };
};

