import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  const år = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-innhold">
        <div className="footer-info">
          <p>&copy; {år} Nyskolen Posten - Elevdrevet avis for Nyskolen i Oslo</p>
          <p>Kontakt: <a href="mailto:redaksjonenyskolenposten@nionett.no">redaksjonenyskolenposten@nionett.no</a></p>
        </div>
        
        <div className="footer-lenker">
          <Link to="/om-oss">Om oss</Link>
          <Link to="/innlogging">Logg inn</Link>
          <Link to="/registrering">Bli journalist</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 