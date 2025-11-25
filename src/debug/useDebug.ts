// src/debug/useDebug.ts
import { useEffect } from 'react';

interface DebugOptions {
  name: string;
  state?: any;
  enabled?: boolean;
}

export function useDebug({ name, state, enabled = true }: DebugOptions) {
  useEffect(() => {
    if (!enabled) return;
    console.log(
      `%c[DEBUG] ${name}`,
      'color:#4CAF50;font-weight:bold;',
      state ?? ''
    );
  }, [name, state, enabled]);
}
