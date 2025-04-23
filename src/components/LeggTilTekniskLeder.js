import React, { useState } from 'react';
import { opprettBrukerMedRolle } from '../services/authService';

function LeggTilTekniskLeder() {
  const [melding, setMelding] = useState('');
  const [feilmelding, setFeilmelding] = useState('');
  const [laster, setLaster] = useState(false);

  const handleLeggTilTekniskLeder = async () => {
    setLaster(true);
    setMelding('');
    setFeilmelding('');

    try {
      const resultat = await opprettBrukerMedRolle(
        'mattis.tollefsen@nionett.no',
        'et-sikkert-passord-123', // Dette bør endres ved første innlogging
        'Mattis B Tøllefsen',
        'teknisk_leder'
      );

      if (resultat.success) {
        setMelding('Teknisk leder ble lagt til!');
      } else {
        setFeilmelding(resultat.error || 'Noe gikk galt ved opprettelse av teknisk leder');
      }
    } catch (error) {
      setFeilmelding(error.message);
    } finally {
      setLaster(false);
    }
  };

  return (
    <div className="legg-til-teknisk-leder">
      <h2>Legg til teknisk leder</h2>
      
      {melding && <div className="melding-boks">{melding}</div>}
      {feilmelding && <div className="feilmelding">{feilmelding}</div>}
      
      <button 
        onClick={handleLeggTilTekniskLeder}
        disabled={laster}
        className="primary-button"
      >
        {laster ? 'Legger til...' : 'Legg til Mattis som teknisk leder'}
      </button>
      
      <p className="info-tekst">
        Dette vil opprette en brukerkonto for Mattis B Tøllefsen med teknisk leder-rettigheter.
        Passordet må endres ved første innlogging.
      </p>
    </div>
  );
}

export default LeggTilTekniskLeder; 