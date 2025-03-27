// services/artikkelService.js - Håndter artikler med lokal lagring

import cacheManager, { invalidateArtikkelCache } from '../utils/cacheUtil';

// Cache-TTL-konstanter (i millisekunder)
const CACHE_TTL = {
  ARTICLES_LIST: 5 * 60 * 1000, // 5 minutter for artikkel-lister
  ARTICLE_DETAIL: 10 * 60 * 1000 // 10 minutter for artikkeldetaljer
};

// Hjelpefunksjon for å generere en unik ID
const genererID = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

// Hjelpefunksjon for å få nåværende tidsstempel
const serverTimestamp = () => {
  return new Date().toISOString();
};

// Konverter base64 til blob for bildelagring
const base64ToBlob = (base64, mimeType) => {
  const byteString = atob(base64.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  
  return new Blob([ab], { type: mimeType });
};

// Hent alle godkjente artikler
export const hentGodkjenteArtikler = async () => {
  // Bruk cachen hvis tilgjengelig
  const cacheKey = 'artikkel:godkjente';
  return cacheManager.getOrFetch(cacheKey, async () => {
    try {
      const artikler = JSON.parse(localStorage.getItem('artikler')) || [];
      const godkjenteArtikler = artikler.filter(artikkel => artikkel.godkjent === true)
        .sort((a, b) => new Date(b.dato) - new Date(a.dato));
      
      return { success: true, artikler: godkjenteArtikler };
    } catch (error) {
      return { success: false, error: error.message || 'Kunne ikke hente artikler' };
    }
  }, CACHE_TTL.ARTICLES_LIST);
};

// Hent alle artikler (for admin/redaktør)
export const hentAlleArtikler = async () => {
  // Bruk cachen hvis tilgjengelig
  const cacheKey = 'artikkel:alle';
  return cacheManager.getOrFetch(cacheKey, async () => {
    try {
      const artikler = JSON.parse(localStorage.getItem('artikler')) || [];
      const sorterteArtikler = artikler.sort((a, b) => new Date(b.dato) - new Date(a.dato));
      
      return { success: true, artikler: sorterteArtikler };
    } catch (error) {
      return { success: false, error: error.message || 'Kunne ikke hente artikler' };
    }
  }, CACHE_TTL.ARTICLES_LIST);
};

// Hent artikler for en bestemt bruker
export const hentBrukersArtikler = async (brukerId) => {
  // Bruk cachen hvis tilgjengelig
  const cacheKey = `artikkel:bruker:${brukerId}`;
  return cacheManager.getOrFetch(cacheKey, async () => {
    try {
      const artikler = JSON.parse(localStorage.getItem('artikler')) || [];
      const brukersArtikler = artikler.filter(artikkel => artikkel.forfatterID === brukerId)
        .sort((a, b) => new Date(b.dato) - new Date(a.dato));
      
      return { success: true, artikler: brukersArtikler };
    } catch (error) {
      return { success: false, error: error.message || 'Kunne ikke hente brukerens artikler' };
    }
  }, CACHE_TTL.ARTICLES_LIST);
};

// Hent en enkelt artikkel basert på ID
export const hentArtikkel = async (artikkelID) => {
  // Bruk cachen hvis tilgjengelig
  const cacheKey = `artikkel:detalj:${artikkelID}`;
  return cacheManager.getOrFetch(cacheKey, async () => {
    try {
      const artikler = JSON.parse(localStorage.getItem('artikler')) || [];
      const artikkel = artikler.find(a => a.artikkelID === artikkelID);
      
      if (!artikkel) {
        return { success: false, error: 'Artikkelen ble ikke funnet' };
      }
      
      return { success: true, artikkel };
    } catch (error) {
      return { success: false, error: error.message || 'Kunne ikke hente artikkelen' };
    }
  }, CACHE_TTL.ARTICLE_DETAIL);
};

// Legg til ny artikkel
export const leggTilArtikkel = async (artikkelData, bilde) => {
  try {
    const artikler = JSON.parse(localStorage.getItem('artikler')) || [];
    const artikkelID = genererID();
    
    // Håndter bilde
    let bildeURL = null;
    if (bilde) {
      // I en lokal versjon lagrer vi bildet som base64 direkte i localStorage
      // Dette er ikke optimalt for store bilder, men fungerer for testing
      bildeURL = bilde;
    }
    
    const nyArtikkel = {
      artikkelID,
      ...artikkelData,
      bilde: bildeURL,
      dato: serverTimestamp(),
      godkjent: false
    };
    
    artikler.push(nyArtikkel);
    localStorage.setItem('artikler', JSON.stringify(artikler));
    
    // Invalider cache for artikler
    invalidateArtikkelCache();
    
    return { success: true, artikkelID };
  } catch (error) {
    return { success: false, error: error.message || 'Kunne ikke legge til artikkelen' };
  }
};

// Oppdater artikkel
export const oppdaterArtikkel = async (artikkelID, oppdatertData, nyttBilde) => {
  try {
    const artikler = JSON.parse(localStorage.getItem('artikler')) || [];
    const artikkelIndex = artikler.findIndex(a => a.artikkelID === artikkelID);
    
    if (artikkelIndex === -1) {
      return { success: false, error: 'Artikkelen ble ikke funnet' };
    }
    
    // Håndter bilde
    let bildeURL = artikler[artikkelIndex].bilde;
    if (nyttBilde) {
      // Erstatt gammelt bilde med nytt
      bildeURL = nyttBilde;
    }
    
    // Oppdater artikkelen
    artikler[artikkelIndex] = {
      ...artikler[artikkelIndex],
      ...oppdatertData,
      bilde: bildeURL,
      sistredigert: serverTimestamp()
    };
    
    localStorage.setItem('artikler', JSON.stringify(artikler));
    
    // Invalider cache for denne artikkelen og relevante lister
    cacheManager.remove(`artikkel:detalj:${artikkelID}`);
    invalidateArtikkelCache();
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message || 'Kunne ikke oppdatere artikkelen' };
  }
};

