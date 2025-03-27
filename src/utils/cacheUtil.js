// cacheUtil.js - Cache-løsning for Nyskolen Posten

/**
 * En enkel cache-manager for å forbedre ytelsen ved å mellomlagre ofte brukte data
 */
class CacheManager {
  constructor() {
    this.cache = {};
    this.expiry = {};
    this.defaultTTL = 5 * 60 * 1000; // 5 minutter standard TTL (Time To Live)
    this.maxCacheSize = 50; // Maksimalt antall elementer i cachen
    this.cacheHitCount = {}; // Teller antall ganger en cache-verdi er hentet
    this.gcInterval = null; // Intervall for garbage collection
    
    // Start automatisk garbage collection
    this.startGarbageCollection();
  }

  /**
   * Starter automatisk garbage collection som kjører hvert minutt
   */
  startGarbageCollection() {
    // Rydd opp i utløpte verdier hvert minutt
    this.gcInterval = setInterval(() => {
      this.runGarbageCollection();
    }, 60 * 1000); // Kjør hvert minutt
  }
  
  /**
   * Stopper automatisk garbage collection
   */
  stopGarbageCollection() {
    if (this.gcInterval) {
      clearInterval(this.gcInterval);
      this.gcInterval = null;
    }
  }
  
  /**
   * Kjører garbage collection for å fjerne utløpte verdier
   */
  runGarbageCollection() {
    const now = Date.now();
    let removed = 0;
    
    // Fjern utløpte verdier
    Object.keys(this.expiry).forEach(key => {
      if (this.expiry[key] <= now) {
        this.remove(key);
        removed++;
      }
    });
    
    // Logg resultatet i utviklingsmiljø
    if (process.env.NODE_ENV === 'development' && removed > 0) {
      console.log(`🧹 Cache GC: Fjernet ${removed} utløpte verdier`);
    }
    
    // Fjern minst brukte verdier hvis cachen overstiger maksimal størrelse
    this.enforceCacheLimit();
    
    return removed;
  }
  
