// components/ArtikkelVisning.js
import React, { useState, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import './ArtikkelVisning.css';
import { hentArtikkel } from '../services/artikkelService';
import { tabellCache, TABELL } from '../utils/directCache';

// Enkel funksjon for å konvertere markdown til HTML
const konverterMarkdown = (tekst) => {
  if (!tekst) return '';
  
  // Konverter overskrifter (### Overskrift)
  let formatertTekst = tekst.replace(/### (.*?)(\n|$)/g, '<h3>$1</h3>');
  
  // Konverter fet tekst (**tekst**)
  formatertTekst = formatertTekst.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Konverter kursiv tekst (*tekst*)
  formatertTekst = formatertTekst.replace(/\*([^\*]+)\*/g, '<em>$1</em>');
  
  // Konverter linjeskift til paragrafer
  formatertTekst = formatertTekst
    .split('\n\n')
    .map(avsnitt => avsnitt.trim() ? `<p>${avsnitt}</p>` : '')
    .join('');
  
  return formatertTekst;
};

function ArtikkelVisning({ artikler = [], innloggetBruker, onSlettArtikkel, onRedigerArtikkel }) {
  const { id } = useParams();
  const [artikkel, setArtikkel] = useState(null);
  const [laster, setLaster] = useState(true);
  const [feilmelding, setFeilmelding] = useState('');
  const [bekreftSletting, setBekreftSletting] = useState(false);
  const [erRedigering, setErRedigering] = useState(false);
  const [erSletting, setErSletting] = useState(false);
  
  useEffect(() => {
    // Scroll til toppen når komponenten lastes
    window.scrollTo(0, 0);
    
    // Hent artikkel fra API eller cache
    const hentArtikkelData = async () => {
      try {
        setLaster(true);
        // Prøv først å finne artikkel i props
        const artikkelFraProps = artikler.find(a => a.artikkelID === id);
        
        if (artikkelFraProps) {
          setArtikkel(artikkelFraProps);
        } else {
          // Sjekk først om artikkelen finnes i direktecache for umiddelbar respons
          const cachedArtikkel = tabellCache.hentTabell(TABELL.ARTIKKEL(id));
          if (cachedArtikkel && cachedArtikkel.success && cachedArtikkel.artikkel) {
            setArtikkel(cachedArtikkel.artikkel);
          } else {
            // Hvis ikke i cache, last fra service
            const resultat = await hentArtikkel(id);
            if (resultat.success) {
              setArtikkel(resultat.artikkel);
            } else {
              setFeilmelding('Kunne ikke finne artikkelen');
            }
          }
        }
      } catch (error) {
        console.error("Feil ved henting av artikkel:", error);
        setFeilmelding('En feil oppstod ved henting av artikkelen.');
      } finally {
        setLaster(false);
        
        // Legg til en liten forsinkelse for fade-in animasjon
        setTimeout(() => {
          const artikkelElement = document.querySelector('.artikkel-visning');
          if (artikkelElement) {
            artikkelElement.style.opacity = '1';
            artikkelElement.style.transform = 'translateY(0)';
          }
        }, 100);
      }
    };
    
    hentArtikkelData();
  }, [id, artikler]);
  
  // Håndterer sletting av artikkel
  const handleSlettArtikkel = async () => {
    if (bekreftSletting) {
      try {
        const resultat = await onSlettArtikkel(artikkel.artikkelID);
        if (resultat) {
          // Redirect til forsiden etter sletting
          return <Navigate to="/" replace />;
        } else {
          setFeilmelding('Kunne ikke slette artikkelen');
        }
      } catch (error) {
        console.error("Feil ved sletting av artikkel:", error);
        setFeilmelding('En feil oppstod ved sletting av artikkelen');
      }
      setBekreftSletting(false);
    } else {
      setBekreftSletting(true);
    }
  };
  
  // Hvis den fortsatt laster, vis spinner
  if (laster) {
    return (
      <div className="laster-container">
        <div className="laster-spinner"></div>
        <p>Laster artikkel...</p>
      </div>
    );
  }
  
  // Hvis det er en feilmelding, vis den
  if (feilmelding) {
    return (
      <div className="feilmelding-container">
        <h2>Noe gikk galt</h2>
        <p>{feilmelding}</p>
        <div className="teknisk-stotte">
          <p>Fant du en feil/bug? Kontakt teknisk leder i NyskolenPosten: <a href="mailto:mattis.tollefsen@nionett.no">mattis.tollefsen@nionett.no</a></p>
          <p>Jeg fikser det så fort som mulig!</p>
        </div>
        <Link to="/" className="tilbake-lenke">
          &larr; Tilbake til forsiden
        </Link>
      </div>
    );
  }
  
  // Sjekk om artikkelen finnes
  if (!artikkel) {
    return (
      <div className="ikke-godkjent">
        <h2>Artikkel ikke funnet</h2>
        <p>Artikkelen du leter etter finnes ikke.</p>
        <Link to="/">Tilbake til forsiden</Link>
      </div>
    );
  }

  // Sjekk om brukeren har tilgang til å redigere
  if (erRedigering && (!innloggetBruker || innloggetBruker.id !== artikkel.forfatterID)) {
    return (
      <div className="ikke-godkjent">
        <h2>Tilgang nektet</h2>
        <p>Du har ikke tilgang til å redigere denne artikkelen.</p>
        <Link to={`/artikkel/${id}`}>Se artikkel</Link>
      </div>
    );
  }

  // Sjekk om brukeren har tilgang til å slette
  if (erSletting && (!innloggetBruker || innloggetBruker.id !== artikkel.forfatterID)) {
    return (
      <div className="ikke-godkjent">
        <h2>Tilgang nektet</h2>
        <p>Du har ikke tilgang til å slette denne artikkelen.</p>
        <Link to={`/artikkel/${id}`}>Se artikkel</Link>
      </div>
    );
  }
  
  // Formater dato
  const formatertDato = artikkel.dato ? 
    new Date(artikkel.dato).toLocaleDateString('no-NO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : 'Ukjent dato';
  
  // Konverter markdown til HTML
  const formatertInnhold = konverterMarkdown(artikkel.innhold);
  
  // Sjekk om brukeren har rettigheter til å redigere eller slette
  const kanRedigere = innloggetBruker && 
                     (innloggetBruker.rolle === 'admin' || 
                      innloggetBruker.rolle === 'redaktør' ||
                      innloggetBruker.rolle === 'teknisk_leder' ||
                      innloggetBruker.id === artikkel.forfatterID);

  return (
    <div className="artikkel-visning" style={{ opacity: 0, transform: 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}>
      {!artikkel.godkjent && (
        <div className="ikke-godkjent-advarsel">
          Denne artikkelen er ikke godkjent ennå og er kun synlig for deg og redaktører.
        </div>
      )}
      
      <article className="artikkel">
        <header className="artikkel-header">
          <h1 className="artikkel-tittel">{artikkel.tittel}</h1>
          
          <div className="artikkel-meta">
            <span className="artikkel-forfatter">Av {artikkel.forfatterNavn || 'Ukjent forfatter'}</span>
            <span className="artikkel-dato">Publisert {formatertDato}</span>
            <span className="artikkel-kategori">{artikkel.kategori}</span>
          </div>
        </header>
        
        {artikkel.bilde && (
          <div className="artikkel-bilde">
            <img src={artikkel.bilde} alt={artikkel.tittel} />
          </div>
        )}
        
        <div className="artikkel-ingress">
          {artikkel.ingress}
        </div>
        
        <div 
          className="artikkel-innhold"
          dangerouslySetInnerHTML={{ __html: formatertInnhold }}
        />
      </article>
      
      <div className="artikkel-navigasjon">
        <Link to="/" className="tilbake-lenke">
          &larr; Tilbake til forsiden
        </Link>
        
        {kanRedigere && (
          <div className="administrer-knapper">
            <button 
              className="rediger-knapp"
              onClick={() => onRedigerArtikkel(artikkel.artikkelID)}
            >
              Rediger artikkel
            </button>
            
            <button 
              className={`slett-knapp ${bekreftSletting ? 'bekreft-slett' : ''}`}
              onClick={handleSlettArtikkel}
            >
              {bekreftSletting ? 'Bekreft sletting' : 'Slett artikkel'}
            </button>
            
            {bekreftSletting && (
              <button 
                className="avbryt-knapp"
                onClick={() => setBekreftSletting(false)}
              >
                Avbryt
              </button>
            )}
          </div>
        )}
        
        <div className="deling-knapper">
          <button 
            className="del-knapp" 
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: artikkel.tittel,
                  text: artikkel.ingress,
                  url: window.location.href,
                })
                .catch((error) => console.log('Kunne ikke dele', error));
              } else {
                navigator.clipboard.writeText(window.location.href)
                  .then(() => alert('Lenke kopiert til utklippstavlen!'))
                  .catch(() => alert('Kunne ikke kopiere lenken'));
              }
            }}
          >
            Del artikkel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ArtikkelVisning; 