// services/authService.js - Håndter autentisering med lokal lagring

import { auth } from './firebaseConfig';
import cacheManager, { invalidateBrukerCache } from '../utils/cacheUtil';
import { encrypt, decrypt, verifyPassword, isEncrypted } from '../utils/cryptoUtil';

// Cache-TTL-konstanter (i millisekunder)
const CACHE_TTL = {
  USER_INFO: 10 * 60 * 1000, // 10 minutter for brukerinformasjon
  USER_LIST: 5 * 60 * 1000, // 5 minutter for brukerlister
};

// Spesielle e-postadresser med forhåndsdefinerte roller
const SPECIAL_EMAILS = {
  'eva.westlund@nionett.no': 'redaktør',
  'mattis.tollefsen@nionett.no': 'teknisk_leder',
};

// Hjelpefunksjon for å generere en unik ID
const genererID = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

// Hjelpefunksjon for å få nåværende tidsstempel
const serverTimestamp = () => {
  return new Date().toISOString();
};

// Hent alle brukere (ikke-cachet for admin-bruk - alltid ferske data)
export const hentAlleBrukere = async () => {
  try {
    const brukere = JSON.parse(localStorage.getItem('brukere')) || [];
    return { success: true, brukere };
  } catch (error) {
    return { success: false, error: error.message || 'Kunne ikke hente brukere' };
  }
};

// Hent brukerinformasjon med caching
export const hentBrukerInfo = async (userId) => {
  // Bruk cachen hvis tilgjengelig
  const cacheKey = `bruker:info:${userId}`;
  return cacheManager.getOrFetch(cacheKey, async () => {
    try {
      const brukere = JSON.parse(localStorage.getItem('brukere')) || [];
      const bruker = brukere.find(b => b.id === userId);
      
      if (!bruker) {
        return { success: false, error: 'Brukeren finnes ikke' };
      }
      
      return { success: true, bruker };
    } catch (error) {
      return { success: false, error: error.message || 'Kunne ikke hente brukerinformasjon' };
    }
  }, CACHE_TTL.USER_INFO);
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
    
    // Sjekk om e-posten har spesiell rolle
    let rolle = 'skribent';
    if (SPECIAL_EMAILS[email]) {
      rolle = SPECIAL_EMAILS[email];
    }
    
    // Krypter passordet før lagring
    const encryptedPassword = encrypt(password);
    
    // Lagre utvidet brukerinformasjon
    const brukerInfo = {
      id: userId,
      navn: navn,
      email: email,
      password: encryptedPassword, // Lagrer kryptert passord
      klasse: klasse,
      rolle: rolle,
      godkjent: true, // Brukere er automatisk godkjent
      opprettet: serverTimestamp()
    };
    
    brukere.push(brukerInfo);
    localStorage.setItem('brukere', JSON.stringify(brukere));
    
    // Opprett bruker-objekt for auth
    const nyBruker = {
      uid: userId,
      email: email,
      displayName: navn
    };
    
    // Lagre bruker i "auth"
    auth.currentUser = nyBruker;
    localStorage.setItem('currentUser', JSON.stringify(nyBruker));
    
    // Opprett jobbliste oppføring for nye brukere
    const jobbliste = JSON.parse(localStorage.getItem('jobbliste')) || [];
    const jobbTittel = rolle === 'admin' ? 'Administrator' : 
                      rolle === 'redaktør' ? 'Redaktør' :
                      rolle === 'teknisk_leder' ? 'Teknisk leder' : 'Skribent';
                      
    const nyJobb = {
      id: 'jobb-' + Date.now(),
      navn: navn,
      rolle: jobbTittel,
      dato: serverTimestamp()
    };
    
    jobbliste.push(nyJobb);
    localStorage.setItem('jobbliste', JSON.stringify(jobbliste));
    
    // Invalider brukercache
    invalidateBrukerCache();
    
    return { success: true, userId: userId, bruker: brukerInfo };
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
    
    // Sjekk passord - med støtte for både krypterte og ukrypterte passord
    if (isEncrypted(bruker.password)) {
      // Hvis passordet er kryptert, verifiser med crypto-funksjonen
      if (!verifyPassword(password, bruker.password)) {
        return { success: false, error: 'Feil passord' };
      }
    } else {
      // Hvis passordet ikke er kryptert ennå (gamle brukere), sjekk direkte
      // og oppdater deretter til kryptert format
      if (bruker.password !== password) {
        return { success: false, error: 'Feil passord' };
      }
      
      // Oppdater til kryptert passord
      bruker.password = encrypt(password);
      const oppdaterteBrukere = brukere.map(b => b.id === bruker.id ? bruker : b);
      localStorage.setItem('brukere', JSON.stringify(oppdaterteBrukere));
    }
    
    // Sjekk om e-posten har spesiell rolle og oppdater hvis nødvendig
    if (SPECIAL_EMAILS[email] && bruker.rolle !== SPECIAL_EMAILS[email]) {
      bruker.rolle = SPECIAL_EMAILS[email];
      // Oppdater bruker i localStorage
      const oppdaterteBrukere = brukere.map(b => b.id === bruker.id ? bruker : b);
      localStorage.setItem('brukere', JSON.stringify(oppdaterteBrukere));
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
    
    // Cache brukerinformasjon
    const cacheKey = `bruker:info:${bruker.id}`;
    cacheManager.set(cacheKey, { 
      success: true, 
      bruker: bruker
    }, CACHE_TTL.USER_INFO);
    
    return { 
      success: true, 
      bruker: bruker
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
    
    // Tøm bruker-relatert cache
    invalidateBrukerCache();
    
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
    
    // Hvis passordet oppdateres, krypter det
    if (oppdatertInfo.password) {
      oppdatertInfo.password = encrypt(oppdatertInfo.password);
    }
    
    // Oppdater bruker
    brukere[brukerIndex] = { ...brukere[brukerIndex], ...oppdatertInfo };
    localStorage.setItem('brukere', JSON.stringify(brukere));
    
    // Invalider cache for denne brukeren
    cacheManager.remove(`bruker:info:${userId}`);
    invalidateBrukerCache();
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message || 'Oppdatering feilet' };
  }
}; 