import React, { useState, useRef } from 'react';
import { exporterAlleData, importerData } from '../services/dataService';
import './DataPanel.css';

function DataPanel({ innloggetBruker }) {
  const [melding, setMelding] = useState('');
  const [feilmelding, setFeilmelding] = useState('');
  const [laster, setLaster] = useState(false);
  const fileInputRef = useRef(null);

  // Sjekk om brukeren har rettigheter (admin eller teknisk leder)
  const harTilgang = innloggetBruker && 
    (innloggetBruker.rolle === 'admin' || 
     innloggetBruker.rolle === 'teknisk_leder' || 
     innloggetBruker.rolle === 'redaktør');

  // Hvis brukeren ikke har tilgang, vis en melding
  if (!harTilgang) {
    return (
      <div className="data-panel">
        <h2>Data administrasjon</h2>
        <div className="feilmelding">
          Du har ikke tilgang til denne siden. Kun administratorer og tekniske ledere kan administrere data.
        </div>
      </div>
    );
  }

  // Håndter eksportering av data
  const handleExportData = async () => {
    setMelding('');
    setFeilmelding('');
    setLaster(true);
    
    try {
      const resultat = await exporterAlleData();
      
      if (resultat.success) {
        setMelding('Data eksportert. Nedlastingen starter automatisk.');
      } else {
        setFeilmelding(`Kunne ikke eksportere data: ${resultat.error}`);
      }
    } catch (error) {
      setFeilmelding(`Feil under eksportering: ${error.message}`);
    } finally {
      setLaster(false);
    }
  };

  // Håndter import av data
  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setMelding('');
    setFeilmelding('');
    setLaster(true);
    
    try {
      const fileReader = new FileReader();
      
      fileReader.onload = async (event) => {
        try {
          const fileContent = event.target.result;
          const resultat = await importerData(fileContent);
          
          if (resultat.success) {
            setMelding('Data importert. Siden vil oppdateres automatisk om 3 sekunder.');
            // Oppdater siden etter 3 sekunder
            setTimeout(() => {
              window.location.reload();
            }, 3000);
          } else {
            setFeilmelding(`Kunne ikke importere data: ${resultat.error}`);
          }
        } catch (error) {
          setFeilmelding(`Feil under import: ${error.message}`);
        } finally {
          setLaster(false);
        }
      };
      
      fileReader.onerror = () => {
        setFeilmelding('Kunne ikke lese filen');
        setLaster(false);
      };
      
      fileReader.readAsText(file);
    } catch (error) {
      setFeilmelding(`Feil ved lesing av fil: ${error.message}`);
      setLaster(false);
    }
    
    // Nullstill filvelgeren slik at samme fil kan velges på nytt
    e.target.value = null;
  };

  return (
    <div className="data-panel">
      <h2>Data administrasjon</h2>
      
      {melding && <div className="melding-boks">{melding}</div>}
      {feilmelding && <div className="feilmelding">{feilmelding}</div>}
      
      <div className="data-actions">
        <div className="data-section">
          <h3>Eksporter Data</h3>
          <p>
            Last ned en sikkerhetskopi av all data (artikler, brukere, innstillinger).
            Denne filen kan brukes til å gjenopprette dataen senere, eller for å flytte
            dataen til en annen maskin.
          </p>
          <button 
            className="eksport-knapp" 
            onClick={handleExportData}
            disabled={laster}
          >
            {laster ? 'Eksporterer...' : 'Eksporter data'}
          </button>
        </div>
        
        <div className="data-section">
          <h3>Importer Data</h3>
          <p>
            Last opp en tidligere sikkerhetskopi for å gjenopprette dataen.
            <strong>Advarsel:</strong> Dette vil overskrive all eksisterende data.
          </p>
          <button 
            className="import-knapp" 
            onClick={handleImportClick}
            disabled={laster}
          >
            {laster ? 'Importerer...' : 'Importer data'}
          </button>
          <input 
            type="file" 
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
            accept=".json"
          />
        </div>
      </div>
      
      <div className="data-info">
        <h3>Om data administrasjon</h3>
        <p>
          All data i Nyskolen Posten lagres lokalt i nettleseren din (localStorage).
          Dette betyr at data ikke deles automatisk mellom ulike enheter eller nettlesere.
        </p>
        <p>
          For å sikre at dataen ikke går tapt, bør du jevnlig eksportere en sikkerhetskopi.
          Denne kan så importeres på andre enheter eller brukes til å gjenopprette dataen
          hvis noe skulle gå galt.
        </p>
        <p>
          <strong>Tips:</strong> Eksporter data etter større endringer for å sikre at alt er lagret.
        </p>
      </div>
    </div>
  );
}

export default DataPanel; 