import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendVerificationCode } from '../utils/emailUtil';
import { verifyCode, checkPrivilegedEmail } from '../utils/verificationUtil';
import './Registrering.css';

function Registrering({ onRegistrer }) {
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
  const [melding, setMelding] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setFeilmelding('');
  };

  const validateForm = () => {
    if (!formData.navn || !formData.epost || !formData.passord || !formData.klasse) {
      setFeilmelding('Alle felt må fylles ut');
      return false;
    }
    
    if (formData.passord !== formData.bekreftPassord) {
      setFeilmelding('Passordene må være like');
      return false;
    }
    
    if (!formData.epost.includes('@')) {
      setFeilmelding('Vennligst oppgi en gyldig e-postadresse');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setMelding('Sender verifiseringskode...');
    
    try {
      // Send verifiseringskode til brukerens e-post
      const result = await sendVerificationCode(formData.epost, formData.navn, 'registration');
      
      if (result.success) {
        setMelding('En verifiseringskode er sendt til din e-post. Vennligst sjekk innboksen din.');
        setSteg(2);
      } else {
        setFeilmelding('Kunne ikke sende verifiseringskode. Vennligst prøv igjen senere.');
      }
    } catch (error) {
      console.error('Feil ved sending av verifiseringskode:', error);
      setFeilmelding('En feil oppstod. Vennligst prøv igjen senere.');
    }
  };

  const handleVerification = (e) => {
    e.preventDefault();
    
    if (!verifiseringskode) {
      setFeilmelding('Vennligst oppgi verifiseringskoden');
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
        setMelding('Registrering fullført! Du kan nå logge inn.');
        setSteg(3); // Ferdig
      } else {
        setFeilmelding(registreringsResultat.message || 'Registrering feilet. Vennligst prøv igjen.');
        setSteg(1); // Tilbake til registreringsskjema
      }
    } else {
      setFeilmelding('Ugyldig eller utløpt verifiseringskode. Vennligst prøv igjen.');
    }
  };

  // Steg-indikator komponent
  const StegIndikator = () => (
    <div className="registrering-steg">
      <div className="steg-indikator">
        <div className={`steg-dot ${steg >= 1 ? 'aktiv' : ''}`}></div>
        <div className={`steg-dot ${steg >= 2 ? 'aktiv' : ''}`}></div>
        <div className={`steg-dot ${steg >= 3 ? 'aktiv' : ''}`}></div>
      </div>
    </div>
  );

  // Vis skjema basert på hvilket steg vi er på
  if (steg === 1) {
    return (
      <div className="registrering-container">
        <h2>Registrer deg</h2>
        <StegIndikator />
        
        {feilmelding && <div className="feilmelding">{feilmelding}</div>}
        {melding && <div className="melding">{melding}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="navn">Navn</label>
            <input
              type="text"
              id="navn"
              name="navn"
              value={formData.navn}
              onChange={handleChange}
              placeholder="Skriv inn fullt navn"
              autoComplete="name"
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
              placeholder="Din e-postadresse"
              autoComplete="email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="passord">Passord</label>
            <input
              type="password"
              id="passord"
              name="passord"
              value={formData.passord}
              onChange={handleChange}
              placeholder="Velg et passord"
              autoComplete="new-password"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="bekreftPassord">Bekreft passord</label>
            <input
              type="password"
              id="bekreftPassord"
              name="bekreftPassord"
              value={formData.bekreftPassord}
              onChange={handleChange}
              placeholder="Skriv passordet på nytt"
              autoComplete="new-password"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="klasse">Klasse</label>
            <input
              type="text"
              id="klasse"
              name="klasse"
              value={formData.klasse}
              onChange={handleChange}
              placeholder="Hvilken klasse går du i?"
            />
          </div>
          
          <button type="submit" className="registrer-knapp">Registrer deg</button>
        </form>
        
        <div className="innlogging-link">
          <p>Har du allerede en konto? <Link to="/innlogging">Logg inn her</Link></p>
        </div>
      </div>
    );
  } else if (steg === 2) {
    return (
      <div className="registrering-container">
        <h2>Verifiser e-post</h2>
        <StegIndikator />
        
        {feilmelding && <div className="feilmelding">{feilmelding}</div>}
        {melding && <div className="melding">{melding}</div>}
        
        <form onSubmit={handleVerification}>
          <div className="form-group">
            <label htmlFor="verifiseringskode">Verifiseringskode</label>
            <input
              type="text"
              id="verifiseringskode"
              value={verifiseringskode}
              onChange={(e) => setVerifiseringskode(e.target.value)}
              placeholder="Skriv inn 6-sifret kode"
              autoComplete="one-time-code"
              maxLength="6"
            />
          </div>
          
          <button type="submit" className="verifiser-knapp">Verifiser</button>
          <button 
            type="button" 
            className="tilbake-knapp"
            onClick={() => setSteg(1)}>
            Tilbake
          </button>
        </form>
      </div>
    );
  } else {
    return (
      <div className="registrering-container">
        <h2>Registrering fullført</h2>
        <StegIndikator />
        
        <div className="melding">{melding}</div>
        
        <Link to="/innlogging">
          <button className="innlogging-knapp">
            Gå til innlogging
          </button>
        </Link>
      </div>
    );
  }
}

export default Registrering; 