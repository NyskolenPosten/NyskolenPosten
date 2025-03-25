import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { sendVerificationCode } from '../utils/emailUtil';
import { verifyCode } from '../utils/verificationUtil';
import './Innlogging.css';

function Innlogging({ onLogin, brukere = [], melding = '' }) {
  const [steg, setSteg] = useState(1); // 1: Innloggingsform, 2: Verifisering
  const [formData, setFormData] = useState({
    epost: '',
    passord: ''
  });
  const [verifiseringskode, setVerifiseringskode] = useState('');
  const [feilmelding, setFeilmelding] = useState(melding);
  const [redirect, setRedirect] = useState(false);
  const [currentBruker, setCurrentBruker] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setFeilmelding('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.epost || !formData.passord) {
      setFeilmelding('Vennligst fyll ut både e-post og passord');
      return;
    }
    
    // Finn bruker basert på e-post
    const bruker = brukere.find(b => b.epost === formData.epost);
    
    if (!bruker) {
      setFeilmelding('Ingen bruker med denne e-postadressen');
      return;
    }
    
    // Sjekk passord
    if (bruker.passord !== formData.passord) {
      setFeilmelding('Feil passord');
      return;
    }
    
    // Lagre brukerinformasjon for senere bruk
    setCurrentBruker(bruker);
    
    // Send verifiseringskode
    setFeilmelding('Sender verifiseringskode...');
    
    try {
      const result = await sendVerificationCode(bruker.epost, bruker.navn, 'login');
      
      if (result.success) {
        setFeilmelding('En verifiseringskode er sendt til din e-post. Vennligst sjekk innboksen din.');
        setSteg(2);
      } else {
        setFeilmelding('Kunne ikke sende verifiseringskode. Vennligst prøv igjen senere.');
      }
    } catch (error) {
      console.error('Feil ved sending av verifiseringskode:', error);
      setFeilmelding('En feil oppstod. Vennligst prøv igjen senere.');
    }
  };

  const handleVerification = (e) => {
    e.preventDefault();
    
    if (!verifiseringskode) {
      setFeilmelding('Vennligst oppgi verifiseringskoden');
      return;
    }
    
    if (verifyCode(currentBruker.epost, verifiseringskode)) {
      // Vellykket verifisering, logg inn brukeren
      onLogin(currentBruker);
      
      // Redirect til hjemmesiden eller dashboard
      setRedirect(true);
    } else {
      setFeilmelding('Ugyldig eller utløpt verifiseringskode. Vennligst prøv igjen.');
    }
  };

  // Redirect til forsiden etter innlogging
  if (redirect) {
    return <Navigate to="/" replace />;
  }

  if (steg === 1) {
    return (
      <div className="innlogging-container">
        <h2>Logg inn</h2>
        {feilmelding && <div className="feilmelding">{feilmelding}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="epost">E-post:</label>
            <input
              type="email"
              id="epost"
              name="epost"
              value={formData.epost}
              onChange={handleChange}
              placeholder="Din e-postadresse"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="passord">Passord:</label>
            <input
              type="password"
              id="passord"
              name="passord"
              value={formData.passord}
              onChange={handleChange}
              placeholder="Ditt passord"
            />
          </div>
          
          <button type="submit" className="innlogging-knapp">Logg inn</button>
        </form>
        
        <div className="registrer-link">
          <p>Har du ikke en konto? <Link to="/registrering">Registrer deg her</Link></p>
        </div>
      </div>
    );
  } else if (steg === 2) {
    return (
      <div className="innlogging-container">
        <h2>Verifiser innlogging</h2>
        {feilmelding && <div className="feilmelding">{feilmelding}</div>}
        
        <form onSubmit={handleVerification}>
          <div className="form-group">
            <label htmlFor="verifiseringskode">Verifiseringskode:</label>
            <input
              type="text"
              id="verifiseringskode"
              value={verifiseringskode}
              onChange={(e) => setVerifiseringskode(e.target.value)}
              placeholder="Skriv inn 6-sifret kode"
            />
          </div>
          
          <button type="submit" className="verifiser-knapp">Verifiser</button>
          <button 
            type="button" 
            className="tilbake-knapp"
            onClick={() => setSteg(1)}>
            Tilbake
          </button>
        </form>
      </div>
    );
  }
}

export default Innlogging; 