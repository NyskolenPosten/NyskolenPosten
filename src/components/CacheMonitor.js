// components/CacheMonitor.js
import React, { useState, useEffect } from 'react';
import cacheManager from '../utils/cacheUtil';
import './CacheMonitor.css';

/**
 * Komponent for å vise og administrere cache i utviklermodus
 * Vises kun i utviklingsmiljø (process.env.NODE_ENV === 'development')
 */
const CacheMonitor = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [cacheEntries, setCacheEntries] = useState([]);
  const [cacheStats, setCacheStats] = useState({});
  const [refreshToggle, setRefreshToggle] = useState(false);
  const [maxCacheSize, setMaxCacheSize] = useState(50);
  const [gcEnabled, setGcEnabled] = useState(true);
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);
  const [memoryUsage, setMemoryUsage] = useState({});

  // Oppdater cache-informasjon hver gang komponenten rendres eller refreshToggle endres
  useEffect(() => {
    if (isVisible) {
      refreshCacheInfo();
      
      // Start auto-refresh hvis aktivert
      let interval;
      if (isAutoRefresh) {
        interval = setInterval(() => {
          refreshCacheInfo();
        }, 2000); // Oppdater hvert 2. sekund
      }
      
      // Cleanup
      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [isVisible, refreshToggle, isAutoRefresh]);

  // Funksjon for å oppdatere cache-informasjon
  const refreshCacheInfo = () => {
    // Hent cache-statistikk
    const stats = cacheManager.getStats();
    setCacheStats(stats);
    
    // Hent cache-entries
    const entries = Object.keys(cacheManager.cache).map(key => {
      const expiryTime = cacheManager.expiry[key];
      const timeLeft = Math.round((expiryTime - Date.now()) / 1000);
      const hitCount = cacheManager.cacheHitCount[key] || 0;
      const value = cacheManager.cache[key];
      
      // Estimer størrelsen (grovt estimat)
      let estimatedSize = 0;
      try {
        const jsonString = JSON.stringify(value);
        estimatedSize = jsonString.length * 2; // Unicode-tegn bruker ca. 2 bytes
      } catch (e) {
        estimatedSize = 512; // Standardverdi hvis serialisering feiler
      }
      
      return {
        key,
        value,
        expiryTime,
        timeLeft,
        isExpired: timeLeft <= 0,
        hitCount,
        estimatedSize
      };
    });
    
    // Sorter etter nøkkel
    setCacheEntries(entries.sort((a, b) => a.key.localeCompare(b.key)));
    
    // Estimer totalt minnebruk
    const totalEntrySize = entries.reduce((sum, entry) => sum + entry.estimatedSize, 0);
    
    // Estimer total minnebruk
    setMemoryUsage({
      entriesSize: formatBytes(totalEntrySize),
      rawSize: totalEntrySize
    });
  };

  // Funksjon for å fjerne en cache-entry
  const removeCacheEntry = (key) => {
    cacheManager.remove(key);
    setRefreshToggle(!refreshToggle);
  };

  // Funksjon for å tømme hele cachen
  const clearAllCache = () => {
    cacheManager.clear();
    setRefreshToggle(!refreshToggle);
  };
  
  // Funksjon for å endre maksimal cache-størrelse
  const handleMaxSizeChange = (event) => {
    const newSize = parseInt(event.target.value, 10);
    if (!isNaN(newSize) && newSize > 0) {
      setMaxCacheSize(newSize);
      cacheManager.setMaxSize(newSize);
      setRefreshToggle(!refreshToggle);
    }
  };
  
  // Funksjon for å kjøre manuell garbage collection
  const runManualGC = () => {
    const removedCount = cacheManager.runGarbageCollection();
    alert(`Garbage collection fjernet ${removedCount} utløpte elementer`);
    setRefreshToggle(!refreshToggle);
  };
  
  // Funksjon for å aktivere/deaktivere automatisk garbage collection
  const toggleGC = () => {
    if (gcEnabled) {
      cacheManager.stopGarbageCollection();
      setGcEnabled(false);
    } else {
      cacheManager.startGarbageCollection();
      setGcEnabled(true);
    }
  };
  
  // Hjelpefunksjon for å formatere bytes til lesbar størrelse
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Vis ikke i produksjonsmiljø
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  // Toggle-knapp kun når monitor er lukket
  if (!isVisible) {
    return (
      <button 
        className="cache-monitor-toggle" 
        onClick={() => setIsVisible(true)}
        title="Åpne Cache Monitor"
      >
        🔍 Cache
      </button>
    );
  }

  return (
    <div className="cache-monitor">
      <div className="cache-monitor-header">
        <h3>Cache Monitor</h3>
        <div className="cache-monitor-actions">
          <button 
            onClick={() => setIsAutoRefresh(!isAutoRefresh)} 
            title={isAutoRefresh ? "Stopp auto-oppdatering" : "Start auto-oppdatering"}
            className={isAutoRefresh ? "active" : ""}
          >
            {isAutoRefresh ? "⏹️" : "▶️"}
          </button>
          <button 
            onClick={() => setRefreshToggle(!refreshToggle)} 
            title="Oppdater manuelt"
          >
            🔄
          </button>
          <button 
            onClick={runManualGC} 
            title="Kjør garbage collection"
          >
            🗑️
          </button>
          <button 
            onClick={toggleGC} 
            title={gcEnabled ? "Deaktiver auto GC" : "Aktiver auto GC"}
            className={gcEnabled ? "active" : ""}
          >
            {gcEnabled ? "🔄 GC" : "⏸️ GC"}
          </button>
          <button onClick={clearAllCache} title="Tøm cache">🧹</button>
          <button onClick={() => setIsVisible(false)} title="Lukk">✖️</button>
        </div>
      </div>
      
      <div className="cache-controls">
        <div className="cache-control-item">
          <label htmlFor="maxCacheSize">Maks cache-størrelse:</label>
          <input 
            type="number" 
            id="maxCacheSize" 
            value={maxCacheSize} 
            onChange={handleMaxSizeChange}
            min="1"
            max="1000"
          />
        </div>
      </div>
      
      <div className="cache-stats">
        <div className="cache-stat-item">
          <span className="cache-stat-label">Aktive nøkler:</span>
          <span className="cache-stat-value">{cacheStats.activeSize || 0} / {cacheStats.maxSize || 0}</span>
        </div>
        <div className="cache-stat-item">
          <span className="cache-stat-label">Utløpte nøkler:</span>
          <span className="cache-stat-value">{cacheStats.expiredSize || 0}</span>
        </div>
        <div className="cache-stat-item">
          <span className="cache-stat-label">Estimert minne:</span>
          <span className="cache-stat-value">{memoryUsage.entriesSize || '0 Bytes'}</span>
        </div>
      </div>
      
      <div className="cache-entries">
        {cacheEntries.length === 0 ? (
          <div className="cache-empty">Cachen er tom</div>
        ) : (
          cacheEntries.map(entry => (
            <div key={entry.key} className={`cache-entry ${entry.isExpired ? 'expired' : ''}`}>
              <div className="cache-entry-header">
                <div className="cache-key">{entry.key}</div>
                <div className="cache-actions">
                  <button 
                    onClick={() => removeCacheEntry(entry.key)} 
                    title="Fjern fra cache"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div className="cache-entry-details">
                <div className="cache-hits">
                  <span className="cache-label">Brukt:</span>
                  <span className="cache-value">{entry.hitCount} ganger</span>
                </div>
                <div className="cache-size">
                  <span className="cache-label">Størrelse:</span>
                  <span className="cache-value">{formatBytes(entry.estimatedSize)}</span>
                </div>
              </div>
              <div className="cache-expiry">
                <span className={`cache-time-left ${entry.timeLeft < 60 ? 'expiring-soon' : ''}`}>
                  {entry.isExpired 
                    ? 'Utløpt' 
                    : `Utløper om ${Math.floor(entry.timeLeft / 60)}m ${entry.timeLeft % 60}s`}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CacheMonitor; 