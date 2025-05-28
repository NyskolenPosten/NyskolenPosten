// services/artikkelService.js - Håndter artikler med lokal lagring

import cacheManager, { invalidateArtikkelCache } from '../utils/cacheUtil';
import tabellCache, { TABELL } from '../utils/directCache';
import { supabase, supabaseKey, supabaseUrl as configUrl } from '../config/supabase';

// Sjekk om vi kjører lokalt
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
// Hent supabase URL - bruk en sikker fallback
const supabaseUrl = supabase.supabaseUrl || configUrl || (isLocalhost ? 'http://127.0.0.1:54321' : process.env.REACT_APP_SUPABASE_URL);

// Sjekk om vi er i produksjonsmiljø
const isProd = process.env.NODE_ENV === 'production';

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
  ARTICLES_LIST: 3 * 60 * 1000,    // 3 minutter for artikkel-lister
  ARTICLE_DETAIL: 10 * 60 * 1000,  // 10 minutter for artikkeldetaljer
  USER_ARTICLES: 2 * 60 * 1000,    // 2 minutter for bruker-spesifikke artikler
  CATEGORY_LIST: 30 * 60 * 1000    // 30 minutter for kategorilister
};

// Cache-nøkler
const CACHE_KEYS = {
  ALL_ARTICLES: 'artikler:alle',
  APPROVED_ARTICLES: 'artikler:godkjente',
  USER_ARTICLES: (userId) => `artikler:bruker:${userId}`,
  ARTICLE_DETAIL: (id) => `artikkel:${id}`,
  CATEGORIES: 'kategorier'
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
  // Prøv først å hente fra tabellCache for umiddelbar respons
  const cachedData = tabellCache.hentTabell(TABELL.GODKJENTE_ARTIKLER);
  if (cachedData) {
    return cachedData;
  }
  
  // Hvis ikke i tabellCache, hent via vanlig cache eller fra server
  return tabellCache.hentEllerLastTabell(
    TABELL.GODKJENTE_ARTIKLER,
    async () => {
      return cacheManager.getOrFetch(CACHE_KEYS.APPROVED_ARTICLES, async () => {
        try {
          const { data, error } = await supabase
            .from('artikler')
            .select('*')
            .eq('godkjent', true)
            .order('created_at', { ascending: false });
    
          if (error) throw error;
          
          return { success: true, artikler: data };
        } catch (error) {
          handleError(error, 'Henting av godkjente artikler');
          return { success: false, error: error.message };
        }
      }, CACHE_TTL.ARTICLES_LIST);
    },
    CACHE_TTL.ARTICLES_LIST
  );
};

// Hent alle artikler (for admin/redaktør)
export const hentAlleArtikler = async () => {
  // Prøv først å hente fra tabellCache for umiddelbar respons
  const cachedData = tabellCache.hentTabell(TABELL.ALLE_ARTIKLER);
  if (cachedData) {
    return cachedData;
  }
  
  // Hvis ikke i tabellCache, hent via vanlig cache eller fra server
  return tabellCache.hentEllerLastTabell(
    TABELL.ALLE_ARTIKLER,
    async () => {
      return cacheManager.getOrFetch(CACHE_KEYS.ALL_ARTICLES, async () => {
        try {
          const { data, error } = await supabase
            .from('artikler')
            .select('*')
            .order('created_at', { ascending: false });
    
          if (error) throw error;
          
          return { success: true, artikler: data };
        } catch (error) {
          handleError(error, 'Henting av alle artikler');
          return { success: false, error: error.message };
        }
      }, CACHE_TTL.ARTICLES_LIST);
    },
    CACHE_TTL.ARTICLES_LIST
  );
};

// Hent brukers artikler
export const hentBrukersArtikler = async (brukerId) => {
  // Prøv først å hente fra tabellCache for umiddelbar respons
  const cachedData = tabellCache.hentTabell(TABELL.BRUKER_ARTIKLER(brukerId));
  if (cachedData) {
    return cachedData;
  }
  
  // Hvis ikke i tabellCache, hent via vanlig cache eller fra server
  return tabellCache.hentEllerLastTabell(
    TABELL.BRUKER_ARTIKLER(brukerId),
    async () => {
      return cacheManager.getOrFetch(CACHE_KEYS.USER_ARTICLES(brukerId), async () => {
        try {
          const { data, error } = await supabase
            .from('artikler')
            .select('*')
            .eq('forfatter_id', brukerId)
            .order('created_at', { ascending: false });
    
          if (error) throw error;
          
          return { success: true, artikler: data };
        } catch (error) {
          handleError(error, 'Henting av brukers artikler');
          return { success: false, error: error.message };
        }
      }, CACHE_TTL.USER_ARTICLES);
    },
    CACHE_TTL.USER_ARTICLES
  );
};

