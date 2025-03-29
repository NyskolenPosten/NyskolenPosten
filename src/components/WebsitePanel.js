import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import './AdminPanel.css'; // Bruker samme CSS som AdminPanel
import { useLanguage } from '../utils/LanguageContext';

function WebsitePanel({ innloggetBruker, currentSettings, onUpdateSettings }) {
  const { translations } = useLanguage();
  const [melding, setMelding] = useState('');
  const [feilmelding, setFeilmelding] = useState('');
  const [passordInput, setPassordInput] = useState('');
  const [erAutentisert, setErAutentisert] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [localSettings, setLocalSettings] = useState(currentSettings || {
    lockdown: false,
    fullLockdown: false,
    note: ""
  });
  
  // Sjekk om brukeren er teknisk leder
  if (!innloggetBruker || innloggetBruker.rolle !== 'teknisk_leder') {
    return <Navigate to="/" replace />;
  }
  
  // Passordsjekk
  const handlePassordSubmit = (e) => {
    e.preventDefault();
    // Bruk det hemmelige passordet i stedet for brukerens passord
    if (passordInput === 'Tveita16') {
      setErAutentisert(true);
      setFeilmelding('');
    } else {
      setFeilmelding('Feil passord. Prøv igjen.');
    }
  };
  
  // Oppdater settings både lokalt og globalt
  const updateSettings = (newSettings) => {
    // Oppdater lokalt state
    setLocalSettings(newSettings);
    
    // Oppdater globalt (i App.js og i localStorage)
    const result = onUpdateSettings(newSettings);
    
    if (result.success) {
      setMelding('Innstillingene ble oppdatert');
    } else {
      setFeilmelding(`Feil ved oppdatering av innstillinger: ${result.error || 'Ukjent feil'}`);
    }
  };
  
  // Toggle LOCKDOWN mode (bare lesing, ingen redigering)
  const toggleLockdown = () => {
    const newSettings = {
      ...localSettings,
      lockdown: !localSettings.lockdown
    };
    
    updateSettings(newSettings);
    setMelding(`LOCKDOWN modus er nå ${newSettings.lockdown ? 'aktivert' : 'deaktivert'}`);
  };
  
  // Toggle WEBSITE LOCKDOWN mode (ingen tilgang)
  const toggleWebsiteLockdown = () => {
    const newSettings = {
      ...localSettings,
      fullLockdown: !localSettings.fullLockdown
    };
    
    updateSettings(newSettings);
    setMelding(`WEBSITE LOCKDOWN er nå ${newSettings.fullLockdown ? 'aktivert' : 'deaktivert'}`);
  };
  
  // Legg til NOTE på forsiden
  const handleNoteSubmit = (e) => {
    e.preventDefault();
    if (noteText.trim()) {
      const newSettings = {
        ...localSettings,
        note: noteText
      };
      
      updateSettings(newSettings);
      setMelding('NOTE er lagt til på forsiden');
      setNoteText('');
    } else {
      setFeilmelding('Skriv inn tekst før du legger til NOTE');
    }
  };
  
  // Fjern NOTE
  const removeNote = () => {
    const newSettings = {
      ...localSettings,
      note: ""
    };
    
    updateSettings(newSettings);
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
              className={`btn ${localSettings.lockdown ? 'btn-danger' : 'btn-primary'}`}
              onClick={toggleLockdown}
            >
              {localSettings.lockdown ? 'DEAKTIVER LOCKDOWN' : 'AKTIVER LOCKDOWN'}
            </button>
            <p className="control-description">
              LOCKDOWN: Når aktivert, kan brukere bare lese artikler. Admin-paneler er utilgjengelige og nye artikler kan ikke opprettes.
            </p>
            
            <button 
              className={`btn ${localSettings.fullLockdown ? 'btn-danger' : 'btn-warning'}`}
              onClick={toggleWebsiteLockdown}
            >
              {localSettings.fullLockdown ? 'DEAKTIVER WEBSITE LOCKDOWN' : 'AKTIVER WEBSITE LOCKDOWN'}
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
            {localSettings.note && (
              <button type="button" className="btn btn-secondary" onClick={removeNote}>Fjern NOTE</button>
            )}
          </form>
          
          {localSettings.note && (
            <div className="preview-note">
              <h3>Forhåndsvisning av NOTE:</h3>
              <div className="note-content">{localSettings.note}</div>
            </div>
          )}
        </div>
        
        <div className="admin-section">
          <h2>Nåværende tilstand</h2>
          <ul className="status-list">
            <li>
              <strong>LOCKDOWN Status:</strong> 
              <span className={localSettings.lockdown ? 'status-active' : 'status-inactive'}>
                {localSettings.lockdown ? 'AKTIV' : 'INAKTIV'}
              </span>
            </li>
            <li>
              <strong>WEBSITE LOCKDOWN Status:</strong> 
              <span className={localSettings.fullLockdown ? 'status-active' : 'status-inactive'}>
                {localSettings.fullLockdown ? 'AKTIV' : 'INAKTIV'}
              </span>
            </li>
            <li>
              <strong>NOTE Status:</strong> 
              <span className={localSettings.note ? 'status-active' : 'status-inactive'}>
                {localSettings.note ? 'VISES PÅ FORSIDEN' : 'INGEN NOTE'}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default WebsitePanel; 