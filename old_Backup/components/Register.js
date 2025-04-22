// components/Register.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Register.css';

function Register({ onRegister, brukere = [] }) {
  const [navn, setNavn] = useState('');
  const [epost, setEpost] = useState('');
  const [passord, setPassord] = useState('');
  const [bekreftPassord, setBekreftPassord] = useState('');
  const [feilmelding, setFeilmelding] = useState('');
  const [suksess, setSuksess] = useState(false);
  const navigate = useNavigate();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setFeilmelding('');
    
    // Validering
    if (!navn || !epost || !passord || !bekreftPassord) {
      setFeilmelding('Alle feltene må fylles ut');
      return;
    }
    
    if (passord !== bekreftPassord) {
      setFeilmelding('Passordene må være like');
      return;
    }
    
    if (passord.length < 6) {
      setFeilmelding('Passordet må være minst 6 tegn');
      return;
    }
    
    // Sjekk om e-postadressen allerede er i bruk
    const eksisterendeBruker = brukere.find(b => b.epost.toLowerCase() === epost.toLowerCase());
    if (eksisterendeBruker) {
      setFeilmelding('Denne e-postadressen er allerede registrert');
      return;
    }
    
    // Opprett ny bruker
    const nyBruker = {
      id: Date.now().toString(),
      navn,
      epost,
      passord,
      rolle: 'bruker', // Standard rolle for nye brukere
      registrertDato: new Date().toISOString()
    };
    
    // Kall onRegister-funksjonen fra App.js
    onRegister(nyBruker);
    setSuksess(true);
    
    // Redirect til login etter 2 sekunder
    setTimeout(() => {
      navigate('/login', { state: { melding: 'Registrering vellykket! Du kan nå logge inn.' } });
    }, 2000);
  };
  
  if (suksess) {
    return (
      <div className="register">
        <div className="suksess-melding">
          <h2>Registrering vellykket!</h2>
          <p>Du blir nå videresendt til innloggingssiden...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="register">
      <h2>Registrer deg på Nyskolen Posten</h2>
      
      {feilmelding && <div className="feilmelding">{feilmelding}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-gruppe">
          <label htmlFor="navn">Navn:</label>
          <input 
            type="text"
            id="navn"
            value={navn}
            onChange={(e) => setNavn(e.target.value)}
            placeholder="Ditt fulle navn"
          />
        </div>
        
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
            placeholder="Minst 6 tegn"
          />
        </div>
        
        <div className="form-gruppe">
          <label htmlFor="bekreft-passord">Bekreft passord:</label>
          <input 
            type="password"
            id="bekreft-passord"
            value={bekreftPassord}
            onChange={(e) => setBekreftPassord(e.target.value)}
            placeholder="Gjenta passordet"
          />
        </div>
        
        <button type="submit" className="register-knapp">Registrer deg</button>
      </form>
      
      <p className="login-link">
        Har du allerede en konto? <Link to="/login">Logg inn her</Link>
      </p>
    </div>
  );
}

export default Register; 