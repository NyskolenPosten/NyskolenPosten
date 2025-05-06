// components/NyArtikkel.js
import React, { useState, useEffect } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabase';
import { Editor } from 'react-simple-wysiwyg';
import './NyArtikkel.css';

function NyArtikkel({ innloggetBruker, onLeggTilArtikkel, kategoriliste = [] }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tittel, setTittel] = useState('');
  const [ingress, setIngress] = useState('');
  const [innhold, setInnhold] = useState('');
  const [kategori, setKategori] = useState('nyheter');
  const [bildeForhåndsvisning, setBildeForhåndsvisning] = useState(null);
  const [bildeData, setBildeData] = useState(null);
  const [melding, setMelding] = useState('');
  const [feilmelding, setFeilmelding] = useState('');
  const [redirect, setRedirect] = useState(false);
  const [artikkelID, setArtikkelID] = useState(null);
  const [laster, setLaster] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Håndterer endringer i editor-innhold
  const handleInnholdEndring = (e) => {
    setInnhold(e.target.value);
    if (e.target.value.trim()) {
      setFeilmelding('');
    }
  };

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
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      if (!tittel || !ingress || !innhold || !kategori) {
        setError('Alle felt må fylles ut');
        setIsSubmitting(false);
        return;
      }

      const nyArtikkel = {
        tittel,
        ingress,
        innhold,
        kategori,
        forfatter: user.email,
        godkjent: false,
        opprettet: new Date().toISOString(),
        sist_endret: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('artikler')
        .insert([nyArtikkel])
        .select();

      if (error) throw error;

      if (onLeggTilArtikkel) {
        onLeggTilArtikkel(data[0]);
      }

      setSuccess('Artikkelen ble lagret og venter på godkjenning');
      setTittel('');
      setIngress('');
      setInnhold('');
      setKategori('nyheter');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Redirect til artikkelen
  if (redirect && artikkelID) {
    return <Navigate to={`/artikkel/${artikkelID}`} replace />;
  }

  return (
    <div className="ny-artikkel">
      <h2>Skriv ny artikkel</h2>
      
      {error && <div className="feilmelding">{error}</div>}
      {success && <div className="melding">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-gruppe">
          <label htmlFor="tittel">Tittel:</label>
          <input
            type="text"
            id="tittel"
            value={tittel}
            onChange={(e) => setTittel(e.target.value)}
            required
            disabled={laster}
          />
        </div>

        <div className="form-gruppe">
          <label htmlFor="kategori">Kategori:</label>
          <select
            id="kategori"
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
            required
            disabled={laster}
          >
            {kategoriliste.map((kat) => (
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
            required
            disabled={laster}
          />
        </div>

        <div className="form-gruppe">
          <label htmlFor="innhold">Innhold:</label>
          <Editor
            value={innhold}
            onChange={handleInnholdEndring}
            containerProps={{ style: { minHeight: '300px' } }}
          />
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
              <button type="button" onClick={fjernBilde} disabled={laster}>
                Fjern bilde
              </button>
            </div>
          )}
        </div>

        <button type="submit" disabled={laster || isSubmitting}>
          {isSubmitting ? 'Lagrer...' : 'Publiser artikkel'}
        </button>
      </form>
    </div>
  );
}

export default NyArtikkel; 