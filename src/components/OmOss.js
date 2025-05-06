// components/OmOss.js
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { LanguageContext } from '../utils/LanguageContext';
import './OmOss.css';

const NO = {
  title: 'Om oss',
  intro: 'Nyskolen Posten er en elevdrevet nettavis for Nyskolen i Oslo. Avisen ble startet i 2025 som et prosjekt for å gi elevene en stemme og en plattform for å dele nyheter, meninger og kreativt innhold.',
  vision: 'Vår visjon er å skape en levende og engasjerende avis som gjenspeiler skolens verdier om demokrati, medvirkning og kreativitet.',
  editorial: 'Redaksjonen\nNyskolen Posten drives av elever for elever. Redaksjonen består av elever fra ulike trinn som samarbeider om å skrive, redigere og publisere innhold.',
  staff: 'Våre medarbeidere',
  mattis: 'Mattis B Tøllefsen',
  techlead: 'Teknisk leder',
  techdesc: 'Ansvarlig for teknisk utvikling og vedlikehold av nettavisen',
  join: 'Bli med!\nHar du lyst til å bli med i redaksjonen? Vi er alltid på jakt etter nye skribenter, fotografer og idéskapere!\nFor å bli med, registrer deg som bruker på nettsiden og send en melding til redaktøren. Du kan også skrive din første artikkel og sende den inn til vurdering.',
  register: 'Registrer deg',
  write: 'Skriv en artikkel',
  contact: 'Kontakt oss',
  contactdesc: 'Har du spørsmål, tilbakemeldinger eller tips til saker? Kontakt oss på',
};

const EN = {
  title: 'About Us',
  intro: 'Nyskolen Posten is a student-run online newspaper for Nyskolen in Oslo. The newspaper was started in 2025 as a project to give students a voice and a platform to share news, opinions, and creative content.',
  vision: 'Our vision is to create a vibrant and engaging newspaper that reflects the school's values of democracy, participation, and creativity.',
  editorial: 'Editorial Team\nNyskolen Posten is run by students, for students. The editorial team consists of students from different grades who collaborate to write, edit, and publish content.',
  staff: 'Our Staff',
  mattis: 'Mattis B Tøllefsen',
  techlead: 'Technical Manager',
  techdesc: 'Responsible for technical development and maintenance of the online newspaper.',
  join: 'Join Us!\nWould you like to join the editorial team? We are always looking for new writers, photographers, and idea creators!\nTo join, register as a user on the website and send a message to the editor. You can also write your first article and submit it for review.',
  register: 'Register',
  write: 'Write an article',
  contact: 'Contact Us',
  contactdesc: 'Do you have questions, feedback, or story tips? Contact us at',
};

function OmOss() {
  const { language } = useContext(LanguageContext);
  const t = language === 'en' ? EN : NO;

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
    <div className="om-oss-container">
      <h2>{t.title}</h2>
      <p>{t.intro}</p>
      <p>{t.vision}</p>
      <h3>{t.editorial.split('\n')[0]}</h3>
      <p>{t.editorial.split('\n').slice(1).join(' ')}</p>
      <h3>{t.staff}</h3>
      <div className="medarbeider-kort">
        <div className="medarbeider">
          <strong>{t.mattis}</strong>
          <div>{t.techlead}</div>
          <div className="medarbeider-beskrivelse">{t.techdesc}</div>
        </div>
      </div>
      <h3>{t.join.split('\n')[0]}</h3>
      <p>{t.join.split('\n').slice(1).join(' ')}</p>
      <div className="omoss-knapper">
        <a href="/registrer" className="omoss-btn">{t.register}</a>
        <a href="/ny-artikkel" className="omoss-btn">{t.write}</a>
      </div>
      <h3>{t.contact}</h3>
      <p>{t.contactdesc} <a href="mailto:mattis.tollefsen@nionett.no">mattis.tollefsen@nionett.no</a></p>
    </div>
  );
}

export default OmOss; 