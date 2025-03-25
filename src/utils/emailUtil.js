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
 * Sender en e-post
 * @param {string} to Mottakerens e-postadresse
 * @param {string} subject E-postens emne
 * @param {string} body E-postens innhold
 * @returns {Promise<object>} Resultatet av e-postsendingen
 */
export async function sendEmail(to, subject, body) {
  try {
    const sender = `${EMAIL_CONFIG.fromName} <${EMAIL_CONFIG.fromEmail}>`;
    
    // I en ekte implementasjon ville vi brukt en server eller tjeneste som EmailJS
    // For demonstrasjonsformål åpner vi bare brukerens e-postklient
    const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}&from=${encodeURIComponent(sender)}`;
    window.open(mailtoLink, '_blank');
    
    console.log(`E-post sendt fra ${EMAIL_CONFIG.fromEmail} til ${to}`);
    return { success: true, message: 'E-postvindu åpnet' };
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
  const code = generateVerificationCode();
  
  // Nytt emne for begge typer verifiseringer
  const subject = 'Verifisering Nyskolen Posten';
    
  // Nytt innhold for alle verifiseringsmeldinger
  const body = `Hei 👋 \n\nDu har fått en verifiserings kode. Koden er: ${code}\n\nHilsen Nyskolen Posten`;
  
  // Lagre koden for senere verifisering
  storeVerificationCode(email, code);
  
  // Send e-post med koden
  const result = await sendEmail(email, subject, body);
  
  return { ...result, code };
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
  
  return await sendEmail(email, subject, body);
} 