// App.js - Hovedkomponenten for Nyskolen Posten
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import './App.css';
import Hjem from './components/Hjem';
import OmOss from './components/OmOss';
import NyArtikkel from './components/NyArtikkel';
import ArtikkelVisning from './components/ArtikkelVisning';
import MineArtikler from './components/MineArtikler';
import AdminPanel from './components/AdminPanel';
import WebsitePanel from './components/WebsitePanel';
import DataPanel from './components/DataPanel';
import Footer from './components/Footer';
import Header from './components/Header';
import Innlogging from './components/Innlogging';
import Registrering from './components/Registrering';
import CacheMonitor from './components/CacheMonitor';
import { LanguageProvider } from './utils/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Profil from './components/Profil';
import { loggUt, hentAlleBrukere } from './services/authService';
import { autoMigratePasswords } from './utils/migratePasswords';
import { 
  leggTilArtikkel, 
  hentAlleArtikler, 
  slettArtikkel as slettArtikkelService,
  oppdaterArtikkel as oppdaterArtikkelService,
  godkjennArtikkel as godkjennArtikkelService 
} from './services/artikkelService';
import logo from './assets/images/logo.svg';
import LeggTilTekniskLeder from './components/LeggTilTekniskLeder';
import { supabase } from './config/supabase';

// Hjelpefunksjon for å sjekke om vi er på GitHub Pages
const isGitHubPages = window.location.hostname.includes('github.io');

// Hjelpefunksjon for å sjekke om vi kjører lokalt
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Sett basename for router basert på om vi er på GitHub Pages eller ikke
const getBasename = () => {
  if (isGitHubPages) {
    return '/NyskolenPosten';
  }
  return '/';
};

