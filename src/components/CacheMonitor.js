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
  const [refreshToggle, setRefreshToggle] = useState(false);

  // Oppdater cache-informasjon hver gang komponenten rendres eller refreshToggle endres
  useEffect(() => {
    if (isVisible) {
      refreshCacheInfo();
    }
  }, [isVisible, refreshToggle]);

  // Funksjon for å oppdatere cache-informasjon
  const refreshCacheInfo = () => {
    const entries = Object.keys(cacheManager.cache).map(key => {
      const expiryTime = cacheManager.expiry[key];
      const timeLeft = Math.round((expiryTime - Date.now()) / 1000);
      
      return {
        key,
        value: cacheManager.cache[key],
        expiryTime,
        timeLeft,
        isExpired: timeLeft <= 0
      };
    });
    
    setCacheEntries(entries.sort((a, b) => a.key.localeCompare(b.key)));
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
          <button onClick={() => setRefreshToggle(!refreshToggle)} title="Oppdater">🔄</button>
          <button onClick={clearAllCache} title="Tøm cache">🧹</button>
          <button onClick={() => setIsVisible(false)} title="Lukk">✖️</button>
        </div>
      </div>
      
      <div className="cache-stats">
        <div className="cache-stat-item">
          <span className="cache-stat-label">Antall cache-nøkler:</span>
          <span className="cache-stat-value">{cacheEntries.length}</span>
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