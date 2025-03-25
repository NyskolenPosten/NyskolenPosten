// components/Hjem.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Hjem.css';

function Hjem({ artikler }) {
  // Grupperer artikler etter kategori
  const grupperteArtikler = artikler.reduce((acc, artikkel) => {
    if (!acc[artikkel.kategori]) {
      acc[artikkel.kategori] = [];
    }
    acc[artikkel.kategori].push(artikkel);
    return acc;
  }, {});
  
  // Tar de tre nyeste artiklene til hovedoppslag
  const hovedoppslag = [...artikler].sort((a, b) => 
    new Date(b.dato) - new Date(a.dato)
  ).slice(0, 3);
  
  return (
    <div className="hjem">
      <section className="hovedoppslag">
        <h2>Siste nytt fra Nyskolen</h2>
        <div className="hovedoppslag-grid">
          {hovedoppslag.map(artikkel => (
            <div key={artikkel.artikkelID} className="hovedoppslag-artikkel">
              {artikkel.bilde && <img src={artikkel.bilde} alt={artikkel.tittel} />}
              <h3>{artikkel.tittel}</h3>
              <p className="forfatter">Av: {artikkel.forfatter} | {new Date(artikkel.dato).toLocaleDateString('no-NO')}</p>
              <p className="ingress">{artikkel.ingress}</p>
              <Link to={`/artikkel/${artikkel.artikkelID}`} className="les-mer">Les mer</Link>
            </div>
          ))}
        </div>
      </section>
      
      {Object.keys(grupperteArtikler).map(kategori => (
        <section key={kategori} className="kategori-seksjon">
          <h2>{kategori}</h2>
          <div className="artikkel-grid">
            {grupperteArtikler[kategori].map(artikkel => (
              <div key={artikkel.artikkelID} className="artikkel-kort">
                <h3>{artikkel.tittel}</h3>
                <p className="dato">{new Date(artikkel.dato).toLocaleDateString('no-NO')}</p>
                <Link to={`/artikkel/${artikkel.artikkelID}`}>Les artikkelen</Link>
              </div>
            ))}
          </div>
        </section>
      ))}
      
      {artikler.length === 0 && (
        <div className="ingen-artikler">
          <h2>Ingen artikler ennå</h2>
          <p>Bli den første til å skrive en artikkel til Nyskolen Posten!</p>
          <Link to="/ny-artikkel" className="ny-artikkel-knapp">Skriv en artikkel</Link>
        </div>
      )}
    </div>
  );
}

export default Hjem;