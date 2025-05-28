// components/Hjem.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Hjem.css';
import { hentGodkjenteArtikler, brukere } from '../utils/directCache';

function Hjem({ artikler = [] }) {
  const [cachedArtikler, setCachedArtikler] = useState([]);
  const [laster, setLaster] = useState(true);
  
  // Last artikler fra direktecache ved oppstart
  useEffect(() => {
    const lastArtiklerFraCache = async () => {
      try {
        // Hent fra cache først (øyeblikkelig respons)
        const resultat = await hentGodkjenteArtikler();
        if (resultat.success && Array.isArray(resultat.data)) {
          setCachedArtikler(resultat.data);
        }
      } catch (error) {
        console.error('Feil ved henting av artikler fra cache:', error);
      } finally {
        setLaster(false);
      }
    };
    
    lastArtiklerFraCache();
  }, []);
  
  // Bruk artikler fra props hvis tilgjengelig, ellers bruk fra cache
  const alleArtikler = artikler.length > 0 ? artikler : cachedArtikler;
  
  // Filtrer ut godkjente artikler og sorter etter dato (nyeste først)
  const godkjenteArtikler = alleArtikler
    .filter(artikkel => artikkel.godkjent)
    .sort((a, b) => new Date(b.created_at || b.dato) - new Date(a.created_at || a.dato));
  
  // Grupperer artikler etter kategori
  const artiklerEtterKategori = godkjenteArtikler.reduce((grupper, artikkel) => {
    const kategori = artikkel.kategori || 'Ukategorisert';
    if (!grupper[kategori]) {
      grupper[kategori] = [];
    }
    grupper[kategori].push(artikkel);
    return grupper;
  }, {});
  
  // Henter de 3 nyeste artiklene til hovedoppslag
  const hovedoppslag = godkjenteArtikler.slice(0, 3);
  
  // Vis laster-indikator mens vi henter data
  if (laster && godkjenteArtikler.length === 0) {
    return (
      <div className="laster-container">
        <div className="laster-spinner"></div>
        <p>Laster artikler...</p>
      </div>
    );
  }
  
  return (
    <div className="hjem">
      <section className="hovedoppslag">
        <h2 className="seksjon-tittel">Siste nytt</h2>
        
        <div className="hovedoppslag-grid">
          {hovedoppslag.map(artikkel => (
            <article key={artikkel.id || artikkel.artikkelID} className="hovedoppslag-artikkel">
              <Link to={`/artikkel/${artikkel.id || artikkel.artikkelID}`}>
                {artikkel.bilde && (
                  <div className="artikkel-bilde">
                    <img src={artikkel.bilde} alt={artikkel.tittel} />
                  </div>
                )}
                
                <div className="artikkel-info">
                  <h3 className="artikkel-tittel">{artikkel.tittel}</h3>
                  <p className="artikkel-ingress">{artikkel.ingress}</p>
                  
                  <div className="artikkel-meta">
                    <span className="artikkel-forfatter">{artikkel.forfatter_navn || artikkel.forfatter}</span>
                    <span className="artikkel-dato">
                      {(artikkel.created_at || artikkel.dato) ? 
                        new Date(artikkel.created_at || artikkel.dato).toLocaleDateString('no-NO') : 
                        'Ukjent dato'}
                    </span>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>
      
      {Object.keys(artiklerEtterKategori).map(kategori => (
        <section key={kategori} className="kategori-seksjon">
          <h2 className="seksjon-tittel">{kategori}</h2>
          
          <div className="artikkel-grid">
            {artiklerEtterKategori[kategori].map(artikkel => (
              <article key={artikkel.id || artikkel.artikkelID} className="artikkel-kort">
                <Link to={`/artikkel/${artikkel.id || artikkel.artikkelID}`}>
                  {artikkel.bilde && (
                    <div className="artikkel-bilde">
                      <img src={artikkel.bilde} alt={artikkel.tittel} />
                    </div>
                  )}
                  
                  <h3 className="artikkel-tittel">{artikkel.tittel}</h3>
                  <p className="artikkel-ingress">{artikkel.ingress && artikkel.ingress.substring(0, 100)}...</p>
                  
                  <div className="artikkel-meta">
                    <span className="artikkel-forfatter">{artikkel.forfatter_navn || artikkel.forfatter}</span>
                    <span className="artikkel-dato">
                      {(artikkel.created_at || artikkel.dato) ? 
                        new Date(artikkel.created_at || artikkel.dato).toLocaleDateString('no-NO') : 
                        'Ukjent dato'}
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>
      ))}
      
      {godkjenteArtikler.length === 0 && (
        <div className="ingen-artikler">
          <h2>Ingen artikler ennå</h2>
          <p>Det er ingen publiserte artikler i Nyskolen Posten ennå.</p>
          <p>
            <Link to="/ny-artikkel" className="skriv-artikkel-knapp">
              Skriv den første artikkelen!
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}

export default Hjem;