  /**
   * Fjerner minst brukte elementer hvis cachen overstiger maksimal størrelse
   */
  enforceCacheLimit() {
    const cacheSize = Object.keys(this.cache).length;
    
    if (cacheSize <= this.maxCacheSize) {
      return; // Cachen er innenfor tillatt størrelse
    }
    
    // Antall elementer som må fjernes
    const removeCount = cacheSize - this.maxCacheSize;
    
    // Sorter elementer etter brukhyppighet (minst brukt først)
    const sortedItems = Object.keys(this.cache)
      .map(key => ({
        key,
        hits: this.cacheHitCount[key] || 0,
        expiry: this.expiry[key] || 0
      }))
      .sort((a, b) => {
        // Sorter først etter brukhyppighet, deretter etter utløpstid
        if (a.hits === b.hits) {
          return a.expiry - b.expiry; // Hvis like mange treff, fjern de som utløper først
        }
        return a.hits - b.hits; // Fjern minst brukte først
      });
    
    // Fjern de minst brukte elementene
    for (let i = 0; i < removeCount; i++) {
      if (i < sortedItems.length) {
        this.remove(sortedItems[i].key);
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`🗑️ Cache LRU: Fjernet '${sortedItems[i].key}' (brukt ${sortedItems[i].hits} ganger)`);
        }
      }
    }
  }

  /**
   * Setter verdi i cachen med en valgfri TTL (Time To Live)
   * @param {string} key - Nøkkelen for cacheverdien
   * @param {*} value - Verdien som skal caches
   * @param {number} ttl - Time To Live i millisekunder (valgfri)
   */
  set(key, value, ttl = this.defaultTTL) {
    // Kjør garbage collection først hvis cachen er full
    if (Object.keys(this.cache).length >= this.maxCacheSize) {
      this.enforceCacheLimit();
    }
    
    this.cache[key] = value;
    const expiryTime = Date.now() + ttl;
    this.expiry[key] = expiryTime;
    
    // Nullstill hit count for ny verdi
    this.cacheHitCount[key] = 0;
    
    // Logg til konsoll i utviklingsmiljø
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔵 Cache: Lagret '${key}' (utløper om ${Math.round(ttl/1000)}s)`);
    }
    
    return value;
  }

  /**
   * Henter verdi fra cachen hvis den finnes og ikke er utløpt
   * @param {string} key - Nøkkelen for cacheverdien
   * @returns {*} Den cachede verdien eller null hvis den ikke finnes/er utløpt
   */
  get(key) {
    const value = this.cache[key];
    const expiryTime = this.expiry[key];
    
    // Sjekk om verdien finnes og ikke er utløpt
    if (value !== undefined && expiryTime > Date.now()) {
      // Øk antall hits for denne nøkkelen
      this.cacheHitCount[key] = (this.cacheHitCount[key] || 0) + 1;
      
      // Logg til konsoll i utviklingsmiljø
      if (process.env.NODE_ENV === 'development') {
        const timeLeft = Math.round((expiryTime - Date.now()) / 1000);
        console.log(`🟢 Cache: Hentet '${key}' fra cache (utløper om ${timeLeft}s, brukt ${this.cacheHitCount[key]} ganger)`);
      }
      return value;
    }
    
    // Hvis verdien er utløpt, fjern den
    if (value !== undefined) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`🟠 Cache: '${key}' er utløpt og fjernet`);
      }
      this.remove(key);
    }
    
    return null;
  }

  /**
   * Fjerner en verdi fra cachen
   * @param {string} key - Nøkkelen for cacheverdien
   */
  remove(key) {
    delete this.cache[key];
    delete this.expiry[key];
    delete this.cacheHitCount[key];
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔴 Cache: Fjernet '${key}' fra cache`);
    }
  }

  /**
   * Tømmer hele cachen
   */
  clear() {
    this.cache = {};
    this.expiry = {};
    this.cacheHitCount = {};
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🧹 Cache: Tømt hele cachen');
    }
  }

  /**
   * Henter en verdi med en funksjon som genererer verdien hvis den ikke er cachet
   * @param {string} key - Nøkkelen for cacheverdien
   * @param {Function} fetchFn - Funksjon som henter/genererer verdien hvis den ikke er cachet
   * @param {number} ttl - Time To Live i millisekunder (valgfri)
   * @returns {Promise<*>} Den cachede verdien eller resultatet av fetchFn
   */
  async getOrFetch(key, fetchFn, ttl = this.defaultTTL) {
    // Sjekk om verdien er i cachen
    const cachedValue = this.get(key);
    if (cachedValue !== null) {
      return cachedValue;
    }
    
    // Hvis ikke i cache, hent verdien
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 Cache: Henter '${key}' fra kilde...`);
    }
    
    try {
      const result = await fetchFn();
      // Lagre resultatet i cachen
      return this.set(key, result, ttl);
    } catch (error) {
      console.error(`Cache: Feil ved henting av '${key}'`, error);
      throw error;
    }
  }

  /**
   * Invaliderer alle cache-nøkler som matcher et mønster
   * @param {string|RegExp} pattern - Strengmønster eller RegExp for å matche nøkler
   */
  invalidatePattern(pattern) {
    const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
    const keys = Object.keys(this.cache);
    
    keys.forEach(key => {
      if (regex.test(key)) {
        this.remove(key);
      }
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🧹 Cache: Invalidert nøkler som matcher '${pattern}'`);
    }
  }
  
  /**
   * Setter maksimalt antall elementer i cachen
   * @param {number} size - Maksimalt antall elementer
   */
  setMaxSize(size) {
    if (size < 1) {
      throw new Error('Maksimal cache-størrelse må være minst 1');
    }
    
    this.maxCacheSize = size;
    
    // Tving håndhevelse av ny størrelse
    this.enforceCacheLimit();
  }
  
  /**
   * Returnerer statistikk om cachen
   * @returns {Object} Cache-statistikk
   */
  getStats() {
    const keys = Object.keys(this.cache);
    const now = Date.now();
    
    // Tell aktive vs utløpte elementer
    let activeCount = 0;
    let expiredCount = 0;
    
    keys.forEach(key => {
      if (this.expiry[key] > now) {
        activeCount++;
      } else {
        expiredCount++;
      }
    });
    
    return {
      totalSize: keys.length,
      activeSize: activeCount,
      expiredSize: expiredCount,
      maxSize: this.maxCacheSize,
      hitCounts: { ...this.cacheHitCount }
    };
  }
}

// Eksporter en singleton-instans
export const cacheManager = new CacheManager();

/**
 * Dekoratør for å cache resultatet av en funksjon
 * @param {string} keyPrefix - Prefiks for cache-nøkkelen
 * @param {number} ttl - Time To Live i millisekunder (valgfri)
 * @returns {Function} Dekorert funksjon med caching
 */
export function withCache(keyPrefix, ttl) {
  return function(target, name, descriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args) {
      // Generer en cache-nøkkel basert på funksjonsnavn, prefiks og argumenter
      const key = `${keyPrefix}:${name}:${JSON.stringify(args)}`;
      
      // Bruk cacheManager til å hente eller generere verdien
      return cacheManager.getOrFetch(key, async () => {
        return originalMethod.apply(this, args);
      }, ttl);
    };
    
    return descriptor;
  };
}

/**
 * Hjelpefunksjon for å invalidere cache for artikler
 */
export function invalidateArtikkelCache() {
  cacheManager.invalidatePattern(/^artikkel:/);
}

/**
 * Hjelpefunksjon for å invalidere cache for brukere
 */
export function invalidateBrukerCache() {
  cacheManager.invalidatePattern(/^bruker:/);
}

// Når applikasjonen lukkes eller refreshes, stopp garbage collection
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    cacheManager.stopGarbageCollection();
  });
}

export default cacheManager; 