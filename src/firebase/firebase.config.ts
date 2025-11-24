import type { FirebaseOptions } from 'firebase/app';

type FirebaseEnvKey =
  | 'VITE_FIREBASE_API_KEY'
  | 'VITE_FIREBASE_AUTH_DOMAIN'
  | 'VITE_FIREBASE_PROJECT_ID'
  | 'VITE_FIREBASE_STORAGE_BUCKET'
  | 'VITE_FIREBASE_MESSAGING_SENDER_ID'
  | 'VITE_FIREBASE_APP_ID'
  | 'VITE_FIREBASE_MEASUREMENT_ID';

const readEnv = (key: FirebaseEnvKey): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env && key in import.meta.env) {
    return import.meta.env[key] ?? '';
  }

  if (typeof process !== 'undefined' && process.env && key in process.env) {
    return process.env[key] ?? '';
  }

  return '';
};

export const firebaseConfig: FirebaseOptions = {
  apiKey: readEnv('VITE_FIREBASE_API_KEY'),
  authDomain: readEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: readEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: readEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: readEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: readEnv('VITE_FIREBASE_APP_ID'),
  measurementId: readEnv('VITE_FIREBASE_MEASUREMENT_ID') || undefined,
};

export const isFirebaseConfigReady = (): boolean =>
  Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId,
  );

export const getFirebaseConfig = (): FirebaseOptions => {
  if (!isFirebaseConfigReady()) {
    console.warn(
      'Firebase configuration variables are not fully defined. Populate VITE_FIREBASE_* env vars before enabling Firebase services.',
    );
  }

  return firebaseConfig;
};

