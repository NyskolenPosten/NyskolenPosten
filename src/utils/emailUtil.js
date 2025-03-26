import { generateVerificationCode, storeVerificationCode, verifyCode, checkPrivilegedEmail } from './verificationUtil';

/**
 * Konstanter for e-posttjenesten
 */
export const EMAIL_CONFIG = {
  fromEmail: 'redaksjonenyskolenposten@nionett.no',
  fromName: 'Nyskolen Posten',
  replyToEmail: 'redaksjonenyskolenposten@nionett.no',
  adminEmails: [
    'admin@nyskolen.no', 
    'redaksjonenyskolenposten@nionett.no'
  ],
  redaktorEmails: [
    'redaktor@nyskolen.no'
  ]
};

/**
 * Simulerer sending av e-post, men viser innholdet direkte i et alert
 * @param {string} to Mottakerens e-postadresse
 * @param {string} subject E-postens emne
 * @param {string} body E-postens innhold
 * @returns {Promise<object>} Resultatet av e-postsendingen
 */
export async function sendEmail(to, subject, body) {
  try {
    // Vis meldingen direkte til brukeren i stedet for å sende e-post
    // For testformål - i en virkelig app ville dette sendt en faktisk e-post
    
    // Formater meldingen mer lesbart
    const formattedMessage = `
📧 E-post til: ${to}
📝 Emne: ${subject}

${body}

(Dette er en simulert e-post for lokal testing)
`;

    alert(formattedMessage);
    
    console.log(`Simulert e-post til ${to}:`, { subject, body });
    return { success: true, message: 'Simulert e-post vist' };
  } catch (error) {
    console.error('Feil ved simulering av e-post:', error);
    return { success: false, message: 'Kunne ikke vise simulert e-post' };
  }
}

/**
 * Sender en verifiseringskode via e-post
 * @param {string} email Brukerens e-postadresse
 * @param {string} name Brukerens navn
 * @param {string} purpose Formålet med verifiseringen (login/registration)
 * @returns {Promise<object>} Resultatet av e-postsendingen og generert kode
 */
export async function sendVerificationCode(email, name, purpose) {
  // Generer og lagre koden
  const code = generateVerificationCode();
  storeVerificationCode(email, code);
  
  const verifiseringsTekst = purpose === 'login' ? 'innlogging' : 'registrering';
  
  // Emne og innhold for e-posten
  const subject = `Verifiseringskode for ${verifiseringsTekst} - Nyskolen Posten`;
  const body = `
Hei ${name || ''}!

Din verifiseringskode for ${verifiseringsTekst} er: ${code}

Skriv inn denne koden i verifiseringsfeltet for å fullføre prosessen.

Med vennlig hilsen,
Redaksjonen i Nyskolen Posten
`;

  try {
    // For å sende e-post via Gmail, ville vi normalt gjøre et API-kall til en server
    // Men for lokal testing uten backend, vis koden til brukeren
    
    // Åpne Gmail compose i et nytt vindu/fane hvis mulig
    // Dette er kun for DEMO-formål - i produksjon vil du bruke en e-post-API
    const mailtoLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Først vis koden til brukeren i tilfelle nettleseren blokkerer popup
    alert(`VIKTIG! VERIFISERINGSKODE: ${code}\n\nSkriv ned denne koden før du klikker OK.\n\nEtter du klikker OK vil vi prøve å åpne Gmail for å sende koden.`);
    
    // Åpne Gmail i nytt vindu
    window.open(mailtoLink, '_blank');
    
    console.log(`Verifiseringskode for ${email}: ${code}`);
    return { success: true, message: 'Verifiseringskode klar', code };
    
  } catch (error) {
    console.error('Feil ved sending av verifiseringskode:', error);
    
    // Hvis noe går galt, vis koden i en alert slik at brukeren fremdeles kan fullføre
    alert(`VERIFISERINGSKODE: ${code}\n\nDet oppstod en feil ved åpning av Gmail.\nBruk denne koden for å verifisere deg.`);
    return { success: true, message: 'Verifiseringskode vist som backup', code };
  }
}

/**
 * Sender en velkomste-post til nyregistrert bruker
 * @param {string} email Brukerens e-postadresse
 * @param {string} name Brukerens navn
 * @param {string} role Brukerens rolle (journalist/redaktør/admin)
 * @returns {Promise<object>} Resultatet av e-postsendingen
 */
export async function sendWelcomeEmail(email, name, role) {
  let roleTitle = 'journalist';
  if (role === 'redaktør') roleTitle = 'redaktør';
  if (role === 'admin') roleTitle = 'administrator';
  
  const subject = `Velkommen til Nyskolen Posten, ${name}!`;
  const body = `Hei ${name}!\n\n`
    + `Vi er glade for å ønske deg velkommen til Nyskolen Posten som ${roleTitle}. `
    + `Din konto er nå aktivert og du kan logge inn på nettsiden vår.\n\n`
    + `Som ${roleTitle} hos oss kan du ${role === 'journalist' 
      ? 'skrive og publisere artikler som vil bli gjennomgått av våre redaktører.' 
      : 'godkjenne artikler og administrere nettsiden.'}\n\n`
    + `Hvis du har spørsmål, ikke nøl med å kontakte oss ved å svare på denne e-posten.\n\n`
    + `Med vennlig hilsen,\n`
    + `Redaksjonen i Nyskolen Posten\n`
    + `E-post: ${EMAIL_CONFIG.fromEmail}`;
  
  try {
    // Som med verifiseringskoden, prøver vi å åpne Gmail
    const mailtoLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    alert(`Velkommen til Nyskolen Posten!\n\nHei ${name},\n\nDin konto som ${roleTitle} er nå aktivert.\n\nNår du klikker OK vil vi prøve å åpne Gmail for å sende en velkomst-epost.`);
    
    // Åpne Gmail i nytt vindu
    window.open(mailtoLink, '_blank');
    
    return { success: true, message: 'Velkomstepost sendt via Gmail' };
  } catch (error) {
    console.error('Feil ved sending av velkomstepost:', error);
    alert(`Velkommen til Nyskolen Posten!\n\nHei ${name},\n\nDin konto som ${roleTitle} er nå aktivert.`);
    return { success: true, message: 'Velkomstmelding vist som backup' };
  }
} 