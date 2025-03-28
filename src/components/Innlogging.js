import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useLanguage } from '../utils/LanguageContext';
import './Innlogging.css';

function Innlogging({ onLogin, userIsAuthenticated, brukere }) {
  const { translations } = useLanguage();
  const [formData, setFormData] = useState({
    epost: '',
    passord: ''
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
    
    // Nullstill feilmeldinger når brukeren begynner å skrive
    setFeilmelding('');
    setSuksessmelding('');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Valider input
    if (!formData.epost || !formData.passord) {
      setFeilmelding(translations.login.fillBothFields);
      return;
    }
    
    // Finn brukeren
    const bruker = brukere.find(b => b.epost === formData.epost);
    
    if (!bruker) {
      setFeilmelding(translations.login.userNotFound);
      return;
    }
    
    // Sjekk passord
    if (bruker.passord !== formData.passord) {
      setFeilmelding(translations.login.wrongPassword);
      return;
    }
    
    // Utfør innlogging
    onLogin(bruker);
    
    // Vis suksessmelding
    setSuksessmelding(translations.login.loginSuccess);
    setFeilmelding('');
    
    // Redirect til forsiden etter en kort pause
    setTimeout(() => {
      setRedirect(true);
    }, 1000);
  };
  
  // Redirect hvis allerede logget inn
  if (userIsAuthenticated || redirect) {
    return <Navigate to="/" />;
  }
  
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
}

export default Innlogging; 