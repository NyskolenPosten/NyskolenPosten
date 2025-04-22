import React from 'react';
import { Link } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '../utils/LanguageContext';
import './Header.css';

function Header({ innloggetBruker, onLogout, isLockdown }) {
  const { translations } = useLanguage();
  const { navigation, footer } = translations;
  
  // Sjekk om brukeren er teknisk leder
  const erTekniskLeder = innloggetBruker && innloggetBruker.rolle === 'teknisk_leder';
  // Sjekk om brukeren er admin eller redaktør
  const erAdmin = innloggetBruker && (innloggetBruker.rolle === 'admin' || innloggetBruker.rolle === 'redaktør');
  
  return (
    <header className="header">
      <div className="logo-container">
        <Link to="/" className="logo-link">
          <h1>Nyskolen Posten</h1>
        </Link>
        <p className="slogan">{footer.copyright}</p>
        {isLockdown && <span className="lockdown-indicator">LOCKDOWN MODUS</span>}
      </div>
      
      <nav className="navigation">
        <Link to="/">{navigation.home}</Link>
        <Link to="/om-oss">{navigation.about}</Link>
        
        {innloggetBruker ? (
          <>
            {!isLockdown && (
              <Link to="/ny-artikkel">{navigation.writeArticle}</Link>
            )}
            
            {/* Admin-panel er tilgjengelig for admin, redaktør OG teknisk leder */}
            {(erAdmin || erTekniskLeder) && !isLockdown && (
              <Link to="/admin">{navigation.admin}</Link>
            )}
            
            {/* Website Panel er kun tilgjengelig for teknisk leder */}
            {erTekniskLeder && (
              <>
                <Link to="/website-panel" className="tech-leader-link">Website Panel</Link>
                <Link to="/data-panel" className="tech-leader-link">Data Panel</Link>
              </>
            )}
            
            {/* Data Panel er tilgjengelig for admin, redaktør OG teknisk leder */}
            {erAdmin && !erTekniskLeder && (
              <Link to="/data-panel" className="admin-link">Data Panel</Link>
            )}
            
            <button 
              onClick={onLogout} 
              className="logout-button"
            >
              {navigation.logout} ({innloggetBruker.navn})
            </button>
          </>
        ) : (
          <>
            <Link to="/logg-inn" className="login-button">{navigation.login}</Link>
            <Link to="/registrer" className="register-button">{navigation.register}</Link>
          </>
        )}
        
        <LanguageSwitcher />
      </nav>
    </header>
  );
}

export default Header; 