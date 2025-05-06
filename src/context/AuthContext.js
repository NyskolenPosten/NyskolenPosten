import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

const AuthContext = createContext();

function oversettFeilmelding(feil) {
  if (!feil) return '';
  if (feil.includes('Failed to fetch')) return 'Kunne ikke koble til serveren. Sjekk internettforbindelsen.';
  if (feil.includes('Invalid login credentials')) return 'Feil e-post eller passord.';
  if (feil.includes('User already registered')) return 'Brukeren er allerede registrert.';
  if (feil.includes('Email not confirmed')) return 'E-posten er ikke bekreftet. Sjekk innboksen din.';
  if (feil.includes('Password should be at least')) return 'Passordet er for kort.';
  if (feil.includes('network error')) return 'Nettverksfeil. Prøv igjen.';
  if (feil.includes('No user found')) return 'Ingen bruker funnet med denne e-posten.';
  if (feil.includes('Email is invalid')) return 'E-postadressen er ugyldig.';
  if (feil.includes('Password is required')) return 'Passord må fylles ut.';
  if (feil.includes('Email is required')) return 'E-post må fylles ut.';
  // Legg til flere oversettelser etter behov
  return 'En ukjent feil oppstod. Prøv igjen senere.';
}

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    // Sjekk om brukeren er logget inn når applikasjonen starter
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Hent gjeldende sesjon
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    setAuthError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(oversettFeilmelding(error.message));
    return !error;
  };

  const signUp = async (email, password) => {
    setAuthError('');
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setAuthError(oversettFeilmelding(error.message));
    return !error;
  };

  const signOut = async () => {
    setAuthError('');
    const { error } = await supabase.auth.signOut();
    if (error) setAuthError(oversettFeilmelding(error.message));
    return !error;
  };

  const resetPassword = async (email) => {
    setAuthError('');
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) setAuthError(oversettFeilmelding(error.message));
    return !error;
  };

  const value = {
    user,
    loading,
    authError,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 