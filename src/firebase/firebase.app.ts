import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';

import { getFirebaseConfig } from './firebase.config';

const bootstrapFirebaseApp = (): FirebaseApp => {
  if (getApps().length) {
    return getApp();
  }

  return initializeApp(getFirebaseConfig());
};

export const getFirebaseApp = (): FirebaseApp => bootstrapFirebaseApp();

