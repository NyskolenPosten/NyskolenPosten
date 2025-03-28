// App.js - Hovedkomponenten for Nyskolen Posten
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Hjem from './components/Hjem';
import OmOss from './components/OmOss';
import NyArtikkel from './components/NyArtikkel';
import ArtikkelVisning from './components/ArtikkelVisning';
import Login from './components/Login';
import Register from './components/Register';
import MineArtikler from './components/MineArtikler';
import AdminPanel from './components/AdminPanel';
import Footer from './components/Footer';

function App() {
  const [bruker, setBruker] = useState(null);
  const [artikler, setArtikler] = useState([]);
  const [brukere, setBrukere] = useState([]);
  
  // Håndterer innlogging
  const handleLogin = (brukerInfo) => {
    setBruker(brukerInfo);
    localStorage.setItem('bruker', JSON.stringify(brukerInfo));
  };
  
  const handleLogout = () => {
    setBruker(null);
    localStorage.removeItem('bruker');
  };
  
  // Registrerer ny bruker
  const registrerBruker = (nyBruker) => {
    // Sjekk om epost allerede er registrert
    if (brukere.some(b => b.epost === nyBruker.epost)) {
      return false; // Epost allerede i bruk
    }
    
    const brukerMedInfo = {
      ...nyBruker,
      id: Date.now().toString(),
      godkjent: false, // Nye brukere må godkjennes først
      dato: new Date().toISOString()
    };
    
    const oppdaterteBrukere = [...brukere, brukerMedInfo];
    setBrukere(oppdaterteBrukere);
    localStorage.setItem('brukere', JSON.stringify(oppdaterteBrukere));
    
    return true; // Registrering vellykket
  };
  
  // Godkjenner en bruker
  const godkjennBruker = (brukerID) => {
    const oppdaterteBrukere = brukere.map(bruker => 
      bruker.id === brukerID ? {...bruker, godkjent: true} : bruker
    );
    setBrukere(oppdaterteBrukere);
    localStorage.setItem('brukere', JSON.stringify(oppdaterteBrukere));
  };
  
  // Legg til ny artikkel
  const leggTilArtikkel = (nyArtikkel) => {
    // Sjekk om bruker er godkjent
    if (!bruker.godkjent) {
      return false; // Bruker er ikke godkjent
    }
    
    // Legger til bruker og dato til artikkelen
    const artikkelMedInfo = {
      ...nyArtikkel,
      forfatter: bruker.navn,
      forfatterEpost: bruker.epost,
      brukerID: bruker.id,
      dato: new Date().toISOString(),
      artikkelID: Date.now().toString(),
      godkjent: false // Artikler starter som ikke-godkjente
    };
    
    // Legger til i listen over artikler
    const oppdaterteArtikler = [artikkelMedInfo, ...artikler];
    setArtikler(oppdaterteArtikler);
    localStorage.setItem('artikler', JSON.stringify(oppdaterteArtikler));
    
    return artikkelMedInfo.artikkelID;
  };
  
  // Godkjenner en artikkel
  const godkjennArtikkel = (artikkelID) => {
    const oppdaterteArtikler = artikler.map(artikkel => 
      artikkel.artikkelID === artikkelID ? {...artikkel, godkjent: true} : artikkel
    );
    setArtikler(oppdaterteArtikler);
    localStorage.setItem('artikler', JSON.stringify(oppdaterteArtikler));
  };
  
  // Sletter en artikkel
  const slettArtikkel = (artikkelID) => {
    const oppdaterteArtikler = artikler.filter(artikkel => artikkel.artikkelID !== artikkelID);
    setArtikler(oppdaterteArtikler);
    localStorage.setItem('artikler', JSON.stringify(oppdaterteArtikler));
  };
  
  // Henter data ved oppstart
  useEffect(() => {
    // Sjekk om bruker er logget inn i localStorage
    const lagretBruker = localStorage.getItem('bruker');
    if (lagretBruker) {
      setBruker(JSON.parse(lagretBruker));
    }
    
    // Henter artikler fra localStorage
    const lagretArtikler = localStorage.getItem('artikler');
    if (lagretArtikler) {
      setArtikler(JSON.parse(lagretArtikler));
    }
    
    // Henter brukere fra localStorage
    const lagretBrukere = localStorage.getItem('brukere');
    if (lagretBrukere) {
      setBrukere(JSON.parse(lagretBrukere));
    } else {
      // Opprett admin-bruker ved første oppstart hvis ingen brukere finnes
      const adminBruker = {
        id: 'admin-1',
        navn: 'Administrator',
        epost: 'admin@nyskolen.no',
        rolle: 'admin',
        godkjent: true,
        dato: new Date().toISOString()
      };
      setBrukere([adminBruker]);
      localStorage.setItem('brukere', JSON.stringify([adminBruker]));
    }
  }, []);
  
  return (
    <Router>
      <div className="app">
        <header className="header">
          <div className="logo-container">
            <h1>Nyskolen Posten</h1>
            <p className="slogan">Elevdrevet avis for Nyskolen i Oslo</p>
          </div>
          <nav className="navigation">
            <Link to="/">Forsiden</Link>
            <Link to="/om-oss">Om Nyskolen Posten</Link>
            {bruker ? (
              <>
                {bruker.godkjent && <Link to="/ny-artikkel">Skriv ny artikkel</Link>}
                <Link to="/mine-artikler">Mine artikler</Link>
                {(bruker.rolle === 'admin' || bruker.rolle === 'redaktør') && 
                  <Link to="/admin">Administrer</Link>
                }
                <button onClick={handleLogout} className="logout-button">Logg ut ({bruker.navn})</button>
              </>
            ) : (
              <>
                <Link to="/login" className="login-button">Logg inn</Link>
                <Link to="/register" className="register-button">Registrer deg</Link>
              </>
            )}
          </nav>
        </header>
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Hjem artikler={artikler.filter(a => a.godkjent)} />} />
            <Route path="/om-oss" element={<OmOss />} />
            <Route path="/ny-artikkel" element={
              bruker ? (
                bruker.godkjent ? <NyArtikkel leggTilArtikkel={leggTilArtikkel} /> : 
                <div className="ikke-godkjent">
                  <h2>Venter på godkjenning</h2>
                  <p>Kontoen din må godkjennes av en administrator før du kan skrive artikler.</p>
                </div>
              ) : <Login onLogin={handleLogin} melding="Du må logge inn for å skrive artikler" />
            } />
            <Route path="/artikkel/:id" element={<ArtikkelVisning artikler={artikler} />} />
            <Route path="/mine-artikler" element={
              bruker ? 
                <MineArtikler 
                  artikler={artikler.filter(a => a.brukerID === bruker.id)} 
                  erGodkjent={bruker.godkjent}
                /> : 
                <Login onLogin={handleLogin} melding="Du må logge inn for å se dine artikler" />
            } />
            <Route path="/admin" element={
              bruker && (bruker.rolle === 'admin' || bruker.rolle === 'redaktør') ? 
                <AdminPanel 
                  brukere={brukere} 
                  artikler={artikler} 
                  godkjennBruker={godkjennBruker} 
                  godkjennArtikkel={godkjennArtikkel}
                  slettArtikkel={slettArtikkel}
                  erAdmin={bruker.rolle === 'admin'}
                /> : 
                <Hjem artikler={artikler.filter(a => a.godkjent)} />
            } />
            <Route path="/login" element={<Login onLogin={handleLogin} brukere={brukere} />} />
            <Route path="/register" element={<Register registrerBruker={registrerBruker} />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;
