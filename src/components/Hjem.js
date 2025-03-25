// components/Hjem.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Hjem.css';

function Hjem({ artikler = [] }) {
  // Filtrer ut godkjente artikler og sorter etter dato (nyeste først)
  const godkjenteArtikler = artikler
    .filter(artikkel => artikkel.godkjent)
    .sort((a, b) => new Date(b.dato) - new Date(a.dato));
  
  // Grupperer artikler etter kategori
  const artiklerEtterKategori = godkjenteArtikler.reduce((grupper, artikkel) => {
    if (!grupper[artikkel.kategori]) {
      grupper[artikkel.kategori] = [];
    }
    grupper[artikkel.kategori].push(artikkel);
    return grupper;
  }, {});
  
  // Henter de 3 nyeste artiklene til hovedoppslag
  const hovedoppslag = godkjenteArtikler.slice(0, 3);
  
  return (
    <div className="hjem">
      <section className="hovedoppslag">
        <h2 className="seksjon-tittel">Siste nytt</h2>
        
        <div className="hovedoppslag-grid">
          {hovedoppslag.map(artikkel => (
            <article key={artikkel.artikkelID} className="hovedoppslag-artikkel">
              <Link to={`/artikkel/${artikkel.artikkelID}`}>
                {artikkel.bilde && (
                  <div className="artikkel-bilde">
                    <img src={artikkel.bilde} alt={artikkel.tittel} />
                  </div>
                )}
                
                <div className="artikkel-info">
                  <h3 className="artikkel-tittel">{artikkel.tittel}</h3>
                  <p className="artikkel-ingress">{artikkel.ingress}</p>
                  
                  <div className="artikkel-meta">
                    <span className="artikkel-forfatter">{artikkel.forfatter}</span>
                    <span className="artikkel-dato">
                      {new Date(artikkel.dato).toLocaleDateString('no-NO')}
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
              <article key={artikkel.artikkelID} className="artikkel-kort">
                <Link to={`/artikkel/${artikkel.artikkelID}`}>
                  {artikkel.bilde && (
                    <div className="artikkel-bilde">
                      <img src={artikkel.bilde} alt={artikkel.tittel} />
                    </div>
                  )}
                  
                  <h3 className="artikkel-tittel">{artikkel.tittel}</h3>
                  <p className="artikkel-ingress">{artikkel.ingress.substring(0, 100)}...</p>
                  
                  <div className="artikkel-meta">
                    <span className="artikkel-forfatter">{artikkel.forfatter}</span>
                    <span className="artikkel-dato">
                      {new Date(artikkel.dato).toLocaleDateString('no-NO')}
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