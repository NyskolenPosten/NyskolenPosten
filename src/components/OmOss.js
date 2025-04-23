// components/OmOss.js
import React from 'react';
import { Link } from 'react-router-dom';
import './OmOss.css';

function OmOss() {
  // Hardkodet liste over medarbeidere
  const medarbeidere = [
    {
      id: 1,
      navn: 'Mattis B Tøllefsen',
      rolle: 'Teknisk Leder',
      beskrivelse: 'Ansvarlig for teknisk utvikling og vedlikehold av nettavisen'
    },
    // Andre medarbeidere kan legges til her
  ];

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
          <h4>Våre medarbeidere</h4>
          <div className="medarbeider-grid">
            {medarbeidere.map(person => (
              <div key={person.id} className="medarbeider-kort">
                <h5>{person.navn}</h5>
                <div className="rolle">{person.rolle}</div>
                <p className="beskrivelse">{person.beskrivelse}</p>
              </div>
            ))}
          </div>
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