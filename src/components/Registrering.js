import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../utils/LanguageContext';
import { registrerBruker } from '../services/authService';
import './Registrering.css';

function Registrering() {
  const { translations } = useLanguage();
  const navigate = useNavigate();
  const [steg, setSteg] = useState(1); // 1: Skjema, 2: Fullført
  const [formData, setFormData] = useState({
    navn: '',
    email: '',
    password: '',
    bekreftPassword: '',
    klasse: 'Gul' // Standard verdi satt til Gul
  });
  const [feilmelding, setFeilmelding] = useState('');
  const [suksessmelding, setSuksessmelding] = useState('');
  const [loading, setLoading] = useState(false);

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
    if (!formData.navn || !formData.email || !formData.password || !formData.klasse) {
      setFeilmelding(translations.registration.allFieldsRequired);
      return false;
    }
    
    if (formData.password !== formData.bekreftPassword) {
      setFeilmelding(translations.registration.passwordsMustMatch);
      return false;
    }
    
    if (!formData.email.includes('@')) {
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
    setLoading(true);
    
    try {
      // Bruk authService for registrering
      const result = await registrerBruker(
        formData.email, 
        formData.password, 
        formData.navn, 
        formData.klasse
      );
      
      if (!result.success) {
        setFeilmelding(result.error || translations.registration.registrationFailed);
        setLoading(false);
        return;
      }
      
      // Viser brukeren at registreringen var vellykket
      setSuksessmelding(translations.registration.registrationSuccess);
      setSteg(2); // Gå til fullført-skjermen

      // Viser detaljert informasjon om den nye brukeren (for debug-formål)
      console.log('Registrert bruker:', result.bruker);
      
      // Lagre i localStorage for å sikre at brukeren er tilgjengelig i hele appen
      if (result.bruker) {
        localStorage.setItem('currentUser', JSON.stringify({
          uid: result.bruker.id,
          email: result.bruker.email,
          displayName: result.bruker.navn
        }));
      }

    } catch (error) {
      setFeilmelding(error.message || translations.registration.registrationFailed);
    } finally {
      setLoading(false);
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

  // Vis skjema basert på hvilket steg vi er på
  if (steg === 1) {
    return (
      <div className="registrering-container">
        <h2>{translations.registration.title}</h2>
        <StegIndikator />
        
        {feilmelding && (
          <div className="feilmelding" role="alert">
            {feilmelding}
            <div className="teknisk-stotte">
              <p>Fant du en feil/bug? Kontakt teknisk leder i NyskolenPosten: <a href="mailto:mattis.tollefsen@nionett.no">mattis.tollefsen@nionett.no</a></p>
              <p>Jeg fikser det så fort som mulig!</p>
            </div>
          </div>
        )}
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
            <label htmlFor="email">{translations.registration.email}</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={translations.registration.emailPlaceholder}
              autoComplete="email"
              inputMode="email"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">{translations.registration.password}</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={translations.registration.passwordPlaceholder}
              autoComplete="new-password"
              minLength="6"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="bekreftPassword">{translations.registration.confirmPassword}</label>
            <input
              type="password"
              id="bekreftPassword"
              name="bekreftPassword"
              value={formData.bekreftPassword}
              onChange={handleChange}
              placeholder={translations.registration.confirmPasswordPlaceholder}
              autoComplete="new-password"
              minLength="6"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="klasse">{translations.registration.class}</label>
            <select
              id="klasse"
              name="klasse"
              value={formData.klasse}
              onChange={handleChange}
              required
            >
              <option value="Gul">Gul</option>
              <option value="Rød">Rød</option>
              <option value="Blå">Blå</option>
              <option value="Ungdomstrinnet">Ungdomstrinnet</option>
              <option value="Ansatte">Ansatte</option>
            </select>
          </div>
          
          <button 
            type="submit" 
            className="registrer-knapp"
            disabled={loading}
          >
            {loading ? translations.general.loading : translations.registration.registerButton}
          </button>
        </form>
        
        <div className="innlogging-link">
          <p>{translations.registration.haveAccount} <Link to="/logg-inn">{translations.registration.loginHere}</Link></p>
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
          onClick={() => navigate('/logg-inn')}>
          {translations.registration.goToLogin}
        </button>
      </div>
    );
  }
}

export default Registrering; 