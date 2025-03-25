// components/NyArtikkel.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './NyArtikkel.css';

function NyArtikkel({ leggTilArtikkel }) {
  const navigate = useNavigate();
  const [tittel, setTittel] = useState('');
  const [ingress, setIngress] = useState('');
  const [innhold, setInnhold] = useState('');
  const [kategori, setKategori] = useState('Nyheter');
  const [bilde, setBilde] = useState(null);
  const [feilmelding, setFeilmelding] = useState('');
  const [bildeForhåndsvisning, setBildeForhåndsvisning] = useState(null);
  
  const kategorier = [
    'Nyheter', 
    'Saksmøtet', 
    'Meninger', 
    'Intervjuer',
    'Kultur',
    'Sport',
    'Heureka-prosjekter',
    'Kreativt hjørne'
  ];
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validering
    if (!tittel) {
      setFeilmelding('Du må skrive en tittel');
      return;
    }
    
    if (!innhold) {
      setFeilmelding('Du må skrive innhold i artikkelen');
      return;
    }
    
    // Hvis ingress ikke er fylt ut, lager vi en automatisk basert på første setning eller to
    const automatiskIngress = !ingress 
      ? innhold.split('.').slice(0, 1).join('.') + '.'
      : ingress;
    
    // Oppretter artikkelobjektet
    const nyArtikkel = {
      tittel,
      ingress: automatiskIngress,
      innhold,
      kategori,
      bilde: bildeForhåndsvisning // I en virkelig app ville vi lastet opp bildet til en server
    };
    
    // Sender til App-komponenten for lagring
    const artikkelID = leggTilArtikkel(nyArtikkel);
    
    if (!artikkelID) {
      setFeilmelding('Du må være godkjent for å skrive artikler');
      return;
    }
    
    // Nullstiller skjemaet
    setTittel('');
    setIngress('');
    setInnhold('');
    setKategori('Nyheter');
    setBilde(null);
    setBildeForhåndsvisning(null);
    
    // Navigerer til visning av den nye artikkelen
    navigate(`/artikkel/${artikkelID}`);
  };
  
  // Håndterer opplasting av bilde
  const handleBildeEndring = (e) => {
    const fil = e.target.files[0];
    if (fil) {
      setBilde(fil);
      
      // Lager en URL for forhåndsvisning av bildet
      const leser = new FileReader();
      leser.onloadend = () => {
        setBildeForhåndsvisning(leser.result);
      };
      leser.readAsDataURL(fil);
    }
  };
  
  return (
    <div className="ny-artikkel">
      <h2>Skriv ny artikkel til Nyskolen Posten</h2>
      
      {feilmelding && <div className="feilmelding">{feilmelding}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-gruppe">
          <label htmlFor="tittel">Tittel: <span className="obligatorisk">*</span></label>
          <input 
            type="text"
            id="tittel"
            value={tittel}
            onChange={(e) => setTittel(e.target.value)}
            placeholder="Skriv en fengende tittel"
            className="tittel-input"
          />
        </div>
        
        <div className="form-rad">
          <div className="form-gruppe kategori-gruppe">
            <label htmlFor="kategori">Kategori:</label>
            <select 
              id="kategori"
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
            >
              {kategorier.map(kat => (
                <option key={kat} value={kat}>{kat}</option>
              ))}
            </select>
          </div>
          
          <div className="form-gruppe bilde-gruppe">
            <label htmlFor="bilde">Legg til bilde (valgfritt):</label>
            <input 
              type="file"
              id="bilde"
              onChange={handleBildeEndring}
              accept="image/*"
              className="bilde-input"
            />
          </div>
        </div>
        
        {bildeForhåndsvisning && (
          <div className="bilde-forhåndsvisning">
            <img src={bildeForhåndsvisning} alt="Forhåndsvisning" />
            <button 
              type="button" 
              className="fjern-bilde" 
              onClick={() => {
                setBilde(null);
                setBildeForhåndsvisning(null);
              }}
            >
              Fjern bilde
            </button>
          </div>
        )}
        
        <div className="form-gruppe">
          <label htmlFor="ingress">Ingress (valgfritt):</label>
          <textarea 
            id="ingress"
            value={ingress}
            onChange={(e) => setIngress(e.target.value)}
            placeholder="Skriv en kort ingress eller la være - vi lager en automatisk"
            rows="2"
          />
        </div>
        
        <div className="form-gruppe">
          <label htmlFor="innhold">Artikkelinnhold: <span className="obligatorisk">*</span></label>
          <textarea 
            id="innhold"
            value={innhold}
            onChange={(e) => setInnhold(e.target.value)}
            placeholder="Skriv hele artikkelen her. Du kan bruke enkel formatering: **fet tekst**, *kursiv tekst*, ### overskrift"
            rows="15"
            className="innhold-input"
          />
        </div>
        
        <div className="info-boks">
          <h4>Tips for å skrive en god artikkel:</h4>
          <ul>
            <li>Hold det enkelt og forståelig</li>
            <li>Skriv det viktigste først</li>
            <li>Del opp teksten i avsnitt</li>
            <li>Du kan bruke enkel formatering:
              <ul>
                <li><code>**tekst**</code> for <strong>fet tekst</strong></li>
                <li><code>*tekst*</code> for <em>kursiv tekst</em></li>
                <li><code>### Overskrift</code> for overskrifter</li>
              </ul>
            </li>
          </ul>
        </div>
        
        <div className="form-knapper">
          <button type="submit" className="send-inn-knapp">Send inn artikkel</button>
          <button 
            type="button" 
            className="avbryt-knapp"
            onClick={() => navigate('/')}
          >
            Avbryt
          </button>
        </div>
      </form>
    </div>
  );
}

export default NyArtikkel; 