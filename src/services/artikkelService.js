// services/artikkelService.js - Håndter artikler med lokal lagring

import cacheManager, { invalidateArtikkelCache } from '../utils/cacheUtil';
import { supabase, supabaseKey, supabaseUrl as configUrl } from '../config/supabase';

// Sjekk om vi kjører lokalt
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
// Hent supabase URL - bruk en sikker fallback
const supabaseUrl = supabase.supabaseUrl || configUrl || (isLocalhost ? 'http://127.0.0.1:54321' : 'https://lucbodhuwimhqnvtmdzg.supabase.co');

// Sjekk om vi er i produksjonsmiljø
const isProd = process.env.NODE_ENV === 'production';
// Sjekk om vi kjører på github.io
const isGithubPages = window.location.hostname.includes('github.io');

// Feilhåndtering
const handleError = (error, operation = 'API-operasjon') => {
  // I produksjon, begrens logging
  if (isProd) {
    console.warn(`${operation} feilet. Bruker fallback.`);
    return;
  }
  
  // I utvikling, gi mer informasjon
  console.error(`${operation} feilet:`, error);
};

// Cache-TTL-konstanter (i millisekunder)
const CACHE_TTL = {
  ARTICLES_LIST: 5 * 60 * 1000, // 5 minutter for artikkel-lister
  ARTICLE_DETAIL: 10 * 60 * 1000 // 10 minutter for artikkeldetaljer
};

// Konstanter for bildehåndtering
const BILDE_SETTINGS = {
  MAX_WIDTH: 1200,     // Maksimal bredde for lagrede bilder
  MAX_HEIGHT: 1200,    // Maksimal høyde for lagrede bilder
  JPEG_QUALITY: 0.85,  // JPEG-kvalitet (0-1)
  MAX_FILE_SIZE: 1024 * 1024 // 1MB maks størrelse
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

/**
 * Komprimerer og skalerer et bilde for å redusere filstørrelsen
 * @param {string} base64Image - Base64-kodet bilde
 * @returns {Promise<string>} - Komprimert base64-bilde
 */
const komprimerBilde = async (base64Image) => {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      img.onload = () => {
        // Beregn nye dimensjoner
        let newWidth = img.width;
        let newHeight = img.height;
        
        if (newWidth > BILDE_SETTINGS.MAX_WIDTH) {
          const ratio = BILDE_SETTINGS.MAX_WIDTH / newWidth;
          newWidth = BILDE_SETTINGS.MAX_WIDTH;
          newHeight = Math.round(newHeight * ratio);
        }
        
        if (newHeight > BILDE_SETTINGS.MAX_HEIGHT) {
          const ratio = BILDE_SETTINGS.MAX_HEIGHT / newHeight;
          newHeight = BILDE_SETTINGS.MAX_HEIGHT;
          newWidth = Math.round(newWidth * ratio);
        }
        
        // Opprett canvas for skalering
        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;
        const ctx = canvas.getContext('2d');
        
        // Tegn bildet på canvas
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        // Hent typen (png, jpeg, etc.)
        const mimeType = base64Image.split(';')[0].split(':')[1] || 'image/jpeg';
        
        // Konverter til base64 med kvalitet (kun for JPEG)
        const quality = mimeType === 'image/jpeg' ? BILDE_SETTINGS.JPEG_QUALITY : 1.0;
        const komprimertBase64 = canvas.toDataURL(mimeType, quality);
        
        // Sjekk om resultatet er under maks filstørrelse
        const approxSize = Math.round((komprimertBase64.length * 3) / 4);
        if (approxSize > BILDE_SETTINGS.MAX_FILE_SIZE) {
          // Hvis fortsatt for stort, prøv med lavere kvalitet
          const redusertQuality = Math.max(0.5, quality - 0.1);
          const merKomprimert = canvas.toDataURL(mimeType, redusertQuality);
          resolve(merKomprimert);
        } else {
          resolve(komprimertBase64);
        }
      };
      
      img.onerror = () => {
        reject(new Error('Kunne ikke laste inn bildet for komprimering'));
      };
      
      img.src = base64Image;
    } catch (error) {
      reject(error);
    }
  });
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

