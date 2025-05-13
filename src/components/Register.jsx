import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import './Register.css';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    navn: '',
    klasse: 'Gul' // Standard verdi
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Registrer brukeren med email/passord
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password
      });

      if (authError) throw authError;

      // 2. Legg til brukerinformasjon i brukere-tabellen
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('brukere')
          .insert([
            {
              id: authData.user.id,
              navn: formData.navn,
              klasse: formData.klasse,
              rolle: 'elev' // Standard rolle for nye brukere
            }
          ]);

        if (profileError) throw profileError;
      }

      // 3. Redirect til login-siden eller en "venter på godkjenning"-side
      navigate('/login', { 
        state: { message: 'Registrering vellykket! Logg inn med din konto.' } 
      });
    } catch (error) {
      console.error('Registreringsfeil:', error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h2>Registrer deg</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">E-post:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Passord:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="6"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="navn">Navn:</label>
          <input
            type="text"
            id="navn"
            name="navn"
            value={formData.navn}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="klasse">Klasse:</label>
          <select
            id="klasse"
            name="klasse"
            value={formData.klasse}
            onChange={handleChange}
            required
          >
            <option value="Gul">Gul</option>
            <option value="Rød">Rød</option>
            <option value="Blå">Blå</option>
            <option value="Ungdomstrinnet">Ungdomstrinnet</option>
            <option value="Ansatte">Ansatte</option>
          </select>
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Registrerer...' : 'Registrer'}
        </button>
      </form>
      
      <p>
        Har du allerede en konto? <a href="/login">Logg inn her</a>
      </p>
    </div>
  );
}

export default Register; 