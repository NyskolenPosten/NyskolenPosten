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
  
  // Sjekk om vi kjører på GitHub Pages
  const isGitHubPages = window.location.hostname.includes('github.io');

  useEffect(() => {
    // Først sjekk om vi har en lokal bruker i localStorage
    const innloggetBruker = localStorage.getItem('innloggetBruker');
    const currentUser = localStorage.getItem('currentUser');
    
    let hasLoadedLocalUser = false;
    
    if (innloggetBruker || currentUser) {
      try {
        if (innloggetBruker) {
          const bruker = JSON.parse(innloggetBruker);
          setUser(bruker);
          hasLoadedLocalUser = true;
        } else if (currentUser) {
          const bruker = JSON.parse(currentUser);
          setUser(bruker);
          hasLoadedLocalUser = true;
        }
      } catch (err) {
        console.error('Feil ved parsing av brukerdata:', err);
      }
    }
    
    // Kun fortsett med Supabase-autentisering hvis vi ikke har en lokal bruker
    if (!hasLoadedLocalUser) {
      // Hent gjeldende sesjon
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setUser(session.user);
        }
        setLoading(false);
      });
      
      // Lytt til endringer i autentisering
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
          setUser(session.user);
        } else {
          // Sjekk om vi fortsatt har en lokal bruker før vi setter user til null
          const localUser = localStorage.getItem('innloggetBruker') || localStorage.getItem('currentUser');
          if (!localUser) {
            setUser(null);
          }
        }
        setLoading(false);
      });

      return () => {
        subscription?.unsubscribe();
      };
    } else {
      setLoading(false);
      return () => {}; // tom oppryddingsfunksjon når vi bruker lokal bruker
    }
  }, []);

  // Funksjon for å manuelt sette bruker (for lokal fallback)
  const setAuthUser = (userData) => {
    setUser(userData);
    // Lagre brukeren i begge lagringsformater for å sikre kompatibilitet
    if (userData) {
      localStorage.setItem('innloggetBruker', JSON.stringify(userData));
      localStorage.setItem('currentUser', JSON.stringify({
        uid: userData.id,
        email: userData.email,
        navn: userData.navn
      }));
    }
  };
  
  // Lytt til storage-endringer for å synkronisere brukerstatusen på tvers av faner
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'innloggetBruker') {
        if (e.newValue) {
          try {
            setUser(JSON.parse(e.newValue));
          } catch (err) {
            console.error('Feil ved parsing av brukerdata fra storage event:', err);
          }
        } else {
          setUser(null);
        }
      } else if (e.key === 'currentUser' && !localStorage.getItem('innloggetBruker')) {
        if (e.newValue) {
          try {
            const userData = JSON.parse(e.newValue);
            setUser({
              id: userData.uid,
              email: userData.email,
              navn: userData.navn
            });
          } catch (err) {
            console.error('Feil ved parsing av brukerdata fra storage event:', err);
          }
        } else {
          setUser(null);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const signIn = async (email, password) => {
    setAuthError('');
    try {
      // For GitHub Pages, håndter innlogging lokalt
      if (isGitHubPages) {
        const brukere = JSON.parse(localStorage.getItem('brukere') || '[]');
        const bruker = brukere.find(b => b.email === email);
        
        if (bruker && bruker.password === password) {
          // Lagre innlogget bruker i localStorage
          setAuthUser(bruker);
          return true;
        } else {
          setAuthError('Feil e-post eller passord.');
          return false;
        }
      }
      
      // Ellers bruk Supabase
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setAuthError(oversettFeilmelding(error.message));
        return false;
      }
      return true;
    } catch (error) {
      setAuthError('En feil oppstod under innlogging. Vennligst prøv igjen senere.');
      return false;
    }
  };

  const signUp = async (email, password, navn, klasse) => {
    setAuthError('');
    try {
      // For GitHub Pages, lag brukeren lokalt
      if (isGitHubPages) {
        const brukere = JSON.parse(localStorage.getItem('brukere') || '[]');
        
        // Sjekk om e-postadressen er i bruk
        if (brukere.some(b => b.email === email)) {
          setAuthError('Denne e-postadressen er allerede registrert.');
          return false;
        }
        
        // Opprett ny bruker
        const nyBruker = {
          id: 'local-' + Date.now(),
          email: email,
          password: password, // NB: Dette er ikke sikkert, men vi lagrer kun lokalt
          navn: navn || email.split('@')[0],
          rolle: 'bruker',
          godkjent: false,
          klasse: klasse || null,
          opprettet: new Date().toISOString()
        };
        
        // Legg til i brukerlisten
        brukere.push(nyBruker);
        localStorage.setItem('brukere', JSON.stringify(brukere));
        
        // Logg inn brukeren med en gang
        setAuthUser(nyBruker);
        
        return true;
      }
      
      // Ellers bruk Supabase
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: navn,
            klasse: klasse
          }
        }
      });
      
      if (error) {
        setAuthError(oversettFeilmelding(error.message));
        return false;
      }
      
      return true;
    } catch (error) {
      setAuthError('En feil oppstod under registrering. Vennligst prøv igjen senere.');
      return false;
    }
  };

  const signOut = async () => {
    setAuthError('');
    try {
      // Fjern lokal bruker
      localStorage.removeItem('innloggetBruker');
      localStorage.removeItem('currentUser');
      setUser(null);
      
      // Hvis ikke GitHub Pages, prøv Supabase utlogging også
      if (!isGitHubPages) {
        const { error } = await supabase.auth.signOut();
        if (error) {
          setAuthError(oversettFeilmelding(error.message));
          return false;
        }
      }
      
      return true;
    } catch (error) {
      setAuthError('En feil oppstod under utlogging.');
      // Forsøk å logge ut lokalt uansett
      localStorage.removeItem('innloggetBruker');
      localStorage.removeItem('currentUser');
      setUser(null);
      return true; // Returnerer true siden brukeren er logget ut lokalt uansett
    }
  };

  const resetPassword = async (email) => {
    setAuthError('');
    if (isGitHubPages) {
      setAuthError('Tilbakestilling av passord er ikke tilgjengelig i offline-modus.');
      return false;
    }
    
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      setAuthError(oversettFeilmelding(error.message));
      return false;
    }
    return true;
  };

  const value = {
    user,
    loading,
    authError,
    signIn,
    signUp,
    signOut,
    resetPassword,
    setAuthUser, // Eksporter denne for å la andre komponenter oppdatere brukerstatus
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 