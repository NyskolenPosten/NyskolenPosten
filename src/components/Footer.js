import React from 'react';
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
          <a href="/om-oss">Om oss</a>
          <a href="/innlogging">Logg inn</a>
          <a href="/registrering">Bli journalist</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 