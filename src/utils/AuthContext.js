// src/utils/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';

// Opprett en kontekst for autentisering
const AuthContext = createContext(null);

// AuthProvider-komponent for å omgi applikasjonen
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hent bruker fra localStorage ved oppstart
  useEffect(() => {
    const storedUser = localStorage.getItem('innloggetBruker');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Feil ved parsing av brukerdata:', e);
        localStorage.removeItem('innloggetBruker');
      }
    }
    setLoading(false);
  }, []);

  // Logg inn bruker
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('innloggetBruker', JSON.stringify(userData));
  };

  // Logg ut bruker
  const logout = () => {
    setUser(null);
    localStorage.removeItem('innloggetBruker');
  };

  // Oppdater bruker
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('innloggetBruker', JSON.stringify(userData));
  };

  // Sjekk om bruker er autentisert
  const isAuthenticated = () => {
    return user !== null;
  };

  // Kontekstverdien som eksporteres
  const value = {
    user,
    login,
    logout,
    updateUser,
    isAuthenticated,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for å bruke auth-konteksten
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth må brukes innenfor en AuthProvider');
  }
  return context;
};

export default AuthContext; 