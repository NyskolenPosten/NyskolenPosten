// cacheUtil.js - Cache-løsning for Nyskolen Posten

/**
 * En enkel cache-manager for å forbedre ytelsen ved å mellomlagre ofte brukte data
 */
class CacheManager {
  constructor() {
    this.cache = {};
    this.expiry = {};
    this.defaultTTL = 5 * 60 * 1000; // 5 minutter standard TTL (Time To Live)
  }

  /**
   * Setter verdi i cachen med en valgfri TTL (Time To Live)
   * @param {string} key - Nøkkelen for cacheverdien
   * @param {*} value - Verdien som skal caches
   * @param {number} ttl - Time To Live i millisekunder (valgfri)
   */
  set(key, value, ttl = this.defaultTTL) {
    this.cache[key] = value;
    const expiryTime = Date.now() + ttl;
    this.expiry[key] = expiryTime;
    
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
      // Logg til konsoll i utviklingsmiljø
      if (process.env.NODE_ENV === 'development') {
        const timeLeft = Math.round((expiryTime - Date.now()) / 1000);
        console.log(`🟢 Cache: Hentet '${key}' fra cache (utløper om ${timeLeft}s)`);
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

export default cacheManager; 