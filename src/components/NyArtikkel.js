// components/NyArtikkel.js
import React, { useState, useRef, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './NyArtikkel.css';

function NyArtikkel({ innloggetBruker, onLeggTilArtikkel, kategoriliste = [] }) {
  const [tittel, setTittel] = useState('');
  const [ingress, setIngress] = useState('');
  const [innhold, setInnhold] = useState('');
  const [kategori, setKategori] = useState('');
  const [bildeForhåndsvisning, setBildeForhåndsvisning] = useState(null);
  const [bildeData, setBildeData] = useState(null);
  const [melding, setMelding] = useState('');
  const [feilmelding, setFeilmelding] = useState('');
  const [redirect, setRedirect] = useState(false);
  const [artikkelID, setArtikkelID] = useState(null);
  const [laster, setLaster] = useState(false);
  const [editorFeil, setEditorFeil] = useState(null);

  // Forenklet Quill-konfigurasjon
  const modules = {
    toolbar: [
      [{ 'header': '1' }, { 'header': '2' }],
      ['bold', 'italic'],
      [{ 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ]
  };

  const formats = [
    'header',
    'bold', 'italic',
    'list', 'bullet',
    'link', 'image'
  ];

  // Enkel bildehåndtering
  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      
      // Legg til bildehåndtering
      const toolbar = quill.getModule('toolbar');
      toolbar.addHandler('image', () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = () => {
          const file = input.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const range = quill.getSelection(true);
              quill.insertEmbed(range.index, 'image', e.target.result);
            };
            reader.readAsDataURL(file);
          }
        };
      });

      // Observer for bildestørrelser
      const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            if (node.tagName === 'IMG') {
              node.style.maxWidth = '100%';
              node.style.height = 'auto';
              node.style.display = 'block';
              node.style.margin = '1rem auto';
            }
          });
        });
      });

      observer.observe(quill.root, {
        childList: true,
        subtree: true
      });

      return () => observer.disconnect();
    }
  }, []);

  // Håndterer endringer i editor-innhold
  const handleInnholdEndring = (content) => {
    setInnhold(content);
    if (content.trim()) {
      setFeilmelding('');
    }
  };

  // Håndterer feil i Quill editor
  useEffect(() => {
    const handleEditorError = (error) => {
      console.error('Quill editor feil:', error);
      setEditorFeil('Det oppstod en feil i editoren. Vennligst kontakt teknisk leder: mattis.tollefsen@nionett.no');
    };

    window.addEventListener('error', handleEditorError);
    return () => window.removeEventListener('error', handleEditorError);
  }, []);

  // Sjekk om brukeren er logget inn
  if (!innloggetBruker) {
    return (
      <div className="ikke-godkjent">
        <h2>Du må være logget inn</h2>
        <p>Du må logge inn for å skrive artikler.</p>
        <Link to="/login">Logg inn</Link>
      </div>
    );
  }

  // Sjekk om brukeren er godkjent
  if (!innloggetBruker.godkjent) {
    return (
      <div className="ikke-godkjent">
        <h2>Venter på godkjenning</h2>
        <p>Kontoen din må godkjennes av en administrator før du kan skrive artikler.</p>
      </div>
    );
  }

  // Håndterer opplasting av bilde
  const handleBildeEndring = (e) => {
    const fil = e.target.files[0];
    if (fil) {
      const leser = new FileReader();
      leser.onloadend = () => {
        setBildeForhåndsvisning(leser.result);
        setBildeData(leser.result);
      };
      leser.readAsDataURL(fil);
    }
  };

  // Fjerner bilde
  const fjernBilde = () => {
    setBildeForhåndsvisning(null);
    setBildeData(null);
  };

  // Håndterer innsending av skjema
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validering
    if (!tittel.trim() || !innhold.trim() || !kategori) {
      setFeilmelding('Alle påkrevde feltene må fylles ut');
      return;
    }
    
    setLaster(true);
    setFeilmelding('');
    setMelding('');
    
    // Hvis ingress ikke er fylt ut, lager vi en automatisk basert på første setning
    const automatiskIngress = !ingress.trim() 
      ? innhold.split('.')[0] + '.' 
      : ingress;
    
    // Opprett artikkel-objekt
    const nyArtikkel = {
      tittel,
      ingress: automatiskIngress,
      innhold,
      kategori,
      bilde: bildeData
    };
    
    try {
      // Legg til artikkel
      const id = await onLeggTilArtikkel(nyArtikkel, bildeData);
      
      if (id) {
        // Sjekk om brukeren er admin, redaktør eller teknisk leder
        const erGodkjentRolle = innloggetBruker.rolle === 'admin' || 
                               innloggetBruker.rolle === 'redaktør' ||
                               innloggetBruker.rolle === 'teknisk_leder';
        
        setMelding('Artikkel opprettet! ' + (erGodkjentRolle ? 'Artikkelen er publisert.' : 'Artikkelen venter på godkjenning.'));
        setArtikkelID(id);
        
        // Tøm skjema
        setTittel('');
        setIngress('');
        setInnhold('');
        setKategori('');
        setBildeForhåndsvisning(null);
        setBildeData(null);
        
        // Redirect etter 2 sekunder
        setTimeout(() => {
          setRedirect(true);
        }, 2000);
      } else {
        setFeilmelding('Noe gikk galt ved oppretting av artikkel');
      }
    } catch (error) {
      console.error("Feil ved oppretting av artikkel:", error);
      setFeilmelding('En feil oppstod: ' + (error.message || 'Ukjent feil'));
    } finally {
      setLaster(false);
    }
  };
  
  // Redirect til artikkelen
  if (redirect && artikkelID) {
    return <Navigate to={`/artikkel/${artikkelID}`} replace />;
  }

  return (
    <div className="ny-artikkel">
      <h2>Skriv ny artikkel</h2>
      
      {editorFeil && (
        <div className="editor-feil">
          <p>{editorFeil}</p>
        </div>
      )}
      
      {melding && <div className="melding-boks">{melding}</div>}
      {feilmelding && <div className="feilmelding">{feilmelding}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-gruppe">
          <label htmlFor="tittel">Tittel: <span className="obligatorisk">*</span></label>
          <input 
            type="text" 
            id="tittel" 
            value={tittel} 
            onChange={(e) => setTittel(e.target.value)} 
            required 
            placeholder="Skriv en kort og fengende tittel"
            disabled={laster}
          />
        </div>
        
        <div className="form-gruppe">
          <label htmlFor="kategori">Kategori: <span className="obligatorisk">*</span></label>
          <select 
            id="kategori" 
            value={kategori} 
            onChange={(e) => setKategori(e.target.value)} 
            required
            disabled={laster}
          >
            <option value="">Velg kategori</option>
            {kategoriliste.map(kat => (
              <option key={kat.id} value={kat.kategori}>
                {kat.kategori}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-gruppe">
          <label htmlFor="ingress">Ingress:</label>
          <textarea 
            id="ingress" 
            value={ingress} 
            onChange={(e) => setIngress(e.target.value)} 
            placeholder="Skriv en kort introduksjon (valgfritt - lages automatisk hvis tom)"
            disabled={laster}
          />
        </div>
        
        <div className="form-gruppe">
          <label>Innhold: <span className="obligatorisk">*</span></label>
          <div className="quill-container">
            <ReactQuill
              ref={quillRef}
              value={innhold}
              onChange={handleInnholdEndring}
              modules={modules}
              formats={formats}
              className="quill-editor"
              theme="snow"
              placeholder="Skriv artikkelteksten her..."
            />
          </div>
        </div>
        
        <div className="form-gruppe">
          <label htmlFor="bilde">Bilde:</label>
          <input 
            type="file" 
            id="bilde" 
            accept="image/*" 
            onChange={handleBildeEndring} 
            disabled={laster}
          />
          
          {bildeForhåndsvisning && (
            <div className="bilde-forhåndsvisning">
              <img src={bildeForhåndsvisning} alt="Forhåndsvisning" />
              <button type="button" onClick={fjernBilde} className="fjern-bilde" disabled={laster}>
                Fjern bilde
              </button>
            </div>
          )}
        </div>
        
        <div className="form-gruppe info-boks">
          <h4>Tips for formatering:</h4>
          <ul>
            <li>Bruk <strong>Overskrift 1</strong> for hovedoverskrifter</li>
            <li>Bruk <strong>Overskrift 2</strong> for underoverskrifter</li>
            <li>Marker tekst og klikk på <strong>B</strong> for fet tekst</li>
            <li>Bruk punktliste for å liste opp ting</li>
            <li>Last opp bilder ved å klikke på bildeknappen</li>
          </ul>
        </div>
        
        <button type="submit" className="send-knapp" disabled={laster}>
          {laster ? 'Sender inn...' : 'Send inn artikkel'}
        </button>
      </form>
    </div>
  );
}

export default NyArtikkel; 