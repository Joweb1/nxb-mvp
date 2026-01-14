import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { getLiveFixtures } from '../services/api-football';
import {
  updateMatchesInFirestore,
  setLastFetchTimestamp,
  getLastFetchTimestamp,
} from '../services/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [forYou, setForYou] = useState({ leagues: [], teams: [] });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({ ...user, ...userData });
          setFavorites(userData.favorites || []);
          setForYou(userData.forYou || { leagues: [], teams: [] });
        } else {
          setUser(user);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    const TEN_MINUTES_IN_MS = 10 * 60 * 1000;

    const fetchData = async () => {
      const lastFetch = await getLastFetchTimestamp();
      const now = new Date().getTime();

      if (!lastFetch || now - new Date(lastFetch).getTime() > TEN_MINUTES_IN_MS) {
        console.log('Fetching new data from API-Football...');
        try {
          const liveFixtures = await getLiveFixtures();
          await updateMatchesInFirestore(liveFixtures);
          await setLastFetchTimestamp();
          console.log('Data updated successfully.');
        } catch (error) {
          console.error('Error fetching or updating data:', error);
        }
      } else {
        console.log('Data is up to date.');
      }
    };

    fetchData();

    return unsubscribe;
  }, []);

  const signUp = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: userCredential.user.email,
        createdAt: serverTimestamp(),
        favorites: [],
        forYou: { leagues: [], teams: [] },
        wallet: {
          balance: 10000,
          onHold: 0,
        },
      });

      return userCredential;
    } catch (error) {
      throw error;
    }
  };

  const signIn = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logOut = () => {
    return signOut(auth);
  };

  const toggleFavorite = async (matchId) => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    let newFavorites;

    if (favorites.includes(matchId)) {
      newFavorites = favorites.filter(id => id !== matchId);
      await updateDoc(userRef, {
        favorites: arrayRemove(matchId)
      });
    } else {
      newFavorites = [...favorites, matchId];
      await updateDoc(userRef, {
        favorites: arrayUnion(matchId)
      });
    }
    setFavorites(newFavorites);
  };

  const isFavorite = (matchId) => {
    return favorites.includes(matchId);
  };

  const addToForYou = async (item, type) => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const key = type === 'leagues' ? 'forYou.leagues' : 'forYou.teams';
    let newForYou;

    if (forYou && forYou[type] && forYou[type].includes(item)) {
      newForYou = {
        ...forYou,
        [type]: forYou[type].filter(i => i !== item),
      };
      await updateDoc(userRef, {
        [key]: arrayRemove(item)
      });
    } else {
      newForYou = {
        ...forYou,
        [type]: [...(forYou[type] || []), item],
      };
      await updateDoc(userRef, {
        [key]: arrayUnion(item)
      });
    }
    setForYou(newForYou);
  };

  const isForYou = (item, type) => {
    return forYou[type] && forYou[type].includes(item);
  };

  const value = {
    user,
    loading,
    favorites,
    forYou,
    signUp,
    signIn,
    logOut,
    toggleFavorite,
    isFavorite,
    addToForYou,
    isForYou,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
