// components/ArtikkelVisning.js
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import './ArtikkelVisning.css';

function ArtikkelVisning({ artikler }) {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Finner artikkelen basert på ID
  const artikkel = artikler.find(a => a.artikkelID === id);
  
  // Hvis artikkelen ikke finnes
  if (!artikkel) {
    return (
      <div className="artikkel-ikke-funnet">
        <h2>Artikkel ikke funnet</h2>
        <p>Beklager, vi kunne ikke finne artikkelen du leter etter.</p>
        <Link to="/">Gå tilbake til forsiden</Link>
      </div>
    );
  }
  
  // Formaterer dato
  const formatertDato = new Date(artikkel.dato).toLocaleDateString('no-NO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return (
    <div className="artikkel-visning">
      <button onClick={() => navigate(-1)} className="tilbake-knapp">
        &larr; Tilbake
      </button>
      
      <article>
        <header>
          <h1>{artikkel.tittel}</h1>
          <div className="artikkel-meta">
            <span className="kategori">{artikkel.kategori}</span>
            <span className="dato">Publisert: {formatertDato}</span>
            <span className="forfatter">Av: {artikkel.forfatter}</span>
          </div>
        </header>
        
        <div className="artikkel-ingress">
          {artikkel.ingress}
        </div>
        
        {artikkel.bilde && (
          <div className="artikkel-bilde">
            <img src={artikkel.bilde} alt={artikkel.tittel} />
          </div>
        )}
        
        <div className="artikkel-innhold">
          <ReactMarkdown>{artikkel.innhold}</ReactMarkdown>
        </div>
      </article>
    </div>
  );
}

export default ArtikkelVisning; 