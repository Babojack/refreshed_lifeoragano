import React, { createContext, useState, useContext, useEffect } from "react";
import {
  getFirebaseAuth,
  getFirebaseApp,
} from "@/lib/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null); // name, goal aus Firestore users/{uid}
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const loadProfile = async (uid) => {
    const db = getFirestoreDb();
    if (!db) return {};
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : {};
  };

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setIsLoadingAuth(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        setProfile(await loadProfile(user.uid));
      } else {
        setProfile(null);
      }
      setIsLoadingAuth(false);
    });
    return () => unsub();
  }, []);

  const refreshProfile = async () => {
    if (firebaseUser?.uid) {
      setProfile(await loadProfile(firebaseUser.uid));
    }
  };

  const user = firebaseUser
    ? {
        id: firebaseUser.uid,
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: profile?.name ?? firebaseUser.displayName ?? firebaseUser.email?.split("@")[0] ?? "User",
        goal: profile?.goal ?? "",
        telegram_chat_id: profile?.telegram_chat_id,
        telegram_manager_enabled: profile?.telegram_manager_enabled,
        telegram_manager_time: profile?.telegram_manager_time,
      }
    : null;

  const isAuthenticated = !!firebaseUser;

  const login = async (email, password) => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Firebase nicht konfiguriert");
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email, password, displayName = "") => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Firebase nicht konfiguriert");
    const { user: u } = await createUserWithEmailAndPassword(auth, email, password);
    const db = getFirestoreDb();
    if (db && u) {
      await setDoc(doc(db, "users", u.uid), {
        name: displayName || email?.split("@")[0] || "User",
        goal: "",
        updated_at: new Date(),
      }, { merge: true });
    }
  };

  const logout = async (shouldRedirect = true) => {
    const auth = getFirebaseAuth();
    if (auth) await signOut(auth);
    setFirebaseUser(null);
    setProfile(null);
    if (shouldRedirect && typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  const navigateToLogin = () => {
    if (typeof window !== "undefined") window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        authError: null,
        appPublicSettings: null,
        isLoadingPublicSettings: false,
        login,
        signup,
        logout,
        navigateToLogin,
        refreshProfile,
        checkAppState: () => {},
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
