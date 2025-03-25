import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import './Registrering.css';

function Registrering({ onRegistrer }) {
  const [navn, setNavn] = useState('');
  const [epost, setEpost] = useState('');
  const [passord, setPassord] = useState('');
  const [bekreftPassord, setBekreftPassord] = useState('');
  const [klasse, setKlasse] = useState('');
  const [feilmelding, setFeilmelding] = useState('');
  const [suksessmelding, setSuksessmelding] = useState('');
  const [redirect, setRedirect] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validering
    if (!navn.trim() || !epost.trim() || !passord.trim() || !bekreftPassord.trim()) {
      setFeilmelding('Vennligst fyll ut alle påkrevde felt');
      return;
    }
    
    if (passord !== bekreftPassord) {
      setFeilmelding('Passordene må være like');
      return;
    }
    
    if (passord.length < 6) {
      setFeilmelding('Passordet må være minst 6 tegn');
      return;
    }
    
    // Opprett bruker-objekt
    const nyBruker = {
      navn,
      epost,
      passord,
      klasse
    };
    
    // Send til App-komponenten for registrering
    const resultat = onRegistrer(nyBruker);
    
    if (resultat.success) {
      // Sjekk om e-posten er i admin-listen
      const erAdmin = epost === 'mattis.tollefsen@nionett.no' || epost === 'admin@nyskolen.no';
      
      setSuksessmelding(
        'Registrering vellykket! ' + 
        (erAdmin 
          ? 'Du er automatisk registrert som redaktør.' 
          : 'Du kan nå logge inn med din konto.')
      );
      
      // Tøm skjema
      setNavn('');
      setEpost('');
      setPassord('');
      setBekreftPassord('');
      setKlasse('');
      
      // Redirect etter 3 sekunder
      setTimeout(() => {
        setRedirect(true);
      }, 3000);
    } else {
      setFeilmelding(resultat.message || 'Noe gikk galt ved registrering');
    }
  };
  
  // Redirect til innlogging etter vellykket registrering
  if (redirect) {
    return <Navigate to="/innlogging" replace />;
  }

  return (
    <div className="registrering">
      <h2>Registrer ny bruker</h2>
      
      {feilmelding && <div className="feilmelding">{feilmelding}</div>}
      {suksessmelding && <div className="suksessmelding">{suksessmelding}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-gruppe">
          <label htmlFor="navn">Navn:</label>
          <input 
            type="text" 
            id="navn" 
            value={navn} 
            onChange={(e) => setNavn(e.target.value)} 
            required 
          />
        </div>
        
        <div className="form-gruppe">
          <label htmlFor="epost">E-post:</label>
          <input 
            type="email" 
            id="epost" 
            value={epost} 
            onChange={(e) => setEpost(e.target.value)} 
            required 
          />
          <small>Visse e-postadresser får automatisk redaktør-rettigheter</small>
        </div>
        
        <div className="form-gruppe">
          <label htmlFor="klasse">Klasse:</label>
          <input 
            type="text" 
            id="klasse" 
            value={klasse} 
            onChange={(e) => setKlasse(e.target.value)} 
            placeholder="Valgfritt" 
          />
        </div>
        
        <div className="form-gruppe">
          <label htmlFor="passord">Passord:</label>
          <input 
            type="password" 
            id="passord" 
            value={passord} 
            onChange={(e) => setPassord(e.target.value)} 
            required 
            minLength="6"
          />
        </div>
        
        <div className="form-gruppe">
          <label htmlFor="bekreft-passord">Bekreft passord:</label>
          <input 
            type="password" 
            id="bekreft-passord" 
            value={bekreftPassord} 
            onChange={(e) => setBekreftPassord(e.target.value)} 
            required 
          />
        </div>
        
        <button type="submit" className="registrer-knapp">
          Registrer deg
        </button>
      </form>
      
      <div className="registrering-lenker">
        <p>
          Har du allerede en konto? <Link to="/innlogging">Logg inn</Link>
        </p>
      </div>
    </div>
  );
}

export default Registrering; 