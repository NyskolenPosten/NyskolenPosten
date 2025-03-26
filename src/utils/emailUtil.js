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
 * Simulerer sending av e-post via backend
 * @param {string} to Mottakerens e-postadresse
 * @param {string} subject E-postens emne
 * @param {string} body E-postens innhold
 * @returns {Promise<object>} Resultatet av e-postsendingen
 */
export async function sendEmail(to, subject, body) {
  try {
    // Simpler logging av e-post-informasjon for testing
    // I en produksjonsversjon ville dette vært en faktisk API-forespørsel til en backend
    console.log('------ E-POST SENDT ------');
    console.log(`Til: ${to}`);
    console.log(`Emne: ${subject}`);
    console.log(`Innhold: ${body}`);
    console.log('-------------------------');
    
    // Simuler en liten forsinkelse som en faktisk e-posttjeneste ville hatt
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { success: true, message: 'E-post sendt (simulert)' };
  } catch (error) {
    console.error('Feil ved sending av e-post:', error);
    return { success: false, message: 'Kunne ikke sende e-post' };
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

Din verifiseringskode for ${verifiseringsTekst} på Nyskolen Posten er:

${code}

Skriv inn denne koden i verifiseringsfeltet for å fullføre prosessen.

Med vennlig hilsen,
Redaksjonen i Nyskolen Posten
`;

  try {
    // For en ekte e-posttjeneste, ville vi sendt e-posten via en backend API
    // Men for testformål, viser vi koden i konsollen og simulerer sendingen
    console.log(`Verifiseringskode til ${email}: ${code}`);
    
    // Simpler sending av e-post (kun for testing)
    await sendEmail(email, subject, body);
    
    return { success: true, message: 'Verifiseringskode sendt', code };
  } catch (error) {
    console.error('Feil ved sending av verifiseringskode:', error);
    return { success: false, message: 'Kunne ikke sende verifiseringskode', error };
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
    // Simulerer sending av velkomst-epost
    await sendEmail(email, subject, body);
    return { success: true, message: 'Velkomst-epost sendt' };
  } catch (error) {
    console.error('Feil ved sending av velkomst-epost:', error);
    return { success: false, message: 'Kunne ikke sende velkomst-epost', error };
  }
} 