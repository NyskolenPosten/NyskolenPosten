import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useLanguage } from '../utils/LanguageContext';
import './Registrering.css';

function Registrering({ onRegistrer }) {
  const { translations } = useLanguage();
  const [steg, setSteg] = useState(1); // 1: Skjema, 2: Fullført
  const [formData, setFormData] = useState({
    navn: '',
    epost: '',
    passord: '',
    bekreftPassord: '',
    klasse: ''
  });
  const [feilmelding, setFeilmelding] = useState('');
  const [suksessmelding, setSuksessmelding] = useState('');
  const [redirect, setRedirect] = useState(false);

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
    setSuksessmelding('');
    
    // Forbered brukerdata for registrering
    const brukerData = {
      navn: formData.navn,
      epost: formData.epost,
      passord: formData.passord,
      klasse: formData.klasse,
      rolle: 'journalist', // Standard rolle er journalist
      dato: new Date().toISOString()
    };
    
    // Fullfør registreringsprosessen
    const registreringsResultat = onRegistrer(brukerData);
    
    if (registreringsResultat.success) {
      setSuksessmelding(translations.registration.registrationSuccess);
      setSteg(2); // Ferdig
    } else {
      setFeilmelding(registreringsResultat.message || translations.registration.registrationFailed);
    }
  };

  // Steg-indikator komponent
  const StegIndikator = () => (
    <div className="registrering-steg">
      <div className="steg-indikator">
        <div className={`steg-dot ${steg >= 1 ? 'aktiv' : ''}`} role="progressbar" aria-valuenow="1" aria-valuemin="1" aria-valuemax="2"></div>
        <div className={`steg-dot ${steg >= 2 ? 'aktiv' : ''}`} role="progressbar" aria-valuenow="2" aria-valuemin="1" aria-valuemax="2"></div>
      </div>
    </div>
  );

  // Redirect til innloggingssiden etter registrering
  if (redirect) {
    return <Navigate to="/innlogging" />;
  }

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
  } else {
    return (
      <div className="registrering-container">
        <h2>{translations.registration.registrationComplete}</h2>
        <StegIndikator />
        
        <div className="suksessmelding" role="status">{suksessmelding}</div>
        
        <button 
          className="innlogging-knapp"
          onClick={() => setRedirect(true)}>
          {translations.registration.goToLogin}
        </button>
      </div>
    );
  }
}

export default Registrering; 