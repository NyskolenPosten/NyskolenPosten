import React from 'react';
import { Link } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '../utils/LanguageContext';
import './Header.css';

function Header({ innloggetBruker, onLogout }) {
  const { translations } = useLanguage();
  const { navigation, footer } = translations;
  
  return (
    <header className="header">
      <div className="logo-container">
        <Link to="/" className="logo-link">
          <h1>Nyskolen Posten</h1>
        </Link>
        <p className="slogan">{footer.copyright}</p>
      </div>
      
      <nav className="navigation">
        <Link to="/">{navigation.home}</Link>
        <Link to="/om-oss">{navigation.about}</Link>
        
        {innloggetBruker ? (
          <>
            <Link to="/ny-artikkel">{navigation.writeArticle}</Link>
            
            {innloggetBruker.rolle === 'admin' && (
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
            <Link to="/innlogging" className="login-button">{navigation.login}</Link>
            <Link to="/registrering" className="register-button">{navigation.register}</Link>
          </>
        )}
        
        <LanguageSwitcher />
      </nav>
    </header>
  );
}

export default Header; 