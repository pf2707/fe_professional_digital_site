"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut, type User } from "firebase/auth";
import { clientAuth, firebaseConfigured } from "@/lib/firebase-client";

type AuthState = {
  user: User | null;
  loading: boolean; // true until Firebase knows whether someone is signed in
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(firebaseConfigured);

  useEffect(() => {
    if (!firebaseConfigured) return;
    return onAuthStateChanged(clientAuth(), (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const signOut = () => firebaseSignOut(clientAuth());
  return <Ctx.Provider value={{ user, loading, signOut }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const auth = useContext(Ctx);
  if (!auth) throw new Error("useAuth must be used inside <AuthProvider>.");
  return auth;
}

// The signed-in user. Only use under <RequireAuth>, which renders nothing until there is one.
export function useUser() {
  const { user } = useAuth();
  if (!user) throw new Error("useUser needs a signed-in user: wrap the page in <RequireAuth>.");
  return user;
}
