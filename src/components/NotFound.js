import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './NotFound.css';

// Sjekk om vi er på GitHub Pages
const isGitHubPages = window.location.hostname.includes('github.io');

function NotFound() {
  const navigate = useNavigate();
  
  // Dersom vi er på GitHub Pages, prøv å håndtere feil URL-format
  useEffect(() => {
    if (isGitHubPages) {
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
    }
  }, [navigate]);
  
  return (
    <div className="not-found-container">
      <h1>404 - Siden finnes ikke</h1>
      <p>Beklager, men siden du leter etter finnes ikke.</p>
      
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