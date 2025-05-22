// components/Login.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

function Login({ onLogin, melding, brukere = [] }) {
  const [epost, setEpost] = useState('');
  const [passord, setPassord] = useState('');
  const [feilmelding, setFeilmelding] = useState('');
  const navigate = useNavigate();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validering
    if (!epost || !passord) {
      setFeilmelding('Du må fylle ut både e-postadresse og passord');
      return;
    }
    
    // Finn bruker basert på e-post
    const bruker = brukere.find(b => b.epost.toLowerCase() === epost.toLowerCase());
    
    if (!bruker) {
      setFeilmelding('Finner ingen bruker med denne e-postadressen');
      return;
    }
    
    // I en reell app ville vi ha kryptert og verifisert passordet
    // Her gjør vi en enkel sjekk
    if (bruker.passord !== passord) {
      setFeilmelding('Feil passord');
      return;
    }
    
    // Kaller onLogin-funksjonen fra App.js
    onLogin(bruker);
    navigate('/');
  };
  
  return (
    <div className="login">
      <h2>Logg inn på Nyskolen Posten</h2>
      
      {melding && <div className="melding-boks">{melding}</div>}
      
      {feilmelding && <div className="feilmelding">{feilmelding}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-gruppe">
          <label htmlFor="epost">E-postadresse:</label>
          <input 
            type="email"
            id="epost"
            value={epost}
            onChange={(e) => setEpost(e.target.value)}
            placeholder="din.epost@example.com"
          />
        </div>
        
        <div className="form-gruppe">
          <label htmlFor="passord">Passord:</label>
          <input 
            type="password"
            id="passord"
            value={passord}
            onChange={(e) => setPassord(e.target.value)}
            placeholder="Skriv inn ditt passord"
          />
        </div>
        
        <button type="submit" className="login-knapp">Logg inn</button>
      </form>
      
      <p className="register-link">
        Har du ikke en konto? <Link to="/register">Registrer deg her</Link>
      </p>
    </div>
  );
}

export default Login; 