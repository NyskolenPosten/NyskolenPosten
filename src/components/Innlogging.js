import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import './Innlogging.css';

function Innlogging({ onLogin, brukere = [], melding = '' }) {
  const [epost, setEpost] = useState('');
  const [passord, setPassord] = useState('');
  const [feilmelding, setFeilmelding] = useState(melding);
  const [redirect, setRedirect] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validering
    if (!epost.trim() || !passord.trim()) {
      setFeilmelding('Vennligst fyll ut alle feltene');
      return;
    }
    
    // Finn bruker basert på e-post
    const bruker = brukere.find(b => b.epost === epost);
    
    if (!bruker) {
      setFeilmelding('Finner ingen bruker med denne e-postadressen');
      return;
    }
    
    // Sjekk passord
    if (bruker.passord !== passord) {
      setFeilmelding('Feil passord');
      return;
    }
    
    // Logg inn brukeren
    onLogin(bruker);
    setRedirect(true);
  };
  
  // Redirect til forsiden etter innlogging
  if (redirect) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="innlogging">
      <h2>Logg inn</h2>
      
      {feilmelding && <div className="feilmelding">{feilmelding}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-gruppe">
          <label htmlFor="epost">E-post:</label>
          <input 
            type="email" 
            id="epost" 
            value={epost} 
            onChange={(e) => setEpost(e.target.value)} 
            required 
          />
        </div>
        
        <div className="form-gruppe">
          <label htmlFor="passord">Passord:</label>
          <input 
            type="password" 
            id="passord" 
            value={passord} 
            onChange={(e) => setPassord(e.target.value)} 
            required 
          />
        </div>
        
        <button type="submit" className="login-knapp">
          Logg inn
        </button>
      </form>
      
      <div className="innlogging-lenker">
        <p>
          Har du ikke en konto? <Link to="/registrering">Registrer deg</Link>
        </p>
      </div>
      
      <div className="test-info">
        <h3>Testbrukere</h3>
        <p>For testing kan du bruke følgende:</p>
        <ul>
          <li>Admin: admin@nyskolen.no / admin123</li>
        </ul>
      </div>
    </div>
  );
}

export default Innlogging; 