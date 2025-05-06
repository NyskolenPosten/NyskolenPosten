import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../utils/LanguageContext';
import { useAuth } from '../context/AuthContext';
import './Innlogging.css';

function Innlogging({ onLogin }) {
  const { translations } = useLanguage();
  const { signIn, authError } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
    
    // Nullstill feilmeldinger når brukeren begynner å skrive
    setFeilmelding('');
    setSuksessmelding('');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Valider input
    if (!formData.email || !formData.password) {
      setFeilmelding(translations.login.fillBothFields);
      setLoading(false);
      return;
    }
    
    try {
      // Bruk authService for innlogging
      const success = await signIn(formData.email, formData.password);
      
      if (!success) {
        setLoading(false);
        return;
      }
      
      // Vis suksessmelding
      setSuksessmelding(translations.login.loginSuccess);
      setFeilmelding('');
      
      // Redirect til forsiden etter en kort pause
      setTimeout(() => {
        navigate('/');
      }, 1000);
      
    } catch (error) {
      setFeilmelding(translations.login.loginFailed);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="innlogging-container">
      <h2>{translations.login.title}</h2>
      
      {(authError || feilmelding) && (
        <div className="feilmelding" role="alert">
          {authError || feilmelding}
          <div className="teknisk-stotte">
            <p>Fant du en feil/bug? Kontakt teknisk leder i NyskolenPosten: <a href="mailto:mattis.tollefsen@nionett.no">mattis.tollefsen@nionett.no</a></p>
            <p>Jeg fikser det så fort som mulig!</p>
          </div>
        </div>
      )}
      {suksessmelding && <div className="suksessmelding" role="status">{suksessmelding}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">{translations.login.email}</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder={translations.login.emailPlaceholder}
            autoComplete="email"
            inputMode="email"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">{translations.login.password}</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder={translations.login.passwordPlaceholder}
            autoComplete="current-password"
            required
          />
        </div>
        
        <button 
          type="submit" 
          className="login-knapp"
          disabled={loading}
        >
          {loading ? translations.general.loading : translations.login.loginButton}
        </button>
      </form>
      
      <div className="register-link">
        <p>{translations.login.registerPrompt} <Link to="/registrer">{translations.login.registerHere}</Link></p>
      </div>
    </div>
  );
}

export default Innlogging; 