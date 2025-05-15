import React from 'react';
import { Link } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '../utils/LanguageContext';
import './Header.css';

function Header({ innloggetBruker, onLogout, isLockdown }) {
  const { translations } = useLanguage();
  const { navigation, footer } = translations;
  
  // Valider at brukerdata er komplett
  const erGyldigBruker = innloggetBruker && 
                        innloggetBruker.id && 
                        innloggetBruker.navn && 
                        typeof innloggetBruker.navn === 'string' &&
                        innloggetBruker.navn.trim() !== '';
  
  // Sjekk om brukeren er teknisk leder
  const erTekniskLeder = erGyldigBruker && innloggetBruker.rolle === 'teknisk_leder';
  // Sjekk om brukeren er admin eller redaktør
  const erAdmin = erGyldigBruker && (innloggetBruker.rolle === 'admin' || innloggetBruker.rolle === 'redaktør');
  
  // Funksjon for å vise brukernavn sikkert
  const visNavn = () => {
    if (!erGyldigBruker) return 'Ukjent bruker';
    return innloggetBruker.navn || 'Bruker';
  };
  
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
            {!isLockdown && erGyldigBruker && (
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
            
            {/* Vis varsel om ugyldig bruker */}
            {!erGyldigBruker && (
              <div className="invalid-user-warning">
                Ugyldig brukerdata oppdaget!
              </div>
            )}
            
            <button 
              onClick={onLogout} 
              className={`logout-button ${!erGyldigBruker ? 'urgent' : ''}`}
            >
              {!erGyldigBruker ? 'Fjern ugyldig bruker' : `${navigation.logout} (${visNavn()})`}
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="login-button">{navigation.login}</Link>
            <Link to="/register" className="register-button">{navigation.register}</Link>
          </>
        )}
        
        <LanguageSwitcher />
      </nav>
    </header>
  );
}

export default Header; 