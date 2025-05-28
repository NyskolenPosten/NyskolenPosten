// DirectCache - En enkel og direkte cache for tabelldata
// Gir umiddelbar tilgang til tabelldata uten ventetid

import { supabaseUrl } from '../config/supabase';

// Sjekk om vi er på GitHub Pages eller offline
const isGitHubPages = window.location.hostname.includes('github.io');
const isOffline = !navigator.onLine;

// Fallback-data for når Supabase ikke er tilgjengelig
const getFallbackData = (tabellNavn) => {
  if (tabellNavn === 'artikler') {
    // Hent artikler fra localStorage
    const lokalArtikler = localStorage.getItem('artikler');
    if (lokalArtikler) {
      try {
        return { success: true, data: JSON.parse(lokalArtikler) };
      } catch (e) {
        console.warn('Kunne ikke parse lokale artikler');
      }
    }
    
    // Hvis ingen artikler finnes, opprett noen test-artikler
    const testArtikler = [
      {
        id: 'test-1',
        artikkelID: 'test-1',
        tittel: 'Velkommen til NyskolenPosten!',
        innhold: 'Dette er en test-artikkel som vises når appen kjører i offline-modus. Du kan legge til dine egne artikler ved å registrere deg og logge inn.',
        forfatter: 'Systemet',
        forfatterID: 'system',
        forfatterNavn: 'Systemet',
        kategori: 'Velkommen',
        dato: new Date().toISOString(),
        created_at: new Date().toISOString(),
        godkjent: true
      }
    ];
    
    // Lagre test-artiklene
    localStorage.setItem('artikler', JSON.stringify(testArtikler));
    return { success: true, data: testArtikler };
  }
  
  if (tabellNavn === 'brukere') {
    // Hent brukere fra localStorage
    const lokalBrukere = localStorage.getItem('brukere');
    if (lokalBrukere) {
      try {
        return { success: true, data: JSON.parse(lokalBrukere) };
      } catch (e) {
        console.warn('Kunne ikke parse lokale brukere');
      }
    }
    return { success: true, data: [] };
  }
  
  // Standard fallback
  return { success: true, data: [] };
};

class DirectCache {
  constructor() {
    this.tabellData = {};
    this.expires = {};
    this.DEFAULT_TTL = 5 * 60 * 1000; // 5 minutter
    
    // Sjekk om det finnes cached data i localStorage
    this.lastTabellDataFraStorage();
    
    // Start periodisk lagring
    this.startAutoSave();
  }
  
