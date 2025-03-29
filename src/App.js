// App.js - Hovedkomponenten for Nyskolen Posten
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Hjem from './components/Hjem';
import OmOss from './components/OmOss';
import NyArtikkel from './components/NyArtikkel';
import ArtikkelVisning from './components/ArtikkelVisning';
import MineArtikler from './components/MineArtikler';
import AdminPanel from './components/AdminPanel';
import WebsitePanel from './components/WebsitePanel';
import Footer from './components/Footer';
import Header from './components/Header';
import Innlogging from './components/Innlogging';
import Registrering from './components/Registrering';
import CacheMonitor from './components/CacheMonitor';
import { LanguageProvider } from './utils/LanguageContext';
import { AuthProvider } from './utils/AuthContext';
import Profil from './components/Profil';
import { loggUt, hentAlleBrukere } from './services/authService';
import { 
  leggTilArtikkel, 
  hentAlleArtikler, 
  slettArtikkel as slettArtikkelService,
  oppdaterArtikkel as oppdaterArtikkelService,
  godkjennArtikkel as godkjennArtikkelService 
} from './services/artikkelService';

function App() {
  const [innloggetBruker, setInnloggetBruker] = useState(null);
  const [artikler, setArtikler] = useState([]);
  const [brukere, setBrukere] = useState([]);
  const [jobbliste, setJobbliste] = useState([]);
  const [kategoriliste, setKategoriliste] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [websiteSettings, setWebsiteSettings] = useState(() => {
    return JSON.parse(localStorage.getItem('websiteSettings') || '{"lockdown": false, "fullLockdown": false, "note": ""}');
  });
  
  // Admin e-postliste for automatisk godkjenning og admin-rolle
  const adminEpostliste = ['mattis.tollefsen@nionett.no', 'admin@nyskolen.no'];
  
  // Last inn data fra localStorage ved oppstart
  useEffect(() => {
    // Last inn innlogget bruker
    const lagretBruker = localStorage.getItem('currentUser');
    if (lagretBruker) {
      const brukerObj = JSON.parse(lagretBruker);
      // Hent mer informasjon fra brukere-arrayet
      const brukere = JSON.parse(localStorage.getItem('brukere')) || [];
      const fullBruker = brukere.find(b => b.id === brukerObj.uid);
      if (fullBruker) {
        setInnloggetBruker(fullBruker);
      }
    }
    
    // Last inn artikler
    const lastArtikler = async () => {
      const resultat = await hentAlleArtikler();
      if (resultat.success) {
        setArtikler(resultat.artikler);
      } else {
        console.error("Kunne ikke laste artikler:", resultat.error);
      }
    };
    lastArtikler();
    
    // Last inn brukere
    const lagredeBrukere = localStorage.getItem('brukere');
    if (lagredeBrukere) {
      setBrukere(JSON.parse(lagredeBrukere));
    } else {
      // Opprett admin-bruker hvis ingen brukere finnes
      const adminBruker = {
        id: 'admin-' + Date.now(),
        navn: 'Administrator',
        email: 'admin@nyskolen.no',
        password: 'admin123',
        rolle: 'admin',
        godkjent: true,
        opprettet: new Date().toISOString()
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

    // Last inn websiteSettings
    const lagretSettings = localStorage.getItem('websiteSettings');
    if (lagretSettings) {
      setWebsiteSettings(JSON.parse(lagretSettings));
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Lytter etter endringer i brukerdatabasen
  useEffect(() => {
    const handleStorageChange = async (e) => {
      if (e.key === 'brukere') {
        const result = await hentAlleBrukere();
        if (result.success) {
          setBrukere(result.brukere);
        }
      } else if (e.key === 'artikler') {
        const resultat = await hentAlleArtikler();
        if (resultat.success) {
          setArtikler(resultat.artikler);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  // Lytt etter endringer i websiteSettings
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'websiteSettings') {
        setWebsiteSettings(JSON.parse(e.newValue));
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  // Funksjon for å logge inn
  const handleLogin = (bruker) => {
    setInnloggetBruker(bruker);
  };
  
  // Funksjon for å logge ut
  const handleLogout = async () => {
    await loggUt();
    setInnloggetBruker(null);
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
  const handleNyArtikkel = async (artikkelData) => {
    if (!innloggetBruker) {
      console.error("Bruker må være logget inn for å opprette artikkel");
      return null;
    }
    
    // Legg til forfatterinformasjon
    const kompletArtikkelData = {
      ...artikkelData,
      forfatterID: innloggetBruker.id,
      forfatterNavn: innloggetBruker.navn,
      // Hvis brukeren er admin eller redaktør, godkjenn artikkelen automatisk
      godkjent: innloggetBruker.rolle === 'admin' || innloggetBruker.rolle === 'redaktør'
    };
    
    try {
      // Bruk artikkelService for å legge til artikkelen
      const resultat = await leggTilArtikkel(kompletArtikkelData, artikkelData.bilde);
      
      if (resultat.success) {
        // Oppdater artikler-state
        const oppdatertArtikkelListe = await hentAlleArtikler();
        if (oppdatertArtikkelListe.success) {
          setArtikler(oppdatertArtikkelListe.artikler);
        }
        
        return resultat.artikkelID;
      } else {
        console.error("Kunne ikke legge til artikkel:", resultat.error);
        return null;
      }
    } catch (error) {
      console.error("Feil ved å legge til artikkel:", error);
      return null;
    }
  };
  
  // Funksjon for å slette artikkel
  const handleSlettArtikkel = async (artikkelID) => {
    try {
      const resultat = await slettArtikkelService(artikkelID);
      
      if (resultat.success) {
        // Oppdater artikkellistene
        const oppdatertArtikkelListe = await hentAlleArtikler();
        if (oppdatertArtikkelListe.success) {
          setArtikler(oppdatertArtikkelListe.artikler);
        }
        return true;
      } else {
        console.error("Kunne ikke slette artikkel:", resultat.error);
        return false;
      }
    } catch (error) {
      console.error("Feil ved sletting av artikkel:", error);
      return false;
    }
  };
  
  // Funksjon for å oppdatere artikkel
  const handleOppdaterArtikkel = async (artikkelID, oppdatertData, nyttBilde = null) => {
    try {
      const resultat = await oppdaterArtikkelService(artikkelID, oppdatertData, nyttBilde);
      
      if (resultat.success) {
        // Oppdater artikkellistene
        const oppdatertArtikkelListe = await hentAlleArtikler();
        if (oppdatertArtikkelListe.success) {
          setArtikler(oppdatertArtikkelListe.artikler);
        }
        return true;
      } else {
        console.error("Kunne ikke oppdatere artikkel:", resultat.error);
        return false;
      }
    } catch (error) {
      console.error("Feil ved oppdatering av artikkel:", error);
      return false;
    }
  };
  
  // Funksjon for å godkjenne artikkel
  const handleGodkjennArtikkel = async (artikkelID) => {
    try {
      const resultat = await godkjennArtikkelService(artikkelID);
      
      if (resultat.success) {
        // Oppdater artikkellistene
        const oppdatertArtikkelListe = await hentAlleArtikler();
        if (oppdatertArtikkelListe.success) {
          setArtikler(oppdatertArtikkelListe.artikler);
        }
        return true;
      } else {
        console.error("Kunne ikke godkjenne artikkel:", resultat.error);
        return false;
      }
    } catch (error) {
      console.error("Feil ved godkjenning av artikkel:", error);
      return false;
    }
  };
  
  // Funksjon for å redigere artikkel
  const handleRedigerArtikkel = (artikkelID, oppdatertArtikkel) => {
    return handleOppdaterArtikkel(artikkelID, oppdatertArtikkel);
  };
  
  // Sjekk om nettsiden er i WEBSITE LOCKDOWN modus
  if (websiteSettings.fullLockdown) {
    return (
      <div className="maintenance-mode">
        <div className="maintenance-container">
          <h1>NyskolenPosten er nede for vedlikehold</h1>
          <p>Vi jobber med å forbedre nettsiden og er straks tilbake.</p>
          <p>Beklager ulempene dette medfører.</p>
        </div>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <AuthProvider>
        <Router basename="/NyskolenPosten">
          <div className="app-container">
            {websiteSettings.note && (
              <div className="site-notification">
                <div className="note-content">{websiteSettings.note}</div>
              </div>
            )}
            
            <Header 
              innloggetBruker={innloggetBruker} 
              onLogout={handleLogout}
              isLockdown={websiteSettings.lockdown}
            />
            
            <main className="main-content">
              {!isOnline && (
                <div className="offline-warning">
                  Du er offline. Noen funksjoner kan være begrenset.
                </div>
              )}
              
              <Routes>
                <Route path="/" element={<Hjem artikler={artikler.filter(a => a.godkjent)} />} />
                <Route path="/om-oss" element={<OmOss />} />
                <Route 
                  path="/artikkel/:id" 
                  element={
                    <ArtikkelVisning 
                      artikler={artikler} 
                      innloggetBruker={innloggetBruker} 
                      onSlettArtikkel={handleSlettArtikkel} 
                      onRedigerArtikkel={handleRedigerArtikkel} 
                    />
                  } 
                />

                {/* Ruter som krever innlogging og ikke er påvirket av lockdown */}
                <Route 
                  path="/logg-inn" 
                  element={<Innlogging onLogin={handleLogin} />} 
                />
                <Route 
                  path="/registrer" 
                  element={<Registrering />} 
                />
                <Route 
                  path="/profil" 
                  element={
                    <Profil 
                      innloggetBruker={innloggetBruker} 
                      onOppdaterBruker={oppdaterBruker} 
                    />
                  } 
                />
                
                {/* Ruter som påvirkes av lockdown */}
                {!websiteSettings.lockdown && (
                  <>
                    <Route 
                      path="/ny-artikkel" 
                      element={
                        <NyArtikkel 
                          innloggetBruker={innloggetBruker} 
                          onLeggTilArtikkel={handleNyArtikkel} 
                          kategoriliste={kategoriliste}
                        />
                      } 
                    />
                    <Route 
                      path="/mine-artikler" 
                      element={
                        <MineArtikler 
                          innloggetBruker={innloggetBruker} 
                          artikler={artikler.filter(a => a.forfatterID === innloggetBruker?.id)} 
                          onSlettArtikkel={handleSlettArtikkel} 
                          onOppdaterArtikkel={handleOppdaterArtikkel} 
                        />
                      } 
                    />
                    <Route 
                      path="/admin" 
                      element={
                        <AdminPanel 
                          innloggetBruker={innloggetBruker} 
                          artikler={artikler} 
                          brukere={brukere} 
                          jobbliste={jobbliste} 
                          kategoriliste={kategoriliste}
                          onDeleteArticle={handleSlettArtikkel}
                          onUpdateArticle={handleOppdaterArtikkel}
                          onUpdateUser={oppdaterBruker}
                          onDeleteUser={slettBruker}
                          onApproveArticle={handleGodkjennArtikkel}
                          onUpdateJobbliste={setJobbliste}
                          onUpdateKategoriliste={setKategoriliste}
                        />
                      } 
                    />
                  </>
                )}
                
                {/* WebsitePanel, tilgjengelig kun for teknisk leder */}
                <Route 
                  path="/website-panel" 
                  element={
                    <WebsitePanel 
                      innloggetBruker={innloggetBruker} 
                    />
                  } 
                />
                
                {/* Debug-panel for Cache-monitoring */}
                <Route 
                  path="/cache-monitor" 
                  element={<CacheMonitor />} 
                />
              </Routes>
            </main>
            
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;