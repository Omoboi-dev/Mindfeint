/**
 * useAuth.ts — React hook for Firebase auth state + ZeroDev smart wallet.
 *
 * Exposes:
 *   user          — the authenticated Firebase User (or null)
 *   loading       — true while Firebase resolves the initial auth state
 *   walletAddress — the ZeroDev Kernel smart wallet address (empty while loading)
 *   walletLoading — true while the smart wallet is being provisioned
 *   signInWithGoogle() — opens the Google OAuth popup
 *   signOut()          — signs the user out of Firebase
 */

import { useState, useEffect, useCallback } from "react";
import {
  auth,
  signInWithGoogle as firebaseSignIn,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from "./firebase";
import { getSmartWalletAddress } from "./zerodev";

export interface AuthState {
  user: User | null;
  loading: boolean;
  walletAddress: string;
  walletLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState("");
  const [walletLoading, setWalletLoading] = useState(false);

  // Provision the ZeroDev smart wallet whenever a user signs in.
  const provisionWallet = useCallback(async (u: User) => {
    setWalletLoading(true);
    setWalletAddress("");
    try {
      const result = await getSmartWalletAddress(u.uid);
      if (result.status === "ready") {
        setWalletAddress(result.address);
      }
    } finally {
      setWalletLoading(false);
    }
  }, []);

  // Subscribe to Firebase auth state changes.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (u) {
        provisionWallet(u);
      } else {
        setWalletAddress("");
        setWalletLoading(false);
      }
    });
    return unsubscribe;
  }, [provisionWallet]);

  const signInWithGoogle = useCallback(async () => {
    await firebaseSignIn();
    // onAuthStateChanged will fire and handle the rest.
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut();
    setWalletAddress("");
  }, []);

  return { user, loading, walletAddress, walletLoading, signInWithGoogle, signOut };
}
