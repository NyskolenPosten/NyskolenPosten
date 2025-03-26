import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { sendVerificationCode } from '../utils/emailUtil';
import { verifyCode } from '../utils/verificationUtil';
import { useLanguage } from '../utils/LanguageContext';
import './Innlogging.css';

function Innlogging({ onLogin, userIsAuthenticated, brukere }) {
  const { translations } = useLanguage();
  const [steg, setSteg] = useState(1); // 1: Innloggingsskjema, 2: Verifiseringskode
  const [formData, setFormData] = useState({
    epost: '',
    passord: ''
  });
  const [verifiseringskode, setVerifiseringskode] = useState('');
  const [feilmelding, setFeilmelding] = useState('');
  const [suksessmelding, setSuksessmelding] = useState('');
  const [redirect, setRedirect] = useState(false);
  const [visKode, setVisKode] = useState(''); // Vis generert kode for lokal testing
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Nullstill feilmeldinger når brukeren begynner å skrive
    setFeilmelding('');
    setSuksessmelding('');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Sjekk at begge feltene er utfylt
    if (!formData.epost || !formData.passord) {
      setFeilmelding(translations.login.fillBothFields);
      return;
    }
    
    // Finn bruker
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
    
    // Nullstill feilmelding og vis suksessmelding
    setFeilmelding('');
    setSuksessmelding(translations.login.sendingCode);
    setVisKode(''); // Nullstill kodevisning
    
    try {
      // Send verifiseringskode til brukerens e-post
      const result = await sendVerificationCode(formData.epost, bruker.navn, 'login');
      
      if (result.success) {
        setSuksessmelding(translations.login.codeSent);
        // Vis koden for lokal testing
        if (result.kode) {
          setVisKode(result.kode);
          // Sett koden automatisk i input-feltet for enklere testing
          setVerifiseringskode(result.kode);
        }
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
    
    if (verifyCode(formData.epost, verifiseringskode)) {
      // Finn bruker på nytt
      const bruker = brukere.find(b => b.epost === formData.epost);
      
      // Utfør innlogging
      onLogin(bruker);
      
      // Vis suksessmelding 
      setSuksessmelding(translations.login.loginSuccess);
      setFeilmelding('');
      
      // Redirect til forsiden etter en kort pause
      setTimeout(() => {
        setRedirect(true);
      }, 1000);
    } else {
      setFeilmelding(translations.login.invalidCode);
    }
  };
  
  // Redirect hvis allerede logget inn
  if (userIsAuthenticated || redirect) {
    return <Navigate to="/" />;
  }
  
  if (steg === 1) {
    return (
      <div className="innlogging-container">
        <h2>{translations.login.title}</h2>
        
        {feilmelding && <div className="feilmelding" role="alert">{feilmelding}</div>}
        {suksessmelding && <div className="suksessmelding" role="status">{suksessmelding}</div>}
        
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
              inputMode="email"
              required
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
              required
            />
          </div>
          
          <button type="submit" className="login-knapp">{translations.login.loginButton}</button>
        </form>
        
        <div className="register-link">
          <p>{translations.login.registerPrompt} <Link to="/registrering">{translations.login.registerHere}</Link></p>
        </div>
      </div>
    );
  } else {
    return (
      <div className="innlogging-container">
        <h2>{translations.login.verifyEmail}</h2>
        
        {feilmelding && <div className="feilmelding" role="alert">{feilmelding}</div>}
        {suksessmelding && <div className="suksessmelding" role="status">{suksessmelding}</div>}
        <p className="info-melding">{translations.login.checkEmailForCode}</p>
        
        {/* Vis koden lokalt for enklere testing */}
        {visKode && (
          <div className="kode-visning">
            <p>{translations.login.localTestingCode}</p>
            <p className="kode-display">{visKode}</p>
          </div>
        )}
        
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
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength="6"
              required
            />
          </div>
          
          <button type="submit" className="verify-knapp">{translations.login.verifyButton}</button>
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