import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header({ innloggetBruker, onLogout }) {
  return (
    <header className="header">
      <div className="logo-container">
        <Link to="/" className="logo-link">
          <h1>Nyskolen Posten</h1>
        </Link>
        <p className="slogan">Elevdrevet avis for Nyskolen i Oslo</p>
      </div>
      
      <nav className="navigation">
        <Link to="/">Forsiden</Link>
        <Link to="/om-oss">Om oss</Link>
        
        {innloggetBruker ? (
          <>
            <Link to="/ny-artikkel">Skriv artikkel</Link>
            
            {innloggetBruker.rolle === 'admin' && (
              <Link to="/admin">Administrer</Link>
            )}
            
            <button 
              onClick={onLogout} 
              className="logout-button"
            >
              Logg ut ({innloggetBruker.navn})
            </button>
          </>
        ) : (
          <>
            <Link to="/innlogging" className="login-button">Logg inn</Link>
            <Link to="/registrering" className="register-button">Registrer deg</Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header; 