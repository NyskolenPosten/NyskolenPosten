import React from 'react';
import { Link } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '../utils/LanguageContext';
import './Header.css';

function Header({ innloggetBruker, onLogout, isLockdown }) {
  const { translations } = useLanguage();
  const { navigation, footer } = translations;
  
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
            
            {innloggetBruker.rolle === 'admin' && !isLockdown && (
              <Link to="/admin">{navigation.admin}</Link>
            )}
            
            {innloggetBruker.rolle === 'teknisk_leder' && (
              <Link to="/website-panel" className="tech-leader-link">Website Panel</Link>
            )}
            
            {innloggetBruker.rolle === 'redaktør' && !isLockdown && (
              <Link to="/admin">{navigation.admin}</Link>
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