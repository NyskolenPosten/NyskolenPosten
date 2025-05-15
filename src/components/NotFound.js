import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './NotFound.css';

// Sjekk om vi er på GitHub Pages
const isGitHubPages = window.location.hostname.includes('github.io');

function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Liste over kjente ruter som kan være mål for direkte navigering
  const knownRoutes = [
    '/register', 
    '/registrer', 
    '/login', 
    '/logg-inn', 
    '/ny-artikkel', 
    '/mine-artikler', 
    '/admin', 
    '/profil',
    '/website-panel',
    '/data-panel'
  ];
  
  // Dersom vi er på GitHub Pages, prøv å håndtere feil URL-format
  useEffect(() => {
    if (isGitHubPages) {
      // Sjekk om vi har en kjent rute i nåværende sti
      const currentPath = location.pathname;
      
      // Hvis vi er på en 404-side, sjekk om vi kan omdirigere til en kjent rute
      for (const route of knownRoutes) {
        if (currentPath.includes(route)) {
          console.log(`Omdirigerer til kjent rute: ${route}`);
          navigate(route, { replace: true });
          return;
        }
      }
      
      // Sjekk for artikkelvisning spesifikt
      if (currentPath.includes('/artikkel/')) {
        const artikkelPath = '/artikkel/' + currentPath.split('/artikkel/')[1];
        console.log(`Omdirigerer til artikkel: ${artikkelPath}`);
        navigate(artikkelPath, { replace: true });
        return;
      }
      
      // Sjekk generell URL-struktur for omdirigering
      const path = window.location.pathname;
      const pathSegments = path.split('/');
      
      // Hvis vi har en URL som mangler reponavnet, prøv å omdirigere
      if (pathSegments.length >= 2) {
        const repoName = pathSegments[1];
        if (repoName !== 'NyskolenPosten' && pathSegments.length > 2) {
          // Finn den resterende delen av URL-en
          const remainingPath = '/' + pathSegments.slice(2).join('/');
          // Omdirigere til korrekt URL med reponavnet
          const correctedPath = '/NyskolenPosten' + remainingPath;
          console.log(`Omdirigerer fra ${path} til ${correctedPath}`);
          navigate(correctedPath, { replace: true });
          return;
        }
      }
      
      // Sjekk om vi har en lagret rute fra 404.html-håndtering
      const savedPath = sessionStorage.getItem('redirectPath');
      if (savedPath) {
        console.log(`Omdirigerer fra NotFound til lagret sti: ${savedPath}`);
        sessionStorage.removeItem('redirectPath'); // Fjern for å unngå løkker
        navigate(savedPath, { replace: true });
        return;
      }
    }
  }, [navigate, location.pathname]);
  
  // Direkte lenker til viktige sider
  const directLinks = [
    { path: '/register', text: 'Registrering' },
    { path: '/login', text: 'Logg inn' },
    { path: '/', text: 'Forsiden' }
  ];
  
  return (
    <div className="not-found-container">
      <h1>404 - Siden finnes ikke</h1>
      <p>Beklager, men siden du leter etter finnes ikke.</p>
      
      <div className="direct-links-container">
        <h3>Hurtiglenker</h3>
        <div className="direct-links">
          {directLinks.map((link, index) => (
            <Link key={index} to={link.path} className="direct-link">
              {link.text}
            </Link>
          ))}
        </div>
      </div>
      
      {isGitHubPages && (
        <div className="github-pages-info">
          <h2>GitHub Pages informasjon</h2>
          <p>Dette er en React-app på GitHub Pages, som kan ha problemer med direkte URL-tilgang.</p>
          <p>For å sikre at du når alle sider korrekt, start fra forsiden og naviger via menyene.</p>
        </div>
      )}
      
      <div className="action-links">
        <Link to="/" className="home-link">Gå til forsiden</Link>
        <button 
          onClick={() => window.location.reload()} 
          className="reload-button"
        >
          Last siden på nytt
        </button>
      </div>
    </div>
  );
}

export default NotFound; 