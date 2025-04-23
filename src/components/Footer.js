import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import { useLanguage } from '../utils/LanguageContext';

function Footer() {
  const år = new Date().getFullYear();
  const { translations } = useLanguage();
  
  return (
    <footer className="footer">
      <div className="footer-innhold">
        <div className="footer-info">
          <p>&copy; {år} {translations.footer.copyright}</p>
          <p><strong>{translations.footer.contact}:</strong> <a href="mailto:redaksjonenyskolenposten@nionett.no" aria-label={translations.footer.contactAriaLabel}>redaksjonenyskolenposten@nionett.no</a></p>
          <p className="teknisk-stotte">
            <strong>Finnet feil/bug? Kontakt meg så fikser jeg det så fort som mulig!:</strong> <a href="mailto:mattis.tollefsen@nionett.no">mattis.tollefsen@nionett.no</a>
          </p>
        </div>
        
        <div className="footer-lenker">
          <Link to="/om-oss">{translations.navigation.about}</Link>
          <Link to="/innlogging">{translations.navigation.login}</Link>
          <Link to="/registrering">{translations.navigation.register}</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 