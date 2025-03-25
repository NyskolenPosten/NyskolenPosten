// services/authService.js - Håndter autentisering med lokal lagring

import { auth } from './firebaseConfig';

// Hjelpefunksjon for å generere en unik ID
const genererID = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

// Hjelpefunksjon for å få nåværende tidsstempel
const serverTimestamp = () => {
  return new Date().toISOString();
};

// Registrer ny bruker
export const registrerBruker = async (email, password, navn, klasse) => {
  try {
    // Sjekk om brukeren allerede eksisterer
    const brukere = JSON.parse(localStorage.getItem('brukere')) || [];
    const eksisterendeBruker = brukere.find(bruker => bruker.email === email);
    
    if (eksisterendeBruker) {
      return { success: false, error: 'E-postadressen er allerede i bruk' };
    }
    
    // Opprett ny bruker
    const userId = genererID();
    const nyBruker = {
      uid: userId,
      email: email,
      password: password, // I en ekte app ville dette vært kryptert
      displayName: navn
    };
    
    // Lagre bruker i "auth"
    auth.currentUser = nyBruker;
    localStorage.setItem('currentUser', JSON.stringify(nyBruker));
    
    // Lagre utvidet brukerinformasjon
    const brukerInfo = {
      id: userId,
      navn: navn,
      email: email,
      klasse: klasse,
      rolle: 'skribent',
      godkjent: false,
      opprettet: serverTimestamp()
    };
    
    brukere.push(brukerInfo);
    localStorage.setItem('brukere', JSON.stringify(brukere));
    
    return { success: true, userId: userId };
  } catch (error) {
    return { success: false, error: error.message || 'Registrering feilet' };
  }
};

// Logg inn eksisterende bruker
export const loggInn = async (email, password) => {
  try {
    const brukere = JSON.parse(localStorage.getItem('brukere')) || [];
    const bruker = brukere.find(b => b.email === email);
    
    if (!bruker) {
      return { success: false, error: 'Brukeren finnes ikke' };
    }
    
    // Sjekk passord (i en ekte app ville dette vært kryptert)
    const authBrukere = JSON.parse(localStorage.getItem('brukere')) || [];
    const authBruker = authBrukere.find(b => b.email === email);
    
    if (!authBruker || authBruker.password !== password) {
      return { success: false, error: 'Feil passord' };
    }
    
    // Opprett bruker-objekt som ligner på Firebase-bruker
    const user = {
      uid: bruker.id,
      email: bruker.email,
      displayName: bruker.navn
    };
    
    // Lagre i "auth"
    auth.currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    return { 
      success: true, 
      bruker: {
        id: bruker.id,
        navn: bruker.navn,
        email: bruker.email,
        rolle: bruker.rolle,
        godkjent: bruker.godkjent,
        klasse: bruker.klasse
      }
    };
  } catch (error) {
    return { success: false, error: error.message || 'Innlogging feilet' };
  }
};

// Logg ut
export const loggUt = async () => {
  try {
    auth.currentUser = null;
    localStorage.removeItem('currentUser');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message || 'Utlogging feilet' };
  }
};

// Oppdater bruker
export const oppdaterBruker = async (userId, oppdatertInfo) => {
  try {
    const brukere = JSON.parse(localStorage.getItem('brukere')) || [];
    const brukerIndex = brukere.findIndex(b => b.id === userId);
    
    if (brukerIndex === -1) {
      return { success: false, error: 'Brukeren finnes ikke' };
    }
    
    // Oppdater bruker
    brukere[brukerIndex] = { ...brukere[brukerIndex], ...oppdatertInfo };
    localStorage.setItem('brukere', JSON.stringify(brukere));
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message || 'Oppdatering feilet' };
  }
}; 