// components/ArtikkelVisning.js
import React, { useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import './ArtikkelVisning.css';

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

function ArtikkelVisning({ artikler = [], innloggetBruker }) {
  const { artikkelID } = useParams();
  
  useEffect(() => {
    // Scroll til toppen når komponenten lastes
    window.scrollTo(0, 0);
    
    // Legg til en liten forsinkelse for fade-in animasjon
    const timer = setTimeout(() => {
      const artikkelElement = document.querySelector('.artikkel-visning');
      if (artikkelElement) {
        artikkelElement.style.opacity = '1';
        artikkelElement.style.transform = 'translateY(0)';
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [artikkelID]);
  
  // Finn artikkel basert på ID
  const artikkel = artikler.find(a => a.artikkelID === artikkelID);
  
  // Hvis artikkelen ikke finnes, redirect til forsiden
  if (!artikkel) {
    return <Navigate to="/" replace />;
  }
  
  // Hvis artikkelen ikke er godkjent og brukeren ikke er admin eller forfatter, redirect til forsiden
  if (!artikkel.godkjent && 
      (!innloggetBruker || 
       (innloggetBruker.rolle !== 'admin' && 
        innloggetBruker.id !== artikkel.forfatterID))) {
    return <Navigate to="/" replace />;
  }
  
  // Formater dato
  const formatertDato = new Date(artikkel.dato).toLocaleDateString('no-NO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Konverter markdown til HTML
  const formatertInnhold = konverterMarkdown(artikkel.innhold);

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
            <span className="artikkel-forfatter">Av {artikkel.forfatter}</span>
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
        
        {innloggetBruker && (
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
        )}
      </div>
    </div>
  );
}

export default ArtikkelVisning; 