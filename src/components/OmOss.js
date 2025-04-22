// components/OmOss.js
import React from 'react';
import { Link } from 'react-router-dom';
import './OmOss.css';

function OmOss({ jobbliste = [] }) {
  return (
    <div className="om-oss">
      <h2>Om Nyskolen Posten</h2>
      
      <section className="om-oss-seksjon">
        <h3>Vår historie</h3>
        <p>
          Nyskolen Posten er en elevdrevet nettavis for Nyskolen i Oslo. 
          Avisen ble startet i 2025 som et prosjekt for å gi elevene en stemme 
          og en plattform for å dele nyheter, meninger og kreativt innhold.
        </p>
        <p>
          Vår visjon er å skape en levende og engasjerende avis som reflekterer 
          skolens verdier om demokrati, medbestemmelse og kreativitet.
        </p>
      </section>
      
      <section className="om-oss-seksjon">
        <h3>Redaksjonen</h3>
        <p>
          Nyskolen Posten drives av elever for elever. Redaksjonen består av 
          elever fra ulike trinn som samarbeider om å skrive, redigere og 
          publisere innhold.
        </p>
        
        <div className="redaksjon-liste">
          <h4>Våre medarbeidere:</h4>
          <table className="medarbeider-tabell">
            <thead>
              <tr>
                <th>Navn Rolle</th>
              </tr>
            </thead>
            <tbody>
              {jobbliste.map(person => (
                <tr key={person.id}>
                  <td>{person.navn}</td>
                  <td>{person.rolle}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      
      <section className="om-oss-seksjon">
        <h3>Bli med!</h3>
        <p>
          Har du lyst til å bli med i redaksjonen? Vi er alltid på jakt etter 
          nye skribenter, fotografer og idéskapere!
        </p>
        <p>
          For å bli med, registrer deg som bruker på nettsiden og send en 
          melding til redaktøren. Du kan også skrive din første artikkel 
          og sende den inn for vurdering.
        </p>
        <div className="bli-med-knapper">
          <Link to="/registrer" className="bli-med-knapp">Registrer deg</Link>
          <Link to="/ny-artikkel" className="bli-med-knapp">Skriv en artikkel</Link>
        </div>
      </section>
      
      <section className="om-oss-seksjon">
        <h3>Kontakt oss</h3>
        <p>
          Har du spørsmål, tilbakemeldinger eller tips til saker? 
          Kontakt oss på <a href="mailto:redaksjonenyskolenposten@nionett.no">redaksjonenyskolenposten@nionett.no</a>
        </p>
      </section>
    </div>
  );
}

export default OmOss; 