// Hent alle artikler (for admin/redaktør og alle brukere)
export const hentAlleArtikler = async () => {
  try {
    // Reduser logging i produksjon
    if (!isProd) {
      console.log('Henter artikler...');
    }
    
    // Hent lokalt lagrede artikler - vi vil alltid ha disse klare uansett hva
    const lokaleLagrede = localStorage.getItem('artikler');
    let lokalArtikler = [];
    
    if (lokaleLagrede) {
      try {
        lokalArtikler = JSON.parse(lokaleLagrede);
        if (!isProd) {
          console.log(`Fant ${lokalArtikler.length} lokalt lagrede artikler`);
        }
      } catch (parseError) {
        handleError(parseError, 'Parsing av lokalt lagrede artikler');
      }
    }
    
    // Hvis vi kjører på github.io, bruk bare localStorage - ikke forsøk å kalle API-er som vil feile med CORS
    // Dette løser CORS-feilene én gang for alle på github.io
    if (isGithubPages) {
      if (!isProd) {
        console.log('Kjører på GitHub Pages - bruker bare lokale data');
      }
      return { success: true, artikler: lokalArtikler };
    }
    
    // Sett en timeout for Supabase-kallet
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Tidsavbrudd ved henting av artikler')), 5000)
    );
    
    // Lag en funksjon for å hente data - forenklet for å redusere feilkilder
    const fetchDataPromise = async () => {
      try {
        // Bruk Supabase-klienten direkte - unngå direkte fetch-kall som gir 404/406
        let { data, error } = await supabase
          .from('artikler')
          .select('*');
        
        if (data && data.length > 0 && !error) {
          if (!isProd) {
            console.log(`Hentet ${data.length} artikler fra Supabase`);
          }
          // Sorter artiklene
          data.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
          
          // Synkroniser med localStorage for offline-bruk
          try {
            localStorage.setItem('artikler', JSON.stringify(data));
          } catch (syncError) {
            handleError(syncError, 'Synkronisering med lokallagring');
          }
          
          return { success: true, artikler: data };
        } 
        
        if (error) {
          throw new Error(`Supabase feilet: ${error.message}`);
        }
        
        // Om vi kommer hit, har vi ikke klart å hente data
        throw new Error('Ingen data funnet fra Supabase');
      } catch (error) {
        // Videreformidle feilen
        throw error;
      }
    };
    
    // Prøv å hente data med en timeout - bare hvis vi ikke er på GitHub Pages
    try {
      return await Promise.race([fetchDataPromise(), timeoutPromise]);
    } catch (error) {
      handleError(error, 'Henting av artikler (timeout eller API-feil)');
      
      // Bruk alltid lokalt lagrede artikler som fallback
      if (lokalArtikler.length > 0) {
        if (!isProd) {
          console.log(`Bruker ${lokalArtikler.length} lokalt lagrede artikler som fallback`);
        }
        return { success: true, artikler: lokalArtikler };
      }
      
      // Siste utvei - returner tom array
      return { success: true, artikler: [] };
    }
  } catch (error) {
    handleError(error, 'Uventet feil ved henting av artikler');
    
    // Prøv å bruke lokalt lagrede artikler som siste utvei
    try {
      const lokaleLagrede = localStorage.getItem('artikler');
      if (lokaleLagrede) {
        const artikler = JSON.parse(lokaleLagrede);
        if (!isProd) {
          console.log(`Bruker ${artikler.length} lokalt lagrede artikler (etter feil)`);
        }
        return { success: true, artikler };
      }
    } catch (localError) {
      handleError(localError, 'Fallback til lokalt lagrede artikler');
    }
    
    return { success: true, artikler: [] };
  }
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
      try {
        // Komprimer bildet før lagring
        bildeURL = await komprimerBilde(bilde);
        
        // Logg bildestørrelse etter komprimering i utviklingsmiljø
        if (process.env.NODE_ENV === 'development') {
          const approxSize = Math.round((bildeURL.length * 3) / 4);
          console.log(`Bilde komprimert: ~${Math.round(approxSize / 1024)}KB`);
        }
      } catch (err) {
        console.error('Feil ved bildekomprimering:', err);
        bildeURL = bilde; // Bruk originalt bilde ved feil
      }
    }
    
    const nyArtikkel = {
      artikkelID,
      ...artikkelData,
      bilde: bildeURL,
      dato: serverTimestamp()
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
      try {
        // Komprimer bildet før lagring
        bildeURL = await komprimerBilde(nyttBilde);
        
        // Logg bildestørrelse etter komprimering i utviklingsmiljø
        if (process.env.NODE_ENV === 'development') {
          const approxSize = Math.round((bildeURL.length * 3) / 4);
          console.log(`Bilde oppdatert og komprimert: ~${Math.round(approxSize / 1024)}KB`);
        }
      } catch (err) {
        console.error('Feil ved bildekomprimering:', err);
        bildeURL = nyttBilde; // Bruk originalt bilde ved feil
      }
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