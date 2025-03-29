// components/AdminPanel.js
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import './AdminPanel.css';
import { useLanguage } from '../utils/LanguageContext';

function AdminPanel({ 
  innloggetBruker, 
  artikler = [], 
  brukere = [], 
  jobbliste = [], 
  kategoriliste = [],
  onDeleteArticle, 
  onUpdateArticle, 
  onUpdateUser, 
  onDeleteUser,
  onApproveArticle,
  onUpdateJobbliste,
  onUpdateKategoriliste,
  onEndreRolleBruker
}) {
  const { translations } = useLanguage();
  const [aktivFane, setAktivFane] = useState('artikler');
  const [redigerArtikkel, setRedigerArtikkel] = useState(null);
  const [redigerBruker, setRedigerBruker] = useState(null);
  const [redigerJobb, setRedigerJobb] = useState(null);
  const [redigerKategori, setRedigerKategori] = useState(null);
  const [melding, setMelding] = useState('');
  const [feilmelding, setFeilmelding] = useState('');
  
  // Sjekk om brukeren er admin
  if (!innloggetBruker || innloggetBruker.rolle !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  // Initiel filtrering av artikler
  useEffect(() => {
    oppdaterFiltrering();
  }, [artikler]);

  // Funksjon for å filtrere artiklene basert på godkjenningsstatus
  const oppdaterFiltrering = () => {
    // Implementer filtrering her
  };
  
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
  
  // Håndterer godkjenning av artikkel
  const handleApproveArticle = (artikkelID) => {
    if (window.confirm('Er du sikker på at du vil godkjenne denne artikkelen?')) {
      onApproveArticle(artikkelID);
      setMelding('Artikkelen er godkjent og publisert');
      setTimeout(() => setMelding(''), 3000);
    }
  };

  // Håndterer endring av rolle i jobblisten
  const handleEndreRolle = (jobbId, nyRolle) => {
    if (window.confirm(`Er du sikker på at du vil endre rollen til ${nyRolle}?`)) {
      onEndreRolleBruker(jobbId, nyRolle);
      setMelding(`Rollen er endret til ${nyRolle}`);
      setTimeout(() => setMelding(''), 3000);
    }
  };
  
  const handleApproveUser = (userId) => {
    // Finn brukerdata
    const bruker = brukere.find(b => b.id === userId);
    if (bruker) {
      // Logger i stedet for å sende e-post
      console.log(`Velkommen-e-post ville ha blitt sendt til ${bruker.epost} (${bruker.navn})`);
    }
  };
  
  return (
    <div className="admin-panel">
      <h2>Administrasjonspanel</h2>
      
      {melding && <div className="melding-boks">{melding}</div>}
      {feilmelding && <div className="feilmelding">{feilmelding}</div>}
      
      <div className="admin-tabs">
        <button 
          className={aktivFane === 'artikler' ? 'tab-active' : ''} 
          onClick={() => setAktivFane('artikler')}
        >
          Artikler ({artikler.length})
        </button>
        <button 
          className={aktivFane === 'brukere' ? 'tab-active' : ''} 
          onClick={() => setAktivFane('brukere')}
        >
          Brukere ({brukere.length})
        </button>
        <button 
          className={aktivFane === 'jobbliste' ? 'tab-active' : ''} 
          onClick={() => setAktivFane('jobbliste')}
        >
          Jobbliste ({jobbliste.length})
        </button>
        <button 
          className={aktivFane === 'kategorier' ? 'tab-active' : ''} 
          onClick={() => setAktivFane('kategorier')}
        >
          Kategorier ({kategoriliste.length})
        </button>
      </div>
      
      {aktivFane === 'artikler' && (
        <div className="admin-section">
          <h3>Administrer artikler</h3>
          
          <table className="admin-table">
            <thead>
              <tr>
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
                <tr key={artikkel.artikkelID}>
                  <td>{artikkel.tittel}</td>
                  <td>{artikkel.forfatter}</td>
                  <td>{artikkel.kategori}</td>
                  <td>
                    <span className={`status ${artikkel.godkjent ? 'godkjent' : 'venter'}`}>
                      {artikkel.godkjent ? 'Publisert' : 'Venter på godkjenning'}
                    </span>
                  </td>
                  <td>{new Date(artikkel.dato).toLocaleDateString('no-NO')}</td>
                  <td className="admin-buttons">
                    <a 
                      href={`/artikkel/${artikkel.artikkelID}`} 
                      className="view-button"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Se
                    </a>
                    {!artikkel.godkjent && (
                      <button 
                        className="approve-button" 
                        onClick={() => handleApproveArticle(artikkel.artikkelID)}
                      >
                        Godkjenn
                      </button>
                    )}
                    <button 
                      className="delete-button" 
                      onClick={() => onDeleteArticle(artikkel.artikkelID)}
                    >
                      Slett
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {aktivFane === 'brukere' && (
        <div className="admin-section">
          <h3>Administrer brukere</h3>
          
          <table className="admin-table">
            <thead>
              <tr>
                <th>Navn</th>
                <th>E-post</th>
                <th>Klasse</th>
                <th>Rolle</th>
                <th>Registrert</th>
                <th>Handlinger</th>
              </tr>
            </thead>
            <tbody>
              {brukere.map(bruker => (
                <tr key={bruker.id}>
                  <td>{bruker.navn}</td>
                  <td>{bruker.epost}</td>
                  <td>{bruker.klasse || '-'}</td>
                  <td>{bruker.rolle}</td>
                  <td>{new Date(bruker.dato).toLocaleDateString('no-NO')}</td>
                  <td className="admin-buttons">
                    {bruker.id !== innloggetBruker.id && (
                      <button 
                        className="delete-button" 
                        onClick={() => onDeleteUser(bruker.id)}
                      >
                        Slett
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {aktivFane === 'jobbliste' && (
        <div className="admin-section">
          <h3>Jobbliste - Redaktører og journalister</h3>
          
          <table className="admin-table">
            <thead>
              <tr>
                <th>Navn</th>
                <th>Rolle</th>
                <th>Dato tillagt</th>
                <th>Handlinger</th>
              </tr>
            </thead>
            <tbody>
              {jobbliste.map(jobb => (
                <tr key={jobb.id}>
                  <td>{jobb.navn}</td>
                  <td>{jobb.rolle}</td>
                  <td>{new Date(jobb.dato).toLocaleDateString('no-NO')}</td>
                  <td className="admin-buttons">
                    {jobb.rolle === 'Journalist' && (
                      <button 
                        className="approve-button" 
                        onClick={() => handleEndreRolle(jobb.id, 'Redaktør')}
                      >
                        Gjør til redaktør
                      </button>
                    )}
                    {jobb.rolle === 'Redaktør' && jobb.navn !== 'Administrator' && (
                      <button 
                        className="approve-button" 
                        onClick={() => handleEndreRolle(jobb.id, 'Journalist')}
                      >
                        Gjør til journalist
                      </button>
                    )}
                    <button 
                      className="delete-button" 
                      onClick={() => {
                        if (window.confirm('Er du sikker på at du vil fjerne denne personen fra jobblisten?')) {
                          const oppdatertJobbliste = jobbliste.filter(j => j.id !== jobb.id);
                          onUpdateJobbliste(oppdatertJobbliste);
                          setMelding('Person fjernet fra jobblisten');
                          setTimeout(() => setMelding(''), 3000);
                        }
                      }}
                    >
                      Fjern
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="admin-info">
            <h4>Om jobblisten</h4>
            <p>Jobblisten viser hvem som er redaktør/administrator og journalister i Nyskolen Posten.</p>
            <p>Når en bruker godkjennes, legges de automatisk til i jobblisten som journalist.</p>
            <p>Visse brukere får automatisk redaktør/administrator-rolle basert på interne regler.</p>
            <p>Som redaktør kan du gi andre brukere redaktørrolle eller endre tilbake til journalist.</p>
          </div>
        </div>
      )}
      
      {aktivFane === 'kategorier' && (
        <div className="admin-section">
          <h3>Kategoriliste - Ansvarsområder</h3>
          
          <table className="admin-table">
            <thead>
              <tr>
                <th>Kategori</th>
                <th>Ansvarlig</th>
                <th>Handlinger</th>
              </tr>
            </thead>
            <tbody>
              {kategoriliste.map(kategori => (
                <tr key={kategori.id}>
                  <td>{kategori.kategori}</td>
                  <td>{kategori.ansvarlig}</td>
                  <td className="admin-buttons">
                    <button 
                      className="view-button" 
                      onClick={() => {
                        setRedigerKategori(kategori);
                      }}
                    >
                      Endre ansvarlig
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {redigerKategori && (
            <div className="rediger-form">
              <h4>Endre ansvarlig for {redigerKategori.kategori}</h4>
              <form onSubmit={(e) => {
                e.preventDefault();
                const oppdatertKategoriliste = kategoriliste.map(k => 
                  k.id === redigerKategori.id ? redigerKategori : k
                );
                onUpdateKategoriliste(oppdatertKategoriliste);
                setRedigerKategori(null);
                setMelding('Kategoriansvarlig oppdatert');
                setTimeout(() => setMelding(''), 3000);
              }}>
                <div className="form-gruppe">
                  <label htmlFor="ansvarlig">Ansvarlig:</label>
                  <select 
                    id="ansvarlig"
                    value={redigerKategori.ansvarlig}
                    onChange={(e) => setRedigerKategori({...redigerKategori, ansvarlig: e.target.value})}
                    required
                  >
                    {brukere
                      .filter(b => b.godkjent)
                      .map(bruker => (
                        <option key={bruker.id} value={bruker.navn}>
                          {bruker.navn} ({bruker.rolle})
                        </option>
                      ))
                    }
                  </select>
                </div>
                
                <div className="knapp-gruppe">
                  <button type="submit" className="lagre-knapp">Lagre endringer</button>
                  <button 
                    type="button" 
                    className="avbryt-knapp" 
                    onClick={() => setRedigerKategori(null)}
                  >
                    Avbryt
                  </button>
                </div>
              </form>
            </div>
          )}
          
          <div className="admin-info">
            <h4>Om kategorilisten</h4>
            <p>Kategorilisten viser hvem som er ansvarlig for de ulike kategoriene i Nyskolen Posten.</p>
            <p>Hver kategori bør ha en ansvarlig redaktør eller journalist som kvalitetssikrer innholdet.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel; 