import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../utils/LanguageContext';
import { useAuth } from '../context/AuthContext';
import './Innlogging.css';

function Innlogging({ onLogin }) {
  const { translations } = useLanguage();
  const { signIn, authError, user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [feilmelding, setFeilmelding] = useState('');
  const [suksessmelding, setSuksessmelding] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  // Lytter for online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Redirect hvis brukeren allerede er logget inn
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);
  
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
    setFeilmelding('');
    
    // Sjekk om vi er offline
    if (isOffline) {
      console.log('Bruker er offline, bruker lokal innlogging');
    }
    
    // Valider input
    if (!formData.email || !formData.password) {
      setFeilmelding(translations.login.fillBothFields);
      setLoading(false);
      return;
    }
    
    try {
      // Bruk AuthContext for innlogging
      const success = await signIn(formData.email, formData.password);
      
      if (!success) {
        setFeilmelding(authError || translations.login.loginFailed);
        setLoading(false);
        return;
      }
      
      // Vis suksessmelding
      setSuksessmelding(translations.login.loginSuccess);
      setFeilmelding('');
      
      // Hvis onLogin-callback er tilgjengelig, kall den
      if (onLogin && typeof onLogin === 'function') {
        onLogin();
      }
      
      // Redirect til forsiden etter en kort pause
      setTimeout(() => {
        navigate('/');
      }, 1000);
      
    } catch (error) {
      console.error('Innloggingsfeil:', error);
      
      // Spesifikk feilmelding for nettverksproblemer
      if (error.message && (
          error.message.includes('fetch') || 
          error.message.includes('network') || 
          error.message.includes('timeout') ||
          error.message.includes('connection'))) {
        setFeilmelding('Nettverksfeil: Kunne ikke koble til serveren. Sjekk internettforbindelsen.');
      } else {
        setFeilmelding(error.message || translations.login.loginFailed);
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="innlogging-container">
      <h2>{translations.login.title}</h2>
      
      {isOffline && (
        <div className="offline-notice">
          <strong>Du er offline.</strong> Innlogging vil prøve å bruke lokalt lagrede data.
        </div>
      )}
      
      {(authError || feilmelding) && (
        <div className="feilmelding" role="alert">
          {authError || feilmelding}
          <div className="teknisk-stotte">
            <p>Opplever du problemer med innloggingen?</p>
            <ul>
              <li>Sjekk at du har internettforbindelse</li>
              <li>Prøv å oppdatere siden</li>
              <li>Tøm nettleserens hurtigbuffer (cache)</li>
              <li>Kontakt teknisk leder i NyskolenPosten: <a href="mailto:mattis.tollefsen@nionett.no">mattis.tollefsen@nionett.no</a></li>
            </ul>
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