// Slett artikkel
export const slettArtikkel = async (artikkelID) => {
  try {
    const artikler = JSON.parse(localStorage.getItem('artikler')) || [];
    const oppdaterteArtikler = artikler.filter(a => a.artikkelID !== artikkelID);
    
    localStorage.setItem('artikler', JSON.stringify(oppdaterteArtikler));
    
    // Invalider cache for denne artikkelen og relevante lister
    cacheManager.remove(`artikkel:detalj:${artikkelID}`);
    invalidateArtikkelCache();
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message || 'Kunne ikke slette artikkelen' };
  }
};

// Godkjenn artikkel
export const godkjennArtikkel = async (artikkelID) => {
  try {
    const artikler = JSON.parse(localStorage.getItem('artikler')) || [];
    const artikkelIndex = artikler.findIndex(a => a.artikkelID === artikkelID);
    
    if (artikkelIndex === -1) {
      return { success: false, error: 'Artikkelen ble ikke funnet' };
    }
    
    artikler[artikkelIndex].godkjent = true;
    localStorage.setItem('artikler', JSON.stringify(artikler));
    
    // Invalider cache for denne artikkelen og relevante lister
    cacheManager.remove(`artikkel:detalj:${artikkelID}`);
    invalidateArtikkelCache();
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message || 'Kunne ikke godkjenne artikkelen' };
  }
};

// Avvis artikkel
export const avvisArtikkel = async (artikkelID) => {
  try {
    const artikler = JSON.parse(localStorage.getItem('artikler')) || [];
    const artikkelIndex = artikler.findIndex(a => a.artikkelID === artikkelID);
    
    if (artikkelIndex === -1) {
      return { success: false, error: 'Artikkelen ble ikke funnet' };
    }
    
    artikler[artikkelIndex].godkjent = false;
    localStorage.setItem('artikler', JSON.stringify(artikler));
    
    // Invalider cache for denne artikkelen og relevante lister
    cacheManager.remove(`artikkel:detalj:${artikkelID}`);
    invalidateArtikkelCache();
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message || 'Kunne ikke avvise artikkelen' };
  }
}; 