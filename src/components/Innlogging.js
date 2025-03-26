import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { sendVerificationCode } from '../utils/emailUtil';
import { verifyCode } from '../utils/verificationUtil';
import { useLanguage } from '../utils/LanguageContext';
import './Innlogging.css';

function Innlogging({ onLogin, brukere = [], melding = '' }) {
  const { translations } = useLanguage();
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
      setFeilmelding(translations.login.fillBothFields);
      return;
    }
    
    // Finn bruker basert på e-post
    const bruker = brukere.find(b => b.epost === formData.epost);
    
    if (!bruker) {
      setFeilmelding(translations.login.noUserFound);
      return;
    }
    
    // Sjekk passord
    if (bruker.passord !== formData.passord) {
      setFeilmelding(translations.login.wrongPassword);
      return;
    }
    
    // Lagre brukerinformasjon for senere bruk
    setCurrentBruker(bruker);
    
    // Send verifiseringskode
    setFeilmelding(translations.login.sendingCode);
    
    try {
      const result = await sendVerificationCode(bruker.epost, bruker.navn, 'login');
      
      if (result.success) {
        setFeilmelding(translations.login.codeSent);
        setSteg(2);
      } else {
        setFeilmelding(translations.login.couldNotSendCode);
      }
    } catch (error) {
      console.error('Feil ved sending av verifiseringskode:', error);
      setFeilmelding(translations.login.errorOccurred);
    }
  };

  const handleVerification = (e) => {
    e.preventDefault();
    
    if (!verifiseringskode) {
      setFeilmelding(translations.login.enterCode);
      return;
    }
    
    if (verifyCode(currentBruker.epost, verifiseringskode)) {
      // Vellykket verifisering, logg inn brukeren
      onLogin(currentBruker);
      
      // Redirect til hjemmesiden eller dashboard
      setRedirect(true);
    } else {
      setFeilmelding(translations.login.invalidCode);
    }
  };

  // Redirect til forsiden etter innlogging
  if (redirect) {
    return <Navigate to="/" replace />;
  }

  if (steg === 1) {
    return (
      <div className="innlogging-container">
        <h2>{translations.login.title}</h2>
        {feilmelding && <div className="feilmelding">{feilmelding}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="epost">{translations.login.email}</label>
            <input
              type="email"
              id="epost"
              name="epost"
              value={formData.epost}
              onChange={handleChange}
              placeholder={translations.login.emailPlaceholder}
              autoComplete="email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="passord">{translations.login.password}</label>
            <input
              type="password"
              id="passord"
              name="passord"
              value={formData.passord}
              onChange={handleChange}
              placeholder={translations.login.passwordPlaceholder}
              autoComplete="current-password"
            />
          </div>
          
          <button type="submit" className="innlogging-knapp">{translations.login.loginButton}</button>
        </form>
        
        <div className="registrer-link">
          <p>{translations.login.noAccount} <Link to="/registrering">{translations.login.registerHere}</Link></p>
        </div>
      </div>
    );
  } else if (steg === 2) {
    return (
      <div className="innlogging-container">
        <h2>{translations.login.verifyTitle}</h2>
        {feilmelding && <div className="feilmelding">{feilmelding}</div>}
        
        <form onSubmit={handleVerification}>
          <div className="form-group">
            <label htmlFor="verifiseringskode">{translations.login.verificationCode}</label>
            <input
              type="text"
              id="verifiseringskode"
              value={verifiseringskode}
              onChange={(e) => setVerifiseringskode(e.target.value)}
              placeholder={translations.login.verificationPlaceholder}
              autoComplete="one-time-code"
              maxLength="6"
            />
          </div>
          
          <button type="submit" className="verifiser-knapp">{translations.login.verifyButton}</button>
          <button 
            type="button" 
            className="tilbake-knapp"
            onClick={() => setSteg(1)}>
            {translations.login.backButton}
          </button>
        </form>
      </div>
    );
  }
}

export default Innlogging; 