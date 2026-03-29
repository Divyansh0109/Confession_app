import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { getRandomIdentity } from '../utils/identity';

const CUSTOM_NAME_KEY = '@custom_anon_name';

const ConfessionsContext = createContext(null);

export const ConfessionsProvider = ({ children }) => {
  const [confessions, setConfessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── 1. REAL-TIME LISTENER FOR FIRESTORE ────────────────
  useEffect(() => {
    const q = query(collection(db, 'confessions'), orderBy('timestamp', 'desc'));

    // onSnapshot listens for real-time changes
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const posts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setConfessions(posts);
      setLoading(false);
    }, (error) => {
      console.warn("Firebase fetch error:", error);
      setLoading(false);
    });

    return () => unsubscribe(); // cleanup listener on unmount
  }, []);

  // ── 2. ADD CONFESSION TO FIRESTORE ───────────────────
  const addConfession = async (text, tag) => {
    let authorName;
    try {
      const saved = await AsyncStorage.getItem(CUSTOM_NAME_KEY);
      authorName = saved || getRandomIdentity();
    } catch {
      authorName = getRandomIdentity();
    }

    try {
      const newConfessionRaw = {
        text,
        tag: tag || 'Secrets',
        timestamp: Date.now(),
        reactions: { Love: 0, Funny: 0, Dead: 0, Shocked: 0 },
        commentCount: 0,
        reportCount: 0,
        authorName,
      };

      // Add to Firestore collection (it will auto-update the UI via onSnapshot)
      await addDoc(collection(db, 'confessions'), newConfessionRaw);
    } catch (e) {
      console.warn("Error adding post:", e);
    }
  };

  // ── 3. UPDATE REACTIONS IN FIRESTORE ─────────────────
  const reactToConfession = async (postId, reactionKey, isRemoving) => {
    try {
      const postRef = doc(db, 'confessions', postId);
      const incValue = isRemoving ? -1 : 1;
      
      await updateDoc(postRef, {
        [`reactions.${reactionKey}`]: increment(incValue)
      });
    } catch (e) {
      console.warn("Error updating reaction:", e);
    }
  };

  return (
    <ConfessionsContext.Provider value={{
      confessions,
      setConfessions,
      addConfession,
      reactToConfession,
      loading
    }}>
      {children}
    </ConfessionsContext.Provider>
  );
};

export const useConfessions = () => useContext(ConfessionsContext);
