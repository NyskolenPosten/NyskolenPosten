import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import './AdminPanel.css'; // Bruker samme CSS som AdminPanel
import { useLanguage } from '../utils/LanguageContext';

function WebsitePanel({ innloggetBruker }) {
  const { translations } = useLanguage();
  const [melding, setMelding] = useState('');
  const [feilmelding, setFeilmelding] = useState('');
  const [passordInput, setPassordInput] = useState('');
  const [erAutentisert, setErAutentisert] = useState(false);
  const [noteText, setNoteText] = useState('');
  
  // Hent nåværende tilstand fra localStorage
  const [lockdownStatus, setLockdownStatus] = useState(() => {
    return JSON.parse(localStorage.getItem('websiteSettings') || '{"lockdown": false, "fullLockdown": false, "note": ""}');
  });
  
  // Oppdater localStorage når tilstanden endres
  useEffect(() => {
    localStorage.setItem('websiteSettings', JSON.stringify(lockdownStatus));
  }, [lockdownStatus]);
  
  // Sjekk om brukeren er teknisk leder
  if (!innloggetBruker || innloggetBruker.rolle !== 'teknisk_leder') {
    return <Navigate to="/" replace />;
  }
  
  // Passordsjekk
  const handlePassordSubmit = (e) => {
    e.preventDefault();
    // Bruk samme passord som brukeren har
    if (passordInput === innloggetBruker.password) {
      setErAutentisert(true);
      setFeilmelding('');
    } else {
      setFeilmelding('Feil passord. Prøv igjen.');
    }
  };
  
  // Toggle LOCKDOWN mode (bare lesing, ingen redigering)
  const toggleLockdown = () => {
    setLockdownStatus(prev => ({
      ...prev,
      lockdown: !prev.lockdown
    }));
    setMelding(`LOCKDOWN modus er nå ${!lockdownStatus.lockdown ? 'aktivert' : 'deaktivert'}`);
  };
  
  // Toggle WEBSITE LOCKDOWN mode (ingen tilgang)
  const toggleWebsiteLockdown = () => {
    setLockdownStatus(prev => ({
      ...prev,
      fullLockdown: !prev.fullLockdown
    }));
    setMelding(`WEBSITE LOCKDOWN er nå ${!lockdownStatus.fullLockdown ? 'aktivert' : 'deaktivert'}`);
  };
  
  // Legg til NOTE på forsiden
  const handleNoteSubmit = (e) => {
    e.preventDefault();
    if (noteText.trim()) {
      setLockdownStatus(prev => ({
        ...prev,
        note: noteText
      }));
      setMelding('NOTE er lagt til på forsiden');
      setNoteText('');
    } else {
      setFeilmelding('Skriv inn tekst før du legger til NOTE');
    }
  };
  
  // Fjern NOTE
  const removeNote = () => {
    setLockdownStatus(prev => ({
      ...prev,
      note: ''
    }));
    setMelding('NOTE er fjernet fra forsiden');
  };
  
  // Passordsjekk før tilgang til panel
  if (!erAutentisert) {
    return (
      <div className="admin-container">
        <h1>Teknisk leder - Tilgangskontroll</h1>
        <p>Skriv inn passordet ditt for å få tilgang til Website panel.</p>
        
        {feilmelding && <div className="error-message">{feilmelding}</div>}
        
        <form onSubmit={handlePassordSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="password">Passord:</label>
            <input
              type="password"
              id="password"
              value={passordInput}
              onChange={(e) => setPassordInput(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn">Logg inn</button>
        </form>
      </div>
    );
  }
  
  return (
    <div className="admin-container">
      <h1>Website Panel - Teknisk leder</h1>
      <p>Velkommen, {innloggetBruker.navn}. Her kan du styre tekniske aspekter av nettsiden.</p>
      
      {melding && <div className="success-message">{melding}</div>}
      {feilmelding && <div className="error-message">{feilmelding}</div>}
      
      <div className="admin-panel">
        <div className="admin-section">
          <h2>Nettsidekontroll</h2>
          
          <div className="control-buttons">
            <button 
              className={`btn ${lockdownStatus.lockdown ? 'btn-danger' : 'btn-primary'}`}
              onClick={toggleLockdown}
            >
              {lockdownStatus.lockdown ? 'DEAKTIVER LOCKDOWN' : 'AKTIVER LOCKDOWN'}
            </button>
            <p className="control-description">
              LOCKDOWN: Når aktivert, kan brukere bare lese artikler. Admin-paneler er utilgjengelige og nye artikler kan ikke opprettes.
            </p>
            
            <button 
              className={`btn ${lockdownStatus.fullLockdown ? 'btn-danger' : 'btn-warning'}`}
              onClick={toggleWebsiteLockdown}
            >
              {lockdownStatus.fullLockdown ? 'DEAKTIVER WEBSITE LOCKDOWN' : 'AKTIVER WEBSITE LOCKDOWN'}
            </button>
            <p className="control-description">
              WEBSITE LOCKDOWN: Når aktivert, vises bare en vedlikeholdsmelding på nettsiden. Ingen tilgang til innhold.
            </p>
          </div>
        </div>
        
        <div className="admin-section">
          <h2>Forsidemelding (NOTE)</h2>
          
          <form onSubmit={handleNoteSubmit}>
            <div className="form-group">
              <label htmlFor="noteText">Meldingstekst:</label>
              <textarea
                id="noteText"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows="4"
                placeholder="Skriv en viktig melding som skal vises på forsiden..."
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary">Legg til NOTE</button>
            {lockdownStatus.note && (
              <button type="button" className="btn btn-secondary" onClick={removeNote}>Fjern NOTE</button>
            )}
          </form>
          
          {lockdownStatus.note && (
            <div className="preview-note">
              <h3>Forhåndsvisning av NOTE:</h3>
              <div className="note-content">{lockdownStatus.note}</div>
            </div>
          )}
        </div>
        
        <div className="admin-section">
          <h2>Nåværende tilstand</h2>
          <ul className="status-list">
            <li>
              <strong>LOCKDOWN Status:</strong> 
              <span className={lockdownStatus.lockdown ? 'status-active' : 'status-inactive'}>
                {lockdownStatus.lockdown ? 'AKTIV' : 'INAKTIV'}
              </span>
            </li>
            <li>
              <strong>WEBSITE LOCKDOWN Status:</strong> 
              <span className={lockdownStatus.fullLockdown ? 'status-active' : 'status-inactive'}>
                {lockdownStatus.fullLockdown ? 'AKTIV' : 'INAKTIV'}
              </span>
            </li>
            <li>
              <strong>NOTE Status:</strong> 
              <span className={lockdownStatus.note ? 'status-active' : 'status-inactive'}>
                {lockdownStatus.note ? 'VISES PÅ FORSIDEN' : 'INGEN NOTE'}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default WebsitePanel; 