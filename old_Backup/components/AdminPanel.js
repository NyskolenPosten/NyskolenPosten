// components/AdminPanel.js
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import './AdminPanel.css';

function AdminPanel({ innloggetBruker, artikler = [], brukere = [], onDeleteArticle, onUpdateArticle, onUpdateUser, onDeleteUser }) {
  const [aktivFane, setAktivFane] = useState('artikler');
  const [redigerArtikkel, setRedigerArtikkel] = useState(null);
  const [redigerBruker, setRedigerBruker] = useState(null);
  const [melding, setMelding] = useState('');
  const [feilmelding, setFeilmelding] = useState('');
  
  // Sjekk om brukeren er admin
  if (!innloggetBruker || innloggetBruker.rolle !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  const handleDeleteArticle = (artikkelId) => {
    if (window.confirm('Er du sikker på at du vil slette denne artikkelen?')) {
      onDeleteArticle(artikkelId);
      setMelding('Artikkelen ble slettet');
      setTimeout(() => setMelding(''), 3000);
    }
  };
  
  const handleDeleteUser = (brukerId) => {
    if (brukerId === innloggetBruker.id) {
      setFeilmelding('Du kan ikke slette din egen brukerkonto');
      setTimeout(() => setFeilmelding(''), 3000);
      return;
    }
    
    if (window.confirm('Er du sikker på at du vil slette denne brukeren?')) {
      onDeleteUser(brukerId);
      setMelding('Brukeren ble slettet');
      setTimeout(() => setMelding(''), 3000);
    }
  };
  
  const handleEditArticle = (artikkel) => {
    setRedigerArtikkel({ ...artikkel });
  };
  
  const handleEditUser = (bruker) => {
    setRedigerBruker({ ...bruker });
  };
  
  const handleUpdateArticle = (e) => {
    e.preventDefault();
    onUpdateArticle(redigerArtikkel);
    setRedigerArtikkel(null);
    setMelding('Artikkelen ble oppdatert');
    setTimeout(() => setMelding(''), 3000);
  };
  
  const handleUpdateUser = (e) => {
    e.preventDefault();
    
    if (redigerBruker.id === innloggetBruker.id && redigerBruker.rolle !== 'admin') {
      setFeilmelding('Du kan ikke endre din egen rolle fra admin');
      return;
    }
    
    onUpdateUser(redigerBruker);
    setRedigerBruker(null);
    setMelding('Brukeren ble oppdatert');
    setTimeout(() => setMelding(''), 3000);
  };
  
  const handleCancelEdit = () => {
    setRedigerArtikkel(null);
    setRedigerBruker(null);
  };
  
  return (
    <div className="admin-panel">
      <h2>Administrasjonspanel</h2>
      
      {melding && <div className="melding-boks">{melding}</div>}
      {feilmelding && <div className="feilmelding">{feilmelding}</div>}
      
      <div className="admin-tabs">
        <button 
          className={aktivFane === 'artikler' ? 'active' : ''} 
          onClick={() => setAktivFane('artikler')}
        >
          Artikler ({artikler.length})
        </button>
        <button 
          className={aktivFane === 'brukere' ? 'active' : ''} 
          onClick={() => setAktivFane('brukere')}
        >
          Brukere ({brukere.length})
        </button>
      </div>
      
      {aktivFane === 'artikler' && (
        <div className="artikkel-liste">
          <h3>Alle artikler</h3>
          
          {redigerArtikkel ? (
            <div className="rediger-form">
              <h4>Rediger artikkel</h4>
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
                    <option value="arkivert">Arkivert</option>
                  </select>
                </div>
                
                <div className="knapp-gruppe">
                  <button type="submit" className="lagre-knapp">Lagre endringer</button>
                  <button type="button" className="avbryt-knapp" onClick={handleCancelEdit}>Avbryt</button>
                </div>
              </form>
            </div>
          ) : (
            <table className="admin-tabell">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tittel</th>
                  <th>Forfatter</th>
                  <th>Kategori</th>
                  <th>Status</th>
                  <th>Dato</th>
                  <th>Handlinger</th>
                </tr>
              </thead>
              <tbody>
                {artikler.map(artikkel => (
                  <tr key={artikkel.id}>
                    <td>{artikkel.id.substring(0, 8)}...</td>
                    <td>{artikkel.tittel}</td>
                    <td>{artikkel.forfatterNavn}</td>
                    <td>{artikkel.kategori}</td>
                    <td>
                      <span className={`status-${artikkel.status}`}>
                        {artikkel.status}
                      </span>
                    </td>
                    <td>{new Date(artikkel.dato).toLocaleDateString('nb-NO')}</td>
                    <td>
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      
      {aktivFane === 'brukere' && (
        <div className="bruker-liste">
          <h3>Alle brukere</h3>
          
          {redigerBruker ? (
            <div className="rediger-form">
              <h4>Rediger bruker</h4>
              <form onSubmit={handleUpdateUser}>
                <div className="form-gruppe">
                  <label htmlFor="navn">Navn:</label>
                  <input 
                    type="text"
                    id="navn"
                    value={redigerBruker.navn}
                    onChange={(e) => setRedigerBruker({...redigerBruker, navn: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-gruppe">
                  <label htmlFor="epost">E-post:</label>
                  <input 
                    type="email"
                    id="epost"
                    value={redigerBruker.epost}
                    onChange={(e) => setRedigerBruker({...redigerBruker, epost: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-gruppe">
                  <label htmlFor="rolle">Rolle:</label>
                  <select 
                    id="rolle"
                    value={redigerBruker.rolle}
                    onChange={(e) => setRedigerBruker({...redigerBruker, rolle: e.target.value})}
                    required
                  >
                    <option value="bruker">Bruker</option>
                    <option value="skribent">Skribent</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                
                <div className="knapp-gruppe">
                  <button type="submit" className="lagre-knapp">Lagre endringer</button>
                  <button type="button" className="avbryt-knapp" onClick={handleCancelEdit}>Avbryt</button>
                </div>
              </form>
            </div>
          ) : (
            <table className="admin-tabell">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Navn</th>
                  <th>E-post</th>
                  <th>Rolle</th>
                  <th>Registrert</th>
                  <th>Handlinger</th>
                </tr>
              </thead>
              <tbody>
                {brukere.map(bruker => (
                  <tr key={bruker.id}>
                    <td>{bruker.id.substring(0, 8)}...</td>
                    <td>{bruker.navn}</td>
                    <td>{bruker.epost}</td>
                    <td>
                      <span className={`rolle-${bruker.rolle}`}>
                        {bruker.rolle}
                      </span>
                    </td>
                    <td>{bruker.registrertDato ? new Date(bruker.registrertDato).toLocaleDateString('nb-NO') : 'N/A'}</td>
                    <td>
                      <button 
                        className="rediger-knapp" 
                        onClick={() => handleEditUser(bruker)}
                      >
                        Rediger
                      </button>
                      <button 
                        className="slett-knapp" 
                        onClick={() => handleDeleteUser(bruker.id)}
                        disabled={bruker.id === innloggetBruker.id}
                      >
                        Slett
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminPanel; 