import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendVerificationCode } from '../utils/emailUtil';
import { verifyCode, checkPrivilegedEmail } from '../utils/verificationUtil';
import { useLanguage } from '../utils/LanguageContext';
import './Registrering.css';

function Registrering({ onRegistrer }) {
  const { translations } = useLanguage();
  const [steg, setSteg] = useState(1); // 1: Skjema, 2: Verifisering, 3: Fullført
  const [formData, setFormData] = useState({
    navn: '',
    epost: '',
    passord: '',
    bekreftPassord: '',
    klasse: ''
  });
  const [verifiseringskode, setVerifiseringskode] = useState('');
  const [feilmelding, setFeilmelding] = useState('');
  const [suksessmelding, setSuksessmelding] = useState('');
  const [visKode, setVisKode] = useState(''); // Vis verifiseringskode for testing

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setFeilmelding('');
    setSuksessmelding('');
  };

  const validateForm = () => {
    if (!formData.navn || !formData.epost || !formData.passord || !formData.klasse) {
      setFeilmelding(translations.registration.allFieldsRequired);
      return false;
    }
    
    if (formData.passord !== formData.bekreftPassord) {
      setFeilmelding(translations.registration.passwordsMustMatch);
      return false;
    }
    
    if (!formData.epost.includes('@')) {
      setFeilmelding(translations.registration.invalidEmail);
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setFeilmelding('');
    setSuksessmelding(translations.login.sendingCode);
    setVisKode(''); // Nullstill kodevisning
    
    try {
      // Send verifiseringskode til brukerens e-post
      const result = await sendVerificationCode(formData.epost, formData.navn, 'registration');
      
      if (result.success) {
        setSuksessmelding(translations.login.codeSent);
        
        // Vis koden for testing (siden vi ikke kan sende faktiske e-poster uten backend)
        if (result.kode) {
          setVisKode(result.kode);
          // Prefill koden for enklere testing
          setVerifiseringskode(result.kode);
        }
        
        setSteg(2);
      } else {
        // Spesifikke feilmeldinger basert på feiltype
        if (result.error && result.error.includes('SMTP')) {
          setFeilmelding(translations.login.smtpError);
        } else if (result.error && result.error.includes('connection')) {
          setFeilmelding(translations.login.smtpError);
        } else {
          setFeilmelding(result.message || translations.login.couldNotSendCode);
        }
      }
    } catch (error) {
      console.error('Feil ved sending av verifiseringskode:', error);
      setFeilmelding(translations.login.emailError);
    }
  };

  const handleVerification = (e) => {
    e.preventDefault();
    
    if (!verifiseringskode) {
      setFeilmelding(translations.login.enterCode);
      return;
    }
    
    if (verifyCode(formData.epost, verifiseringskode)) {
      // Sjekk om e-posten er for privilegert bruker
      const rolle = checkPrivilegedEmail(formData.epost);
      
      // Forbered brukerdata for registrering
      const brukerData = {
        navn: formData.navn,
        epost: formData.epost,
        passord: formData.passord,
        klasse: formData.klasse,
        rolle: rolle || 'journalist', // Standard rolle er journalist
        dato: new Date().toISOString()
      };
      
      // Fullfør registreringsprosessen
      const registreringsResultat = onRegistrer(brukerData);
      
      if (registreringsResultat.success) {
        setSuksessmelding(translations.registration.registrationSuccess);
        setSteg(3); // Ferdig
      } else {
        setFeilmelding(registreringsResultat.message || translations.registration.registrationFailed);
        setSteg(1); // Tilbake til registreringsskjema
      }
    } else {
      setFeilmelding(translations.login.invalidCode);
    }
  };

  // Steg-indikator komponent
  const StegIndikator = () => (
    <div className="registrering-steg">
      <div className="steg-indikator">
        <div className={`steg-dot ${steg >= 1 ? 'aktiv' : ''}`} role="progressbar" aria-valuenow="1" aria-valuemin="1" aria-valuemax="3"></div>
        <div className={`steg-dot ${steg >= 2 ? 'aktiv' : ''}`} role="progressbar" aria-valuenow="2" aria-valuemin="1" aria-valuemax="3"></div>
        <div className={`steg-dot ${steg >= 3 ? 'aktiv' : ''}`} role="progressbar" aria-valuenow="3" aria-valuemin="1" aria-valuemax="3"></div>
      </div>
    </div>
  );

  // Vis skjema basert på hvilket steg vi er på
  if (steg === 1) {
    return (
      <div className="registrering-container">
        <h2>{translations.registration.title}</h2>
        <StegIndikator />
        
        {feilmelding && <div className="feilmelding" role="alert">{feilmelding}</div>}
        {suksessmelding && <div className="suksessmelding" role="status">{suksessmelding}</div>}
        
        <form onSubmit={handleSubmit} autoComplete="on">
          <div className="form-group">
            <label htmlFor="navn">{translations.registration.name}</label>
            <input
              type="text"
              id="navn"
              name="navn"
              value={formData.navn}
              onChange={handleChange}
              placeholder={translations.registration.namePlaceholder}
              autoComplete="name"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="epost">{translations.registration.email}</label>
            <input
              type="email"
              id="epost"
              name="epost"
              value={formData.epost}
              onChange={handleChange}
              placeholder={translations.registration.emailPlaceholder}
              autoComplete="email"
              inputMode="email"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="passord">{translations.registration.password}</label>
            <input
              type="password"
              id="passord"
              name="passord"
              value={formData.passord}
              onChange={handleChange}
              placeholder={translations.registration.passwordPlaceholder}
              autoComplete="new-password"
              minLength="6"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="bekreftPassord">{translations.registration.confirmPassword}</label>
            <input
              type="password"
              id="bekreftPassord"
              name="bekreftPassord"
              value={formData.bekreftPassord}
              onChange={handleChange}
              placeholder={translations.registration.confirmPasswordPlaceholder}
              autoComplete="new-password"
              minLength="6"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="klasse">{translations.registration.class}</label>
            <input
              type="text"
              id="klasse"
              name="klasse"
              value={formData.klasse}
              onChange={handleChange}
              placeholder={translations.registration.classPlaceholder}
              autoComplete="organization-title"
              required
            />
          </div>
          
          <button type="submit" className="registrer-knapp">{translations.registration.registerButton}</button>
        </form>
        
        <div className="innlogging-link">
          <p>{translations.registration.haveAccount} <Link to="/innlogging">{translations.registration.loginHere}</Link></p>
        </div>
      </div>
    );
  } else if (steg === 2) {
    return (
      <div className="registrering-container">
        <h2>{translations.login.verifyEmail}</h2>
        <StegIndikator />
        
        {feilmelding && <div className="feilmelding" role="alert">{feilmelding}</div>}
        {suksessmelding && <div className="suksessmelding" role="status">{suksessmelding}</div>}
        <p className="info-melding">{translations.login.checkEmailForCode}</p>
        
        {/* Vis koden for utvikling/testing */}
        {visKode && (
          <div className="kode-visning">
            <p>Siden dette er en frontend-app uten backend, vises koden her for testing:</p>
            <p className="kode-display">{visKode}</p>
            <p className="kode-forklaring">
              <strong>Merk:</strong> I en reell produksjonsapplikasjon vil koden sendes via e-post, ikke vises her.
              For å implementere faktisk e-postsending, må du lage en backend-tjeneste som bruker Nodemailer eller en tilsvarende tjeneste.
            </p>
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
  } else {
    return (
      <div className="registrering-container">
        <h2>{translations.registration.registrationComplete}</h2>
        <StegIndikator />
        
        <div className="suksessmelding" role="status">{suksessmelding}</div>
        
        <Link to="/innlogging">
          <button className="innlogging-knapp">
            {translations.registration.goToLogin}
          </button>
        </Link>
      </div>
    );
  }
}

export default Registrering; 