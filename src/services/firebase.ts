import { initializeApp } from 'firebase/app';
import { collection, getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  //@ts-expect-error: env might give error
  apiKey: import.meta.env.VITE_API_KEY,
  //@ts-expect-error: env might give error
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  //@ts-expect-error: env might give error
  databaseURL: import.meta.env.VITE_DATABASE_URL,
  //@ts-expect-error: env might give error
  projectId: import.meta.env.VITE_PROJECT_ID,
  //@ts-expect-error: env might give error
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  //@ts-expect-error: env might give error
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  //@ts-expect-error: env might give error
  appId: import.meta.env.VITE_APP_ID,
  //@ts-expect-error: env might give error
  messurementId: import.meta.env.VITE_MEASUREMENT_ID,
};
const app = await initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
export const analytics = getAnalytics(app);

export const userCollection = collection(db, 'users');
export const userApplicationCollection = collection(db, 'user-applications');
export const eventCollection = collection(db, 'events');
export const jobCollection = collection(db, 'jobs');
export const employerCollection = collection(db, 'employers');
export const usersChatCollection = collection(db, 'usersChat');
export const chatCollection = collection(db, 'chats');
export const partnerCollection = collection(db, 'partners');
export const emailCollection = collection(db, 'emails');
export const messageCollection = collection(db, 'board-messages');
export const classCollection = collection(db, 'classes');
export const unassignedStudents = collection(db, 'unassigned-students');
export const sessionCollection = collection(db, 'sessions');
export const todoCollection = collection(db, 'todos');
export const programCollection = collection(db, 'programs');
