import type { PWAFactoryState } from '../StateMachine/globalState';
import { createStateMachine, type StateMachine } from '../StateMachine/dispatch';

export interface InitializeStateMachineResult {
  stateMachine: StateMachine;
}

export let globalState: PWAFactoryState;

type GlobalStateListener = (next: PWAFactoryState) => void;

const listeners = new Set<GlobalStateListener>();

const updateGlobalState = (next: PWAFactoryState) => {
  globalState = next;
  listeners.forEach((listener) => listener(next));
};

export const initializeStateMachine = (): InitializeStateMachineResult => {
  const stateMachine = createStateMachine();
  updateGlobalState(stateMachine.getState());

  stateMachine.subscribe((state) => {
    updateGlobalState(state);
  });

  console.info('[StateMachine v2.0] initialized');

  return { stateMachine };
};

export const onGlobalStateChange = (listener: GlobalStateListener): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};


