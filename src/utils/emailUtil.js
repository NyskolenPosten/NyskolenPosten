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
  
  try {
    // Vis koden direkte i et alert
    alert(`VERIFISERINGSKODE: ${code}`);
    
    console.log(`Verifiseringskode for ${email}: ${code}`);
    return { success: true, message: 'Verifiseringskode vist', code };
    
  } catch (error) {
    console.error('Feil ved visning av verifiseringskode:', error);
    return { success: false, message: 'Kunne ikke vise verifiseringskode', error };
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
  
  try {
    // Vis velkommen-melding direkte i et alert
    alert(`Velkommen til Nyskolen Posten!\n\nHei ${name},\n\nDin konto som ${roleTitle} er nå aktivert.`);
    
    return { success: true, message: 'Velkomstmelding vist' };
  } catch (error) {
    console.error('Feil ved visning av velkomstmelding:', error);
    return { success: false, message: 'Kunne ikke vise velkomstmelding', error };
  }
} 