// Hent en spesifikk artikkel
export const hentArtikkel = async (artikkelID) => {
  // Prøv først å hente fra tabellCache for umiddelbar respons
  const cachedData = tabellCache.hentTabell(TABELL.ARTIKKEL(artikkelID));
  if (cachedData) {
    return cachedData;
  }
  
  // Hvis ikke i tabellCache, hent via vanlig cache eller fra server
  return tabellCache.hentEllerLastTabell(
    TABELL.ARTIKKEL(artikkelID),
    async () => {
      return cacheManager.getOrFetch(CACHE_KEYS.ARTICLE_DETAIL(artikkelID), async () => {
        try {
          const { data, error } = await supabase
            .from('artikler')
            .select('*')
            .eq('id', artikkelID)
            .single();
    
          if (error) throw error;
          
          return { success: true, artikkel: data };
        } catch (error) {
          handleError(error, 'Henting av artikkel');
          return { success: false, error: error.message };
        }
      }, CACHE_TTL.ARTICLE_DETAIL);
    },
    CACHE_TTL.ARTICLE_DETAIL
  );
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
    
    // Invalider relevante cache-nøkler
    cacheManager.invalidatePattern('artikler:*');
    cacheManager.invalidatePattern(`artikler:bruker:${artikkelData.forfatter_id}`);

    return { success: true, artikkelID };
  } catch (error) {
    handleError(error, 'Legge til artikkel');
    return { success: false, error: error.message };
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
    
    // Invalider både vanlig cache og tabellCache
    cacheManager.invalidatePattern('artikler:*');
    cacheManager.invalidatePattern(`artikler:bruker:${oppdatertData.forfatter_id}`);
    cacheManager.remove(CACHE_KEYS.ARTICLE_DETAIL(artikkelID));
    
    // Invalider tabellCache
    tabellCache.fjernTabell(TABELL.ALLE_ARTIKLER);
    tabellCache.fjernTabell(TABELL.GODKJENTE_ARTIKLER);
    tabellCache.fjernTabell(TABELL.BRUKER_ARTIKLER(oppdatertData.forfatter_id));
    tabellCache.fjernTabell(TABELL.ARTIKKEL(artikkelID));

    return { success: true };
  } catch (error) {
    handleError(error, 'Oppdatere artikkel');
    return { success: false, error: error.message };
  }
};

// Slett artikkel
export const slettArtikkel = async (artikkelID) => {
  try {
    const { error } = await supabase
      .from('artikler')
      .delete()
      .eq('id', artikkelID);

    if (error) throw error;

    // Invalider både vanlig cache og tabellCache
    cacheManager.invalidatePattern('artikler:*');
    cacheManager.remove(CACHE_KEYS.ARTICLE_DETAIL(artikkelID));
    
    // Invalider tabellCache
    tabellCache.fjernTabell(TABELL.ALLE_ARTIKLER);
    tabellCache.fjernTabell(TABELL.GODKJENTE_ARTIKLER);
    // Siden vi ikke vet forfatter-ID her, må vi fjerne alle brukerartikler
    Object.keys(tabellCache.tabellData).forEach(key => {
      if (key.startsWith('artikler:bruker:')) {
        tabellCache.fjernTabell(key);
      }
    });
    tabellCache.fjernTabell(TABELL.ARTIKKEL(artikkelID));

    return { success: true };
  } catch (error) {
    handleError(error, 'Slette artikkel');
    return { success: false, error: error.message };
  }
};

// Godkjenn artikkel
export const godkjennArtikkel = async (artikkelID) => {
  try {
    const { data, error } = await supabase
      .from('artikler')
      .update({ godkjent: true })
      .eq('id', artikkelID)
      .select()
      .single();

    if (error) throw error;

    // Invalider både vanlig cache og tabellCache
    cacheManager.invalidatePattern('artikler:*');
    cacheManager.remove(CACHE_KEYS.ARTICLE_DETAIL(artikkelID));
    
    // Invalider tabellCache
    tabellCache.fjernTabell(TABELL.ALLE_ARTIKLER);
    tabellCache.fjernTabell(TABELL.GODKJENTE_ARTIKLER);
    // Hvis vi har data, kan vi være mer presis med bruker-cachen
    if (data && data.forfatter_id) {
      tabellCache.fjernTabell(TABELL.BRUKER_ARTIKLER(data.forfatter_id));
    } else {
      // Ellers fjern alle brukerartikler
      Object.keys(tabellCache.tabellData).forEach(key => {
        if (key.startsWith('artikler:bruker:')) {
          tabellCache.fjernTabell(key);
        }
      });
    }
    tabellCache.fjernTabell(TABELL.ARTIKKEL(artikkelID));

    return { success: true, artikkel: data };
  } catch (error) {
    handleError(error, 'Godkjenne artikkel');
    return { success: false, error: error.message };
  }
};

// Avvis artikkel
export const avvisArtikkel = async (artikkelID) => {
  try {
    const { data, error } = await supabase
      .from('artikler')
      .update({ godkjent: false })
      .eq('id', artikkelID)
      .select()
      .single();

    if (error) throw error;

    // Invalider både vanlig cache og tabellCache
    cacheManager.invalidatePattern('artikler:*');
    cacheManager.remove(CACHE_KEYS.ARTICLE_DETAIL(artikkelID));
    
    // Invalider tabellCache
    tabellCache.fjernTabell(TABELL.ALLE_ARTIKLER);
    tabellCache.fjernTabell(TABELL.GODKJENTE_ARTIKLER);
    // Hvis vi har data, kan vi være mer presis med bruker-cachen
    if (data && data.forfatter_id) {
      tabellCache.fjernTabell(TABELL.BRUKER_ARTIKLER(data.forfatter_id));
    } else {
      // Ellers fjern alle brukerartikler
      Object.keys(tabellCache.tabellData).forEach(key => {
        if (key.startsWith('artikler:bruker:')) {
          tabellCache.fjernTabell(key);
        }
      });
    }
    tabellCache.fjernTabell(TABELL.ARTIKKEL(artikkelID));

    return { success: true, artikkel: data };
  } catch (error) {
    handleError(error, 'Avvise artikkel');
    return { success: false, error: error.message };
  }
}; 