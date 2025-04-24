import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sjekk om brukeren er logget inn
    const session = supabase.auth.getSession();
    setUser(session?.user ?? null);
    setLoading(false);

    // Lytt til endringer i autentisering
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    signUp: async (email, password, fullName) => {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              rolle: 'bruker'
            }
          }
        });
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Feil ved registrering:', error);
        throw error;
      }
    },
    signIn: async (email, password) => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Feil ved innlogging:', error);
        throw error;
      }
    },
    signOut: async () => {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      } catch (error) {
        console.error('Feil ved utlogging:', error);
        throw error;
      }
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth må brukes innenfor en AuthProvider');
  }
  return context;
} 