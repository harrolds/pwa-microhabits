import { getFirestore, type Firestore } from 'firebase/firestore';

import { getFirebaseApp } from './firebase.app';

export const getFirebaseDb = (): Firestore => getFirestore(getFirebaseApp());

