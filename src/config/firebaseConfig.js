import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBMnwX2DpCm8GIxrdv8gnAqIJ6ZLp_fxDk",
  authDomain: "confessionapp-80a59.firebaseapp.com",
  projectId: "confessionapp-80a59",
  storageBucket: "confessionapp-80a59.firebasestorage.app",
  messagingSenderId: "1089188440259",
  appId: "1:1089188440259:web:718498578a397deaf05a76",
};

// ── Prevent re-initialization on hot reload ──────────────────────
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// ── Firestore with long-polling (required for React Native / Expo Go)
// Firebase uses gRPC streaming by default which does NOT work in
// Expo Go. experimentalForceLongPolling switches it to plain HTTP.
let db;
try {
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  });
} catch {
  // Already initialized (hot reload case)
  db = getFirestore(app);
}

export { db };
export default app;