  // Laster tabelldata fra localStorage ved oppstart
  lastTabellDataFraStorage() {
    try {
      const cachedData = localStorage.getItem('nyskolen_tabell_cache');
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        this.tabellData = parsedData.data || {};
        this.expires = parsedData.expires || {};
        
        // Fjern utløpte data
        this.ryddUtlopteData();
      }
    } catch (error) {
      console.warn('Kunne ikke laste cache fra localStorage:', error);
    }
  }
  
  // Lagrer tabelldata i localStorage periodisk
  startAutoSave() {
    setInterval(() => {
      this.lagreTabellDataTilStorage();
    }, 30000); // Lagre hvert 30. sekund
  }
  
  // Lagrer nåværende cache til localStorage
  lagreTabellDataTilStorage() {
    try {
      // Rydd utløpte data først
      this.ryddUtlopteData();
      
      // Lagre til localStorage
      localStorage.setItem('nyskolen_tabell_cache', JSON.stringify({
        data: this.tabellData,
        expires: this.expires,
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      console.warn('Kunne ikke lagre cache til localStorage:', error);
    }
  }
  
  // Fjerner utløpte data fra cache
  ryddUtlopteData() {
    const now = Date.now();
    Object.keys(this.expires).forEach(key => {
      if (this.expires[key] < now) {
        delete this.tabellData[key];
        delete this.expires[key];
      }
    });
  }
  
  // Lagrer data for en tabell
  lagreTabell(tabellNavn, data, ttl = this.DEFAULT_TTL) {
    this.tabellData[tabellNavn] = data;
    this.expires[tabellNavn] = Date.now() + ttl;
    
    // Lagre øyeblikkelig
    this.lagreTabellDataTilStorage();
    return data;
  }
  
  // Henter data for en tabell, returnerer null hvis ikke funnet eller utløpt
  hentTabell(tabellNavn) {
    // Sjekk om data finnes og ikke er utløpt
    if (this.tabellData[tabellNavn] && this.expires[tabellNavn] > Date.now()) {
      return this.tabellData[tabellNavn];
    }
    return null;
  }
  
  // Henter tabell hvis den er i cache, ellers henter fra server
  async hentEllerLastTabell(tabellNavn, lasteFunksjon, ttl = this.DEFAULT_TTL) {
    // Først - sjekk om vi har ferske data i cache
    const cachedData = this.hentTabell(tabellNavn);
    if (cachedData !== null) {
      return cachedData;
    }
    
    // Hvis ikke i cache, last fra server
    try {
      const data = await lasteFunksjon();
      return this.lagreTabell(tabellNavn, data, ttl);
    } catch (error) {
      console.error(`Feil ved lasting av tabell ${tabellNavn}:`, error);
      throw error;
    }
  }
  
  // Fjerner en tabell fra cache
  fjernTabell(tabellNavn) {
    delete this.tabellData[tabellNavn];
    delete this.expires[tabellNavn];
    this.lagreTabellDataTilStorage();
  }
  
  // Fjerner alle tabeller fra cache
  tømCache() {
    this.tabellData = {};
    this.expires = {};
    localStorage.removeItem('nyskolen_tabell_cache');
  }
  
  // ENKLERE METODER - direkte tilgang til tabeller
  
  // Henter data direkte fra en tabell med valgfritt filter
  async hentFraTabell(tabellNavn, filter = null) {
    const cacheKey = filter 
      ? `${tabellNavn}:filter:${JSON.stringify(filter)}`
      : `${tabellNavn}:alle`;
    
    // Sjekk om vi har i cache
    const cachedData = this.hentTabell(cacheKey);
    if (cachedData !== null) {
      return cachedData;
    }
    
    // Hvis vi er på GitHub Pages eller offline, bruk fallback
    if (isGitHubPages || isOffline || !supabaseUrl || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
      console.log(`Bruker fallback-data for tabell: ${tabellNavn}`);
      const fallbackData = getFallbackData(tabellNavn);
      
      // Filtrer data hvis nødvendig
      if (filter && fallbackData.success && fallbackData.data) {
        let filteredData = fallbackData.data;
        
        // Anvend filter
        Object.entries(filter).forEach(([key, value]) => {
          if (key === 'order') {
            // Håndter sortering
            if (value === 'created_at.desc') {
              filteredData = filteredData.sort((a, b) => 
                new Date(b.created_at || b.dato) - new Date(a.created_at || a.dato)
              );
            }
          } else if (key === 'godkjent') {
            filteredData = filteredData.filter(item => item.godkjent === value);
          } else if (key === 'forfatter_id' || key === 'forfatterID') {
            filteredData = filteredData.filter(item => 
              item.forfatter_id === value || item.forfatterID === value
            );
          }
        });
        
        const result = { success: true, data: filteredData };
        this.lagreTabell(cacheKey, result);
        return result;
      }
      
      this.lagreTabell(cacheKey, fallbackData);
      return fallbackData;
    }
    
    try {
      // Bygg URL basert på filter
      let url = `${supabaseUrl}/rest/v1/${tabellNavn}`;
      
      // Legg til filterparametre
      if (filter) {
        const params = new URLSearchParams();
        
        // Behandle hver filteregenskap
        Object.entries(filter).forEach(([key, value]) => {
          if (key === 'order') {
            params.append('order', value);
          } else {
            params.append(`${key}`, `eq.${value}`);
          }
        });
        
        url += `?${params.toString()}`;
      }
      
      // Utfør API-kall
      const response = await fetch(url, {
        headers: {
          'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Feil ved henting fra tabell ${tabellNavn}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const result = { success: true, data };
      
      // Lagre i cache
      this.lagreTabell(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error(`Feil ved henting fra tabell ${tabellNavn}:`, error);
      
      // Ved feil, prøv fallback
      console.log(`Prøver fallback for tabell: ${tabellNavn}`);
      const fallbackData = getFallbackData(tabellNavn);
      this.lagreTabell(cacheKey, fallbackData);
      return fallbackData;
    }
  }
  
  // Hent en enkelt rad fra en tabell basert på ID
  async hentEnkeltRad(tabellNavn, id) {
    const cacheKey = `${tabellNavn}:id:${id}`;
    
    // Sjekk om vi har i cache
    const cachedData = this.hentTabell(cacheKey);
    if (cachedData !== null) {
      return cachedData;
    }
    
    // Hvis vi er på GitHub Pages eller offline, bruk fallback
    if (isGitHubPages || isOffline || !supabaseUrl || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
      console.log(`Bruker fallback-data for enkelt rad: ${tabellNavn}:${id}`);
      const fallbackData = getFallbackData(tabellNavn);
      
      if (fallbackData.success && fallbackData.data) {
        // Finn spesifikk rad basert på ID
        const item = fallbackData.data.find(row => 
          row.id === id || row.artikkelID === id
        );
        
        const result = { 
          success: true, 
          data: item || null 
        };
        
        this.lagreTabell(cacheKey, result);
        return result;
      }
      
      return { success: false, error: 'Ingen data funnet' };
    }
    
    try {
      const url = `${supabaseUrl}/rest/v1/${tabellNavn}?id=eq.${id}&limit=1`;
      
      const response = await fetch(url, {
        headers: {
          'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Feil ved henting av rad fra ${tabellNavn}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const result = { 
        success: true, 
        data: data.length > 0 ? data[0] : null 
      };
      
      // Lagre i cache
      this.lagreTabell(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error(`Feil ved henting av rad fra ${tabellNavn}:`, error);
      
      // Ved feil, prøv fallback
      console.log(`Prøver fallback for enkelt rad: ${tabellNavn}:${id}`);
      const fallbackData = getFallbackData(tabellNavn);
      
      if (fallbackData.success && fallbackData.data) {
        const item = fallbackData.data.find(row => 
          row.id === id || row.artikkelID === id
        );
        
        const result = { 
          success: true, 
          data: item || null 
        };
        
        this.lagreTabell(cacheKey, result);
        return result;
      }
      
      return { success: false, error: error.message };
    }
  }
}

// Eksporter en singleton-instans
export const tabellCache = new DirectCache();

// Nøkkelkonstanter
export const TABELL = {
  GODKJENTE_ARTIKLER: 'artikler:godkjente',
  ALLE_ARTIKLER: 'artikler:alle',
  BRUKER_ARTIKLER: (brukerId) => `artikler:bruker:${brukerId}`,
  ARTIKKEL: (id) => `artikkel:${id}`,
  BRUKERE: 'brukere:alle'
};

// Enkle direkte koblinger til tabeller i Supabase
export const brukere = 'brukere';

export default tabellCache;

// Hjelpefunksjon for å invalidere alle artikkel-relaterte tabeller
export function invalidateArtikkelTabeller(artikkelID, forfatterID = null) {
  tabellCache.fjernTabell(TABELL.ALLE_ARTIKLER);
  tabellCache.fjernTabell(TABELL.GODKJENTE_ARTIKLER);
  
  // Hvis forfatterID er angitt, invalider bare den brukerens artikler
  if (forfatterID) {
    tabellCache.fjernTabell(TABELL.BRUKER_ARTIKLER(forfatterID));
  } else {
    // Ellers invalider alle brukerartikler
    Object.keys(tabellCache.tabellData).forEach(key => {
      if (key.startsWith('artikler:bruker:')) {
        tabellCache.fjernTabell(key);
      }
    });
  }
  
  // Hvis artikkelID er angitt, invalider også den spesifikke artikkelen
  if (artikkelID) {
    tabellCache.fjernTabell(TABELL.ARTIKKEL(artikkelID));
  }
}

// Hjelpefunksjon for å laste artikkeldata umiddelbart ved oppstart
export function preloadArtikkelData() {
  // Dette kan kalles fra App.js for å fylle cachen ved oppstart
  // Hent godkjente artikler i bakgrunnen
  fetch(`${supabaseUrl}/rest/v1/artikler?godkjent=eq.true&order=created_at.desc`, {
    headers: {
      'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {
    if (Array.isArray(data)) {
      tabellCache.lagreTabell(TABELL.GODKJENTE_ARTIKLER, { 
        success: true, 
        artikler: data 
      });
      console.log('Preloaded godkjente artikler:', data.length);
    }
  })
  .catch(error => {
    console.warn('Kunne ikke preloade artikler:', error);
  });
}

// Hjelpefunksjoner for enkel tabellaksess

// Hent alle artikler (med valgfri filtrering)
export async function hentArtikler(filter = null) {
  return tabellCache.hentFraTabell('artikler', filter);
}

// Hent alle godkjente artikler
export async function hentGodkjenteArtikler() {
  return tabellCache.hentFraTabell('artikler', { 
    godkjent: true,
    order: 'created_at.desc'
  });
}

// Hent en enkelt artikkel
export async function hentArtikkel(id) {
  const resultat = await tabellCache.hentEnkeltRad('artikler', id);
  
  // Formater resultatet på samme måte som i artikkelService
  if (resultat.success && resultat.data) {
    return { success: true, artikkel: resultat.data };
  }
  return resultat;
}

// Hent artikler av en bestemt forfatter
export async function hentBrukersArtikler(forfatterID) {
  return tabellCache.hentFraTabell('artikler', { 
    forfatter_id: forfatterID,
    order: 'created_at.desc'
  });
}

// Hent alle brukere
export async function hentBrukere() {
  return tabellCache.hentFraTabell(brukere);
}

// Hent en enkelt bruker
export async function hentBruker(id) {
  return tabellCache.hentEnkeltRad(brukere, id);
}

// Laster nøkkeldata i cache ved oppstart av appen
export function preloadAlleData() {
  // Hent godkjente artikler
  hentGodkjenteArtikler().then(data => {
    console.log('Preloaded godkjente artikler:', data.success ? data.data.length : 0);
  });
  
  // Hent alle kategorier
  tabellCache.hentFraTabell('kategorier').then(data => {
    console.log('Preloaded kategorier:', data.success ? data.data.length : 0);
  });
  
  // Hent settings
  tabellCache.hentFraTabell('website_settings').then(data => {
    console.log('Preloaded settings');
  });
} 