import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { useLanguage } from '../utils/LanguageContext';
import './Profil.css';

const Profil = () => {
  const { user, updateUser, logout } = useAuth();
  const { translations } = useLanguage();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    navn: '',
    epost: '',
    passord: '',
    bekreftPassord: ''
  });
  
  const [feilmelding, setFeilmelding] = useState('');
  const [suksessmelding, setSuksessmelding] = useState('');
  const [visPassord, setVisPassord] = useState(false);
  
  // Populer skjemaet med brukerdata når det lastes
  useEffect(() => {
    if (user) {
      setFormData({
        navn: user.navn || '',
        epost: user.epost || '',
        passord: '',
        bekreftPassord: ''
      });
    } else {
      // Hvis ikke innlogget, redirect til innloggingssiden
      navigate('/innlogging');
    }
  }, [user, navigate]);
  
  // Håndter endringer i skjemafelter
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Håndter skjemainnsendig
  const handleSubmit = (e) => {
    e.preventDefault();
    setFeilmelding('');
    setSuksessmelding('');
    
    // Valider formdata
    if (!formData.navn.trim()) {
      setFeilmelding('Navn er påkrevd');
      return;
    }
    
    if (!formData.epost.trim()) {
      setFeilmelding('E-post er påkrevd');
      return;
    }
    
    // Valider passord bare hvis det er fylt ut (passordendring)
    if (formData.passord) {
      if (formData.passord.length < 6) {
        setFeilmelding('Passordet må være minst 6 tegn');
        return;
      }
      
      if (formData.passord !== formData.bekreftPassord) {
        setFeilmelding('Passordene må være like');
        return;
      }
    }
    
    // Oppdater bruker i localStorage og i brukerlisten
    const oppdatertBruker = {
      ...user,
      navn: formData.navn,
      epost: formData.epost
    };
    
    // Oppdater passord hvis det er fylt ut
    if (formData.passord) {
      oppdatertBruker.passord = formData.passord;
    }
    
    // Oppdater bruker i localStorage
    updateUser(oppdatertBruker);
    
    // Oppdater også i brukerlisten i localStorage
    const brukere = JSON.parse(localStorage.getItem('brukere') || '[]');
    const oppdatertBrukere = brukere.map(b => 
      b.id === user.id ? oppdatertBruker : b
    );
    localStorage.setItem('brukere', JSON.stringify(oppdatertBrukere));
    
    // Vis suksessmelding
    setSuksessmelding('Profilen din er oppdatert');
    
    // Tilbakestill passordfelter
    setFormData(prev => ({
      ...prev,
      passord: '',
      bekreftPassord: ''
    }));
  };
  
  // Håndter sletting av konto
  const handleDeleteAccount = () => {
    if (window.confirm('Er du sikker på at du vil slette kontoen din? Dette kan ikke angres.')) {
      // Fjern bruker fra brukerlisten
      const brukere = JSON.parse(localStorage.getItem('brukere') || '[]');
      const oppdatertBrukere = brukere.filter(b => b.id !== user.id);
      localStorage.setItem('brukere', JSON.stringify(oppdatertBrukere));
      
      // Logg ut brukeren
      logout();
      
      // Redirect til hjemmesiden
      navigate('/');
    }
  };
  
  // Vis laster-indikator hvis bruker ikke er lastet ennå
  if (!user) {
    return <div className="laster">Laster profil...</div>;
  }
  
  return (
    <div className="profil-container">
      <h2>Min profil</h2>
      
      {feilmelding && <div className="feilmelding">{feilmelding}</div>}
      {suksessmelding && <div className="suksessmelding">{suksessmelding}</div>}
      
      <form onSubmit={handleSubmit} className="profil-form">
        <div className="form-group">
          <label htmlFor="navn">Navn</label>
          <input
            type="text"
            id="navn"
            name="navn"
            value={formData.navn}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="epost">E-post</label>
          <input
            type="email"
            id="epost"
            name="epost"
            value={formData.epost}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="passord">Nytt passord (la være tomt for å beholde nåværende)</label>
          <div className="passord-container">
            <input
              type={visPassord ? "text" : "password"}
              id="passord"
              name="passord"
              value={formData.passord}
              onChange={handleChange}
            />
            <button
              type="button"
              className="vis-passord-knapp"
              onClick={() => setVisPassord(!visPassord)}
            >
              {visPassord ? '👁️‍🗨️' : '👁️'}
            </button>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="bekreftPassord">Bekreft nytt passord</label>
          <input
            type={visPassord ? "text" : "password"}
            id="bekreftPassord"
            name="bekreftPassord"
            value={formData.bekreftPassord}
            onChange={handleChange}
          />
        </div>
        
        <div className="profil-actions">
          <button type="submit" className="lagre-knapp">
            Lagre endringer
          </button>
          
          <button 
            type="button" 
            className="slett-konto-knapp"
            onClick={handleDeleteAccount}
          >
            Slett konto
          </button>
        </div>
      </form>
      
      <div className="profil-info">
        <p><strong>Brukerrolle:</strong> {user.rolle}</p>
        <p><strong>Medlem siden:</strong> {new Date(user.dato).toLocaleDateString('no-NO')}</p>
      </div>
    </div>
  );
};

export default Profil; 