// components/MineArtikler.js
import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import './MineArtikler.css';

function MineArtikler({ innloggetBruker, artikler = [], onDeleteArticle, onUpdateArticle }) {
  const [redigerArtikkel, setRedigerArtikkel] = useState(null);
  const [melding, setMelding] = useState('');
  
  // Sjekk om brukeren er logget inn
  if (!innloggetBruker) {
    return (
      <div className="ikke-godkjent">
        <h2>Du må være logget inn</h2>
        <p>Du må logge inn for å se dine artikler.</p>
        <Link to="/login">Logg inn</Link>
      </div>
    );
  }
  
  // Filtrer artikler som tilhører den innloggede brukeren
  const mineArtikler = artikler.filter(artikkel => artikkel.forfatterID === innloggetBruker.id);
  
  const handleDeleteArticle = (artikkelId) => {
    if (window.confirm('Er du sikker på at du vil slette denne artikkelen?')) {
      onDeleteArticle(artikkelId);
      setMelding('Artikkelen ble slettet');
      setTimeout(() => setMelding(''), 3000);
    }
  };
  
  const handleEditArticle = (artikkel) => {
    setRedigerArtikkel({ ...artikkel });
  };
  
  const handleUpdateArticle = (e) => {
    e.preventDefault();
    onUpdateArticle(redigerArtikkel);
    setRedigerArtikkel(null);
    setMelding('Artikkelen ble oppdatert');
    setTimeout(() => setMelding(''), 3000);
  };
  
  const handleCancelEdit = () => {
    setRedigerArtikkel(null);
  };
  
  return (
    <div className="mine-artikler">
      <h2>Mine artikler</h2>
      
      {melding && <div className="melding-boks">{melding}</div>}
      
      {mineArtikler.length === 0 ? (
        <div className="ingen-artikler">
          <p>Du har ikke skrevet noen artikler ennå.</p>
          <Link to="/ny-artikkel" className="ny-artikkel-knapp">Skriv din første artikkel</Link>
        </div>
      ) : (
        <>
          <div className="artikkel-header">
            <p>Du har skrevet {mineArtikler.length} {mineArtikler.length === 1 ? 'artikkel' : 'artikler'}</p>
            <Link to="/ny-artikkel" className="ny-artikkel-knapp">Skriv ny artikkel</Link>
          </div>
          
          {redigerArtikkel ? (
            <div className="rediger-form">
              <h3>Rediger artikkel</h3>
              <form onSubmit={handleUpdateArticle}>
                <div className="form-gruppe">
                  <label htmlFor="tittel">Tittel:</label>
                  <input 
                    type="text"
                    id="tittel"
                    value={redigerArtikkel.tittel}
                    onChange={(e) => setRedigerArtikkel({...redigerArtikkel, tittel: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-gruppe">
                  <label htmlFor="ingress">Ingress:</label>
                  <textarea 
                    id="ingress"
                    value={redigerArtikkel.ingress}
                    onChange={(e) => setRedigerArtikkel({...redigerArtikkel, ingress: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-gruppe">
                  <label htmlFor="innhold">Innhold:</label>
                  <textarea 
                    id="innhold"
                    value={redigerArtikkel.innhold}
                    onChange={(e) => setRedigerArtikkel({...redigerArtikkel, innhold: e.target.value})}
                    required
                    rows="10"
                  />
                </div>
                
                <div className="form-gruppe">
                  <label htmlFor="bilde">Bilde URL:</label>
                  <input 
                    type="text"
                    id="bilde"
                    value={redigerArtikkel.bilde}
                    onChange={(e) => setRedigerArtikkel({...redigerArtikkel, bilde: e.target.value})}
                  />
                </div>
                
                <div className="form-gruppe">
                  <label htmlFor="kategori">Kategori:</label>
                  <select 
                    id="kategori"
                    value={redigerArtikkel.kategori}
                    onChange={(e) => setRedigerArtikkel({...redigerArtikkel, kategori: e.target.value})}
                    required
                  >
                    <option value="nyheter">Nyheter</option>
                    <option value="kultur">Kultur</option>
                    <option value="sport">Sport</option>
                    <option value="skole">Skole</option>
                    <option value="annet">Annet</option>
                  </select>
                </div>
                
                <div className="form-gruppe">
                  <label htmlFor="status">Status:</label>
                  <select 
                    id="status"
                    value={redigerArtikkel.status}
                    onChange={(e) => setRedigerArtikkel({...redigerArtikkel, status: e.target.value})}
                    required
                  >
                    <option value="publisert">Publisert</option>
                    <option value="utkast">Utkast</option>
                  </select>
                </div>
                
                <div className="knapp-gruppe">
                  <button type="submit" className="lagre-knapp">Lagre endringer</button>
                  <button type="button" className="avbryt-knapp" onClick={handleCancelEdit}>Avbryt</button>
                </div>
              </form>
            </div>
          ) : (
            <div className="artikkel-liste">
              {mineArtikler.map(artikkel => (
                <div key={artikkel.id} className="artikkel-kort">
                  <div className="artikkel-info">
                    <h3>{artikkel.tittel}</h3>
                    <div className="artikkel-meta">
                      <span className={`status-${artikkel.status}`}>{artikkel.status}</span>
                      <span className="kategori">{artikkel.kategori}</span>
                      <span className="dato">
                        {artikkel.dato ? 
                          new Date(artikkel.dato).toLocaleDateString('nb-NO') : 
                          'Ukjent dato'}
                      </span>
                    </div>
                    <p className="ingress">{artikkel.ingress}</p>
                  </div>
                  
                  <div className="artikkel-handlinger">
                    <Link to={`/artikkel/${artikkel.id}`} className="vis-knapp">Vis</Link>
                    <button 
                      className="rediger-knapp" 
                      onClick={() => handleEditArticle(artikkel)}
                    >
                      Rediger
                    </button>
                    <button 
                      className="slett-knapp" 
                      onClick={() => handleDeleteArticle(artikkel.id)}
                    >
                      Slett
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MineArtikler; 