function AppContent() {
  const { user, signOut } = useAuth();
  const [artikler, setArtikler] = useState([]);
  const [brukere, setBrukere] = useState([]);
  const [jobbliste, setJobbliste] = useState([]);
  const [kategoriliste, setKategoriliste] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [websiteSettings, setWebsiteSettings] = useState({
    lockdown: false,
    fullLockdown: false,
    note: ""
  });
  
  // Admin e-postliste for automatisk godkjenning og admin-rolle
  const adminEpostliste = ['mattis.tollefsen@nionett.no', 'admin@nyskolen.no'];
  
  // Hent website-innstillinger fra Supabase
  const hentWebsiteInnstillinger = async () => {
    try {
      // Sjekk først om brukeren er autentisert
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase
        .from('website_settings')
        .select('*')
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // Hvis tabellen er tom, opprett standardinnstillinger
          const { data: newData, error: insertError } = await supabase
            .from('website_settings')
            .insert([{
              lockdown: false,
              full_lockdown: false,
              note: "",
              updated_by: user?.id || null
            }])
            .select()
            .single();
          
          if (insertError) throw insertError;
          
          if (newData) {
            setWebsiteSettings({
              lockdown: newData.lockdown,
              fullLockdown: newData.full_lockdown,
              note: newData.note || ""
            });
          }
        } else {
          throw error;
        }
      } else if (data) {
        setWebsiteSettings({
          lockdown: data.lockdown,
          fullLockdown: data.full_lockdown,
          note: data.note || ""
        });
      }
    } catch (error) {
      console.error('Feil ved henting av website-innstillinger:', error);
      // Bruk standardinnstillinger hvis det oppstår en feil
      setWebsiteSettings({
        lockdown: false,
        fullLockdown: false,
        note: ""
      });
    }
  };

  // Effekt for å laste inn data ved oppstart
  useEffect(() => {
    // Kjør migrering av passord til kryptert format
    autoMigratePasswords();
    
    // Last inn artikler
    const lastArtikler = async () => {
      try {
        console.log("Starter henting av artikler...");
        const resultat = await hentAlleArtikler();
        
        if (resultat.success) {
          console.log(`Lastet ${resultat.artikler?.length || 0} artikler`);
          setArtikler(resultat.artikler || []);
        } else {
          console.error("Kunne ikke laste artikler:", resultat.error);
          
          // Alternativ håndtering: Bruk lokal lagring som fallback
          console.log("Prøver å bruke lokalt lagrede artikler som fallback...");
          const lokaleLagrede = localStorage.getItem('artikler');
          if (lokaleLagrede) {
            try {
              const parsedeArtikler = JSON.parse(lokaleLagrede);
              setArtikler(parsedeArtikler);
              console.log(`Lastet ${parsedeArtikler.length} artikler fra lokal lagring`);
            } catch (parseError) {
              console.error("Kunne ikke parse lokalt lagrede artikler:", parseError);
              setArtikler([]);
            }
          } else {
            console.log("Ingen lokalt lagrede artikler funnet");
            setArtikler([]);
          }
        }
      } catch (error) {
        console.error("Uventet feil ved lasting av artikler:", error);
        setArtikler([]);
      }
    };
    lastArtikler();
    
    // Last inn brukere og kategoriliste
    const lastInnData = () => {
      // Last inn brukere
      const lagredeBrukere = localStorage.getItem('brukere');
      if (lagredeBrukere) {
        setBrukere(JSON.parse(lagredeBrukere));
      } else {
        // Opprett admin-bruker hvis ingen finnes
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

      // Last inn kategoriliste
      const lagretKategoriliste = localStorage.getItem('kategoriliste');
      if (lagretKategoriliste) {
        setKategoriliste(JSON.parse(lagretKategoriliste));
      } else {
        // Opprett standard kategoriliste
        const standardKategoriliste = [
          { id: 'kat-1', kategori: 'Nyheter', ansvarlig: 'Administrator' },
          { id: 'kat-2', kategori: 'Kultur', ansvarlig: 'Administrator' },
          { id: 'kat-3', kategori: 'Sport', ansvarlig: 'Administrator' },
          { id: 'kat-4', kategori: 'Skole', ansvarlig: 'Administrator' },
          { id: 'kat-5', kategori: 'Saksmøtet', ansvarlig: 'Administrator' },
          { id: 'kat-6', kategori: 'Meninger', ansvarlig: 'Administrator' },
          { id: 'kat-7', kategori: 'Heureka', ansvarlig: 'Administrator' },
          { id: 'kat-8', kategori: 'Klassen', ansvarlig: 'Administrator' },
          { id: 'kat-9', kategori: 'Annet', ansvarlig: 'Administrator' }
        ];
        setKategoriliste(standardKategoriliste);
        localStorage.setItem('kategoriliste', JSON.stringify(standardKategoriliste));
      }
    };
    lastInnData();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Effekt for å hente website-innstillinger når brukeren endres
  useEffect(() => {
    if (user) {
      hentWebsiteInnstillinger();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Effekt for å håndtere online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Effekt for å lytte etter endringer i brukerdatabasen
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Effekt for å lytte etter endringer i websiteSettings
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'websiteSettings') {
        setWebsiteSettings(JSON.parse(e.newValue));
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  // Funksjon for å logge ut - bruk AuthContext istedenfor authService
  const handleLogout = async () => {
    try {
      // Bruk signOut fra AuthContext
      await signOut();
      console.log("Du har blitt logget ut");
    } catch (error) {
      console.error("Feil ved utlogging:", error);
    }
  };
  
  // Funksjon for å oppdatere bruker
  const oppdaterBruker = (oppdatertBruker) => {
    const oppdatertBrukere = brukere.map(bruker => 
      bruker.id === oppdatertBruker.id ? oppdatertBruker : bruker
    );
    setBrukere(oppdatertBrukere);
    localStorage.setItem('brukere', JSON.stringify(oppdatertBrukere));
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
    if (!user) {
      console.error("Bruker må være logget inn for å opprette artikkel");
      return null;
    }
    
    // Legg til forfatterinformasjon
    const kompletArtikkelData = {
      ...artikkelData,
      forfatterID: user.id,
      forfatterNavn: user.navn,
      // Hvis brukeren er admin, redaktør eller teknisk leder, godkjenn artikkelen automatisk
      godkjent: user.rolle === 'admin' || 
                user.rolle === 'redaktør' || 
                user.rolle === 'teknisk_leder'
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
  
  // Funksjon for å endre rolle for en bruker i jobblisten
  const handleEndreRolleBruker = (jobbId, nyRolle) => {
    try {
      // Finn jobben i jobblisten
      const oppdatertJobbliste = jobbliste.map(jobb => {
        if (jobb.id === jobbId) {
          return { ...jobb, rolle: nyRolle };
        }
        return jobb;
      });
      
      // Oppdater jobblisten
      setJobbliste(oppdatertJobbliste);
      
      // Lagre i localStorage
      localStorage.setItem('jobbliste', JSON.stringify(oppdatertJobbliste));
      
      // Synkroniser også med brukerens rolle hvis mulig
      const jobb = jobbliste.find(j => j.id === jobbId);
      if (jobb) {
        const bruker = brukere.find(b => b.navn === jobb.navn);
        if (bruker) {
          // Mappingen mellom jobbliste-rolle og bruker-rolle
          const brukerRolle = nyRolle === 'Redaktør' ? 'redaktør' : 
                            nyRolle === 'Teknisk leder' ? 'teknisk_leder' : 
                            nyRolle === 'Administrator' ? 'admin' : 'skribent';
          
          // Oppdater brukerens rolle
          const oppdatertBruker = { ...bruker, rolle: brukerRolle };
          oppdaterBruker(oppdatertBruker);
        }
      }
      
      return true;
    } catch (error) {
      console.error("Feil ved endring av rolle:", error);
      return false;
    }
  };
  
  // Funksjon for å redigere artikkel
  const handleRedigerArtikkel = (artikkelID, oppdatertArtikkel) => {
    return handleOppdaterArtikkel(artikkelID, oppdatertArtikkel);
  };
  
  // Håndterer oppdatering av website-innstillinger
  const handleUpdateWebsiteSettings = async (newSettings) => {
    try {
      // Oppdater i Supabase
      const { data, error } = await supabase
        .from('website_settings')
        .upsert([{ ...newSettings, updated_by: user?.id }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Oppdater lokalt state
      setWebsiteSettings(data);
      
      return { success: true };
    } catch (error) {
      console.error('Feil ved oppdatering av website-innstillinger:', error);
      return { success: false, error: error.message };
    }
  };
  
  // Funksjon for å fikse lockdown
  const fixLockdown = () => {
    const passord = prompt('Skriv inn passordet for å fikse lockdown:');
    if (passord === 'Tveita16') {
      setWebsiteSettings({
        lockdown: false,
        fullLockdown: false,
        note: ""
      });
      localStorage.setItem('websiteSettings', JSON.stringify({
        lockdown: false,
        fullLockdown: false,
        note: ""
      }));
      alert('Lockdown er nå deaktivert!');
    } else {
      alert('Feil passord!');
    }
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
    <div className="app-container">
      <Helmet>
        <title>Nyskolen Posten</title>
        <meta name="description" content="Nyskolen Posten - Skoleavisen for Nyskolen i Oslo" />
        <meta name="keywords" content="skoleavis, nyskolen, oslo, elever, artikler" />
        <meta property="og:title" content="Nyskolen Posten" />
        <meta property="og:description" content="Skoleavisen for Nyskolen i Oslo" />
        <meta property="og:type" content="website" />
      </Helmet>
      
      {websiteSettings.note && (
        <div className="site-notification">
          <div className="note-content">{websiteSettings.note}</div>
        </div>
      )}
      
      <Header 
        innloggetBruker={user} 
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
          <Route path="/ny-artikkel" element={
            user ? (
              <NyArtikkel 
                onLeggTilArtikkel={handleNyArtikkel}
              />
            ) : (
              <Navigate to="/" replace />
            )
          } />
          <Route path="/artikkel/:id" element={<ArtikkelVisning artikler={artikler} innloggetBruker={user} onSlettArtikkel={handleSlettArtikkel} onRedigerArtikkel={handleRedigerArtikkel} />} />
          <Route path="/mine-artikler" element={
            <MineArtikler 
              innloggetBruker={user} 
              artikler={artikler.filter(a => a.forfatterID === user?.id)} 
              onSlettArtikkel={handleSlettArtikkel} 
              onOppdaterArtikkel={handleOppdaterArtikkel} 
            />
          } />
          <Route path="/admin" element={
            <AdminPanel 
              innloggetBruker={user} 
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
              onEndreRolleBruker={handleEndreRolleBruker}
            />
          } />
          <Route path="/login" element={<Innlogging />} />
          <Route path="/logg-inn" element={<Innlogging />} />
          <Route path="/register" element={<Registrering />} />
          <Route path="/registrer" element={<Registrering />} />
          <Route path="/profil" element={<Profil innloggetBruker={user} onOppdaterBruker={oppdaterBruker} />} />
          <Route path="/website-panel" element={<WebsitePanel innloggetBruker={user} currentSettings={websiteSettings} onUpdateSettings={handleUpdateWebsiteSettings} />} />
          <Route path="/data-panel" element={<DataPanel innloggetBruker={user} />} />
          <Route path="/cache-monitor" element={<CacheMonitor />} />
          <Route path="*" element={
            <div className="ikke-funnet">
              <h1>Side ikke funnet</h1>
              <p>Beklager, men siden du leter etter finnes ikke.</p>
              <Link to="/" className="tilbake-link">Gå til forsiden</Link>
            </div>
          } />
        </Routes>
      </main>
      
      <Footer />
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <LanguageProvider>
        <AuthProvider>
          <Router basename={getBasename()}>
            <AppContent />
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </HelmetProvider>
  );
}

export default App;