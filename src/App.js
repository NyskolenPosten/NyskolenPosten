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
import Header from './components/Header';
import Innlogging from './components/Innlogging';
import Registrering from './components/Registrering';
import CacheMonitor from './components/CacheMonitor';
import { LanguageProvider } from './utils/LanguageContext';

function App() {
  const [innloggetBruker, setInnloggetBruker] = useState(null);
  const [artikler, setArtikler] = useState([]);
  const [brukere, setBrukere] = useState([]);
  const [jobbliste, setJobbliste] = useState([]);
  const [kategoriliste, setKategoriliste] = useState([]);
  
  // Admin e-postliste for automatisk godkjenning og admin-rolle
  const adminEpostliste = ['mattis.tollefsen@nionett.no', 'admin@nyskolen.no'];
  
  // Last inn data fra localStorage ved oppstart
  useEffect(() => {
    // Last inn innlogget bruker
    const lagretBruker = localStorage.getItem('innloggetBruker');
    if (lagretBruker) {
      setInnloggetBruker(JSON.parse(lagretBruker));
    }
    
    // Last inn artikler
    const lagredeArtikler = localStorage.getItem('artikler');
    if (lagredeArtikler) {
      setArtikler(JSON.parse(lagredeArtikler));
    }
    
    // Last inn brukere
    const lagredeBrukere = localStorage.getItem('brukere');
    if (lagredeBrukere) {
      setBrukere(JSON.parse(lagredeBrukere));
    } else {
      // Opprett admin-bruker hvis ingen brukere finnes
      const adminBruker = {
        id: 'admin-' + Date.now(),
        navn: 'Administrator',
        epost: 'admin@nyskolen.no',
        passord: 'admin123',
        rolle: 'admin',
        godkjent: true,
        dato: new Date().toISOString()
      };
      setBrukere([adminBruker]);
      localStorage.setItem('brukere', JSON.stringify([adminBruker]));
    }
    
    // Last inn jobbliste
    const lagretJobbliste = localStorage.getItem('jobbliste');
    if (lagretJobbliste) {
      setJobbliste(JSON.parse(lagretJobbliste));
    } else {
      // Opprett standard jobbliste hvis ingen finnes
      const standardJobbliste = [
        {
          id: 'jobb-1',
          navn: 'Administrator',
          rolle: 'Redaktør',
          dato: new Date().toISOString()
        }
      ];
      setJobbliste(standardJobbliste);
      localStorage.setItem('jobbliste', JSON.stringify(standardJobbliste));
    }
    
    // Last inn kategoriliste
    const lagretKategoriliste = localStorage.getItem('kategoriliste');
    if (lagretKategoriliste) {
      setKategoriliste(JSON.parse(lagretKategoriliste));
    } else {
      // Opprett standard kategoriliste hvis ingen finnes
      const standardKategoriliste = [
        {
          id: 'kat-1',
          kategori: 'Nyheter',
          ansvarlig: 'Administrator'
        },
        {
          id: 'kat-2',
          kategori: 'Kultur',
          ansvarlig: 'Administrator'
        },
        {
          id: 'kat-3',
          kategori: 'Sport',
          ansvarlig: 'Administrator'
        },
        {
          id: 'kat-4',
          kategori: 'Skole',
          ansvarlig: 'Administrator'
        },
        {
          id: 'kat-5',
          kategori: 'Saksmøtet',
          ansvarlig: 'Administrator'
        },
        {
          id: 'kat-6',
          kategori: 'Meninger',
          ansvarlig: 'Administrator'
        },
        {
          id: 'kat-7',
          kategori: 'Heureka',
          ansvarlig: 'Administrator'
        },
        {
          id: 'kat-8',
          kategori: 'Klassen',
          ansvarlig: 'Administrator'
        },
        {
          id: 'kat-9',
          kategori: 'Annet',
          ansvarlig: 'Administrator'
        }
      ];
      setKategoriliste(standardKategoriliste);
      localStorage.setItem('kategoriliste', JSON.stringify(standardKategoriliste));
    }
  }, []);
  
  // Funksjon for å logge inn
  const handleLogin = (bruker) => {
    setInnloggetBruker(bruker);
    localStorage.setItem('innloggetBruker', JSON.stringify(bruker));
  };
  
  // Funksjon for å logge ut
  const handleLogout = () => {
    setInnloggetBruker(null);
    localStorage.removeItem('innloggetBruker');
  };
  
  // Funksjon for å registrere ny bruker
  const registrerBruker = (nyBruker) => {
    // Sjekk om e-posten allerede er registrert
    const eksisterendeBruker = brukere.find(b => b.epost === nyBruker.epost);
    if (eksisterendeBruker) {
      return { success: false, message: 'E-postadressen er allerede registrert' };
    }
    
    // Sjekk om e-posten er i admin-listen
    const erAdmin = adminEpostliste.includes(nyBruker.epost);
    
    // Opprett bruker-objekt
    const brukerObjekt = {
      ...nyBruker,
      id: 'bruker-' + Date.now(),
      rolle: erAdmin ? 'admin' : 'journalist',
      godkjent: true, // Alle brukere er automatisk godkjent
      dato: new Date().toISOString()
    };
    
    // Legg til i brukerlisten
    const oppdatertBrukere = [...brukere, brukerObjekt];
    setBrukere(oppdatertBrukere);
    localStorage.setItem('brukere', JSON.stringify(oppdatertBrukere));
    
    // Legg til i jobblisten
    const nyJobblisteOppføring = {
      id: 'jobb-' + Date.now(),
      navn: brukerObjekt.navn,
      rolle: erAdmin ? 'Redaktør' : 'Journalist',
      dato: new Date().toISOString()
    };
    
    const oppdatertJobbliste = [...jobbliste, nyJobblisteOppføring];
    setJobbliste(oppdatertJobbliste);
    localStorage.setItem('jobbliste', JSON.stringify(oppdatertJobbliste));
    
    return { success: true, message: 'Bruker registrert' };
  };
  
  // Funksjon for å oppdatere bruker
  const oppdaterBruker = (oppdatertBruker) => {
    const oppdatertBrukere = brukere.map(bruker => 
      bruker.id === oppdatertBruker.id ? oppdatertBruker : bruker
    );
    setBrukere(oppdatertBrukere);
    localStorage.setItem('brukere', JSON.stringify(oppdatertBrukere));
    
    // Oppdater også innlogget bruker hvis det er samme bruker
    if (innloggetBruker && innloggetBruker.id === oppdatertBruker.id) {
      setInnloggetBruker(oppdatertBruker);
      localStorage.setItem('innloggetBruker', JSON.stringify(oppdatertBruker));
    }
  };
  
  // Funksjon for å slette bruker
  const slettBruker = (brukerId) => {
    const oppdatertBrukere = brukere.filter(bruker => bruker.id !== brukerId);
    setBrukere(oppdatertBrukere);
    localStorage.setItem('brukere', JSON.stringify(oppdatertBrukere));
    
    // Fjern også fra jobblisten
    const brukerNavn = brukere.find(b => b.id === brukerId)?.navn;
    if (brukerNavn) {
      const oppdatertJobbliste = jobbliste.filter(jobb => jobb.navn !== brukerNavn);
      setJobbliste(oppdatertJobbliste);
      localStorage.setItem('jobbliste', JSON.stringify(oppdatertJobbliste));
    }
  };
  
  // Funksjon for å godkjenne bruker
  const godkjennBruker = (brukerId) => {
    const oppdatertBrukere = brukere.map(bruker => {
      if (bruker.id === brukerId) {
        return { ...bruker, godkjent: true };
      }
      return bruker;
    });
    
    setBrukere(oppdatertBrukere);
    localStorage.setItem('brukere', JSON.stringify(oppdatertBrukere));
  };
  
  // Funksjon for å legge til ny artikkel
  const handleNyArtikkel = (nyArtikkel) => {
    const oppdatertArtikler = [...artikler, nyArtikkel];
    setArtikler(oppdatertArtikler);
    localStorage.setItem('artikler', JSON.stringify(oppdatertArtikler));
  };
  
  // Funksjon for å slette artikkel
  const handleSlettArtikkel = (artikkelId) => {
    const oppdatertArtikler = artikler.filter(artikkel => artikkel.id !== artikkelId);
    setArtikler(oppdatertArtikler);
    localStorage.setItem('artikler', JSON.stringify(oppdatertArtikler));
  };
  
  // Funksjon for å redigere artikkel
  const handleRedigerArtikkel = (artikkelId, oppdatertArtikkel) => {
    const oppdatertArtikler = artikler.map(artikkel => 
      artikkel.id === artikkelId ? { ...artikkel, ...oppdatertArtikkel } : artikkel
    );
    setArtikler(oppdatertArtikler);
    localStorage.setItem('artikler', JSON.stringify(oppdatertArtikler));
  };
  
  // Funksjon for å oppdatere artikkel
  const handleOppdaterArtikkel = (oppdatertArtikkel) => {
    const oppdatertArtikler = artikler.map(artikkel => 
      artikkel.id === oppdatertArtikkel.id ? oppdatertArtikkel : artikkel
    );
    setArtikler(oppdatertArtikler);
    localStorage.setItem('artikler', JSON.stringify(oppdatertArtikler));
  };
  
  return (
    <LanguageProvider>
      <Router>
        <div className="app-container">
          <Header 
            isAuthenticated={innloggetBruker !== null} 
            currentUser={innloggetBruker} 
            onLogout={handleLogout}
          />
          
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Hjem artikler={artikler.filter(a => a.godkjent)} />} />
              <Route path="/om-oss" element={<OmOss jobbliste={jobbliste} />} />
              <Route 
                path="/innlogging" 
                element={
                  <Innlogging 
                    onLogin={handleLogin} 
                    userIsAuthenticated={innloggetBruker !== null}
                    brukere={brukere}
                  />
                } 
              />
              <Route 
                path="/registrering" 
                element={
                  <Registrering 
                    onRegistrer={registrerBruker}
                  />
                } 
              />
              <Route 
                path="/ny-artikkel" 
                element={
                  innloggetBruker ? 
                    <NyArtikkel 
                      onSubmit={handleNyArtikkel} 
                      currentUser={innloggetBruker}
                      kategoriliste={kategoriliste}
                    /> : 
                    <Innlogging 
                      onLogin={handleLogin} 
                      userIsAuthenticated={innloggetBruker !== null}
                      brukere={brukere}
                    />
                } 
              />
              <Route 
                path="/mine-artikler" 
                element={
                  innloggetBruker ? 
                    <MineArtikler 
                      artikler={artikler} 
                      currentUser={innloggetBruker}
                      onDelete={handleSlettArtikkel}
                      onEdit={handleRedigerArtikkel}
                      kategoriliste={kategoriliste}
                    /> : 
                    <Innlogging 
                      onLogin={handleLogin} 
                      userIsAuthenticated={innloggetBruker !== null}
                      brukere={brukere}
                    />
                }
              />
              <Route 
                path="/admin" 
                element={
                  innloggetBruker && innloggetBruker.rolle === 'admin' ? 
                    <AdminPanel 
                      brukere={brukere}
                      artikler={artikler}
                      onOppdaterArtikkel={handleOppdaterArtikkel}
                      onGodkjennBruker={godkjennBruker}
                      onOppdaterBruker={oppdaterBruker}
                      onSlettBruker={slettBruker}
                      kategoriliste={kategoriliste}
                      setKategoriliste={setKategoriliste}
                      jobbliste={jobbliste}
                      setJobbliste={setJobbliste}
                    /> : 
                    <Innlogging 
                      onLogin={handleLogin} 
                      userIsAuthenticated={innloggetBruker !== null}
                      brukere={brukere}
                    />
                }
              />
              <Route 
                path="/artikkel/:id" 
                element={<ArtikkelVisning artikler={artikler} />} 
              />
            </Routes>
          </main>
          
          <Footer />
          
          {/* Vis CacheMonitor kun i utviklermodus */}
          {process.env.NODE_ENV === 'development' && <CacheMonitor />}
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;