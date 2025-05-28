import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

const AuthContext = createContext();

function oversettFeilmelding(feil) {
  if (!feil) return '';
  if (feil.includes('Failed to fetch')) return 'Kunne ikke koble til serveren. Sjekk internettforbindelsen.';
  if (feil.includes('network error')) return 'Nettverksfeil. Sjekk internettforbindelsen og prøv igjen.';
  if (feil.includes('timeout') || feil.includes('timed out')) return 'Forespørselen tok for lang tid. Sjekk internettforbindelsen.';
  if (feil.includes('No connection to server')) return 'Ingen tilkobling til serveren. Sjekk internettforbindelsen.';
  if (feil.includes('Tilkoblingen tok for lang tid')) return 'Tilkoblingen tok for lang tid. Sjekk internettforbindelsen.';
  if (feil.includes('Ingen internettforbindelse')) return 'Ingen internettforbindelse. Sjekk nettverkstilkoblingen.';
  if (feil.includes('Invalid login credentials')) return 'Feil e-post eller passord.';
  if (feil.includes('User already registered')) return 'Brukeren er allerede registrert.';
  if (feil.includes('Email not confirmed')) return 'E-posten er ikke bekreftet. Sjekk innboksen din.';
  if (feil.includes('Password should be at least')) return 'Passordet er for kort.';
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
          // Valider at brukerobjektet inneholder nødvendige felter
          if (bruker && bruker.id && bruker.email && bruker.navn && typeof bruker === 'object') {
            console.log('Lastet bruker fra innloggetBruker:', bruker.email);
            setUser(bruker);
            hasLoadedLocalUser = true;
          } else {
            // Fjern ugyldige brukerdata
            console.warn('Ugyldige brukerdata funnet i innloggetBruker, fjerner data');
            localStorage.removeItem('innloggetBruker');
          }
        } else if (currentUser) {
          const bruker = JSON.parse(currentUser);
          // Valider at brukerobjektet inneholder nødvendige felter
          if (bruker && (bruker.id || bruker.uid) && (bruker.email || bruker.displayName || bruker.navn) && typeof bruker === 'object') {
            // Konverter til standard brukerformat
            const standardisertBruker = {
              id: bruker.id || bruker.uid,
              email: bruker.email || '',
              navn: bruker.navn || bruker.displayName || bruker.email?.split('@')[0] || 'Bruker'
            };
            console.log('Lastet bruker fra currentUser:', standardisertBruker.email);
            setUser(standardisertBruker);
            // Synkroniser til innloggetBruker-formatet for konsistens
            localStorage.setItem('innloggetBruker', JSON.stringify(standardisertBruker));
            hasLoadedLocalUser = true;
          } else {
            // Fjern ugyldige brukerdata
            console.warn('Ugyldige brukerdata funnet i currentUser, fjerner data');
            localStorage.removeItem('currentUser');
          }
        }
      } catch (err) {
        console.error('Feil ved parsing av brukerdata:', err);
        // Ved parse-feil, fjern lokale brukerdata
        if (innloggetBruker) localStorage.removeItem('innloggetBruker');
        if (currentUser) localStorage.removeItem('currentUser');
      }
    }
    
    // Kun fortsett med Supabase-autentisering hvis vi ikke har en lokal bruker
    if (!hasLoadedLocalUser) {
      // Sjekk om Supabase-klienten er gyldig
      if (!supabase || !supabase.auth) {
        console.warn('Supabase-klient er ikke tilgjengelig, bruker kun lokal autentisering');
        setLoading(false);
        return () => {};
      }
      
      // Hent gjeldende sesjon
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session && session.user) {
          setUser(session.user);
        }
        setLoading(false);
      }).catch(error => {
        console.error('Feil ved henting av Supabase sesjon:', error);
        setLoading(false);
      });
      
      // Lytt til endringer i autentisering
      let subscription = null;
      try {
        const authListener = supabase.auth.onAuthStateChange((event, session) => {
          if (session && session.user) {
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
        
        subscription = authListener?.data?.subscription;
      } catch (error) {
        console.warn('Kunne ikke sette opp auth state listener:', error);
        setLoading(false);
      }

      return () => {
        try {
          subscription?.unsubscribe();
        } catch (error) {
          console.warn('Feil ved unsubscribe:', error);
        }
      };
    } else {
      setLoading(false);
      return () => {}; // tom oppryddingsfunksjon når vi bruker lokal bruker
    }
  }, []);

  // Funksjon for å manuelt sette bruker (for lokal fallback)
  const setAuthUser = (userData) => {
    // Sikre at brukerdata er komplett og gyldig
    if (!userData || !userData.id || !userData.email) {
      console.error('Forsøk på å sette ugyldig bruker avbrutt:', userData);
      setAuthError('Ugyldig brukerdata. Vennligst prøv på nytt.');
      return false;
    }
    
    // Sikre at vi har et navn
    const validatedUserData = {
      ...userData,
      navn: userData.navn || userData.email.split('@')[0] || 'Bruker'
    };
    
    setUser(validatedUserData);
    // Lagre brukeren i begge lagringsformater for å sikre kompatibilitet
    if (validatedUserData) {
      localStorage.setItem('innloggetBruker', JSON.stringify(validatedUserData));
      localStorage.setItem('currentUser', JSON.stringify({
        uid: validatedUserData.id,
        email: validatedUserData.email,
        navn: validatedUserData.navn
      }));
    }
    
    return true;
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