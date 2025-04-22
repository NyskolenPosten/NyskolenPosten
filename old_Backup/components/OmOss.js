// components/OmOss.js
import React from 'react';
import './OmOss.css';

function OmOss() {
  return (
    <div className="om-oss">
      <h2>Om Nyskolen Posten</h2>
      
      <section className="om-oss-seksjon">
        <h3>Elevdrevet avis for Nyskolen i Oslo</h3>
        <p>
          Nyskolen Posten er en avis laget av og for elever ved Nyskolen i Oslo. 
          Avisen er et resultat av elevenes egne initiativ, i tråd med skolens 
          verdier om demokrati, medbestemmelse og aktiv deltakelse.
        </p>
        
        <h3>Vårt formål</h3>
        <p>
          Gjennom Nyskolen Posten ønsker vi å:
        </p>
        <ul>
          <li>Gi elever en stemme og plattform for å dele nyheter, meninger og kreative verk</li>
          <li>Fremme demokratiske verdier ved å la elever være aktive deltakere i skolesamfunnet</li>
          <li>Skape et inkluderende fellesskap der alle elevers bidrag verdsettes</li>
          <li>Utvikle kritisk tenkning og journalistiske ferdigheter</li>
          <li>Dokumentere Nyskolens hverdag og spesielle begivenheter</li>
        </ul>
        
        <h3>Bli med!</h3>
        <p>
          Alle elever på Nyskolen kan bidra med artikler, fotografier, 
          intervjuer, anmeldelser og mye mer. Logg inn og klikk på "Skriv ny artikkel" 
          for å sende inn ditt bidrag!
        </p>
        
        <h3>Teknisk info</h3>
        <p>
          Nyskolen Posten er bygget med React og koden er publisert på GitHub som 
          et åpent kildekode-prosjekt. Dette betyr at alle elever også kan bidra til 
          utvikling og forbedring av selve nettavisen.
        </p>
      </section>
    </div>
  );
}

export default OmOss; 