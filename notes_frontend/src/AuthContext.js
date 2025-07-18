import React, { createContext, useContext, useEffect, useState } from "react";

/**
 * PUBLIC_INTERFACE
 * AuthContext provides user and auth helpers (login/logout).
 * Must be wrapped around components that require authentication.
 */

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ supabase, children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      if (mounted) {
        setUser(data.user || null);
        setInitializing(false);
      }
    }
    loadUser();
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });
    return () => { mounted = false; listener?.subscription?.unsubscribe?.(); };
  }, [supabase]);

  // PUBLIC_INTERFACE
  // Call to sign out the user from Supabase
  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, initializing, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
