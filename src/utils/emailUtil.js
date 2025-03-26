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
 * Simulerer sending av e-post via konsollen
 * @param {string} to Mottakerens e-postadresse
 * @param {string} subject E-postens emne
 * @param {string} body E-postens innhold
 * @returns {Promise<object>} Resultatet av e-postsendingen
 */
export async function sendEmail(to, subject, body) {
  try {
    // Vis e-post i konsollen med tydelig formatering
    console.log('\n%c📧 E-POST SIMULERING 📧', 'font-size: 14px; font-weight: bold; color: #4285f4; background-color: #e8f0fe; padding: 5px; border-radius: 3px;');
    console.log('%cTil: ' + to, 'color: #333; font-weight: bold;');
    console.log('%cEmne: ' + subject, 'color: #333; font-weight: bold;');
    console.log('%cInnhold:\n' + body, 'color: #444;');
    console.log('%c🔚 SLUTT PÅ E-POST 🔚', 'font-size: 12px; color: #4285f4; border-top: 1px solid #ccc; padding-top: 5px;');
    
    // Simuler en liten forsinkelse
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return { 
      success: true, 
      message: 'E-post simulert i konsollen',
      emailData: { to, subject, body }
    };
  } catch (error) {
    console.error('Feil ved simulering av e-post:', error);
    return { success: false, message: 'Kunne ikke simulere e-post' };
  }
}

/**
 * Sender en verifiseringskode via e-post (simulert)
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

Din verifiseringskode for ${verifiseringsTekst} på Nyskolen Posten er:

${code}

Skriv inn denne koden i verifiseringsfeltet for å fullføre prosessen.

Med vennlig hilsen,
Redaksjonen i Nyskolen Posten
`;

  try {
    // Log verifiseringskoden VELDIG tydelig i konsollen
    console.log('\n%c🔑 VERIFISERINGSKODE: %c' + code + ' %c🔑', 
      'background-color: #1a73e8; color: white; font-size: 16px; font-weight: bold; padding: 5px; border-radius: 3px;', 
      'background-color: #e8f0fe; color: #1a73e8; font-size: 24px; font-weight: bold; padding: 5px 10px; border-radius: 3px;',
      'background-color: #1a73e8; color: white; font-size: 16px; font-weight: bold; padding: 5px; border-radius: 3px;'
    );
    console.log('%cE-post: ' + email, 'color: #333;');
    console.log('%cFormål: ' + verifiseringsTekst, 'color: #333;');
    console.log('%c(Denne koden er for lokal testing)', 'font-style: italic; color: #666;');
    
    // Simuler e-postsending via konsollen
    await sendEmail(email, subject, body);
    
    // Returner resultatet sammen med koden for testing
    return { 
      success: true, 
      message: 'Verifiseringskode sendt (simulert i konsollen)',
      kode: code // Returnerer koden direkte for utviklingsformål
    };
  } catch (error) {
    console.error('Feil ved sending av verifiseringskode:', error);
    return { success: false, message: 'Kunne ikke sende verifiseringskode' };
  }
}

/**
 * Sender en velkomst-e-post til nyregistrert bruker (simulert)
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
    // Simuler e-postsending via konsollen
    await sendEmail(email, subject, body);
    
    return { 
      success: true, 
      message: 'Velkomst-e-post sendt (simulert i konsollen)',
      emailData: { to: email, subject, body }
    };
  } catch (error) {
    console.error('Feil ved sending av velkomst-e-post:', error);
    return { success: false, message: 'Kunne ikke sende velkomst-e-post' };
  }
} 