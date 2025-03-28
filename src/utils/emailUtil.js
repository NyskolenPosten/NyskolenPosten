import { generateVerificationCode, storeVerificationCode, verifyCode, checkPrivilegedEmail } from './verificationUtil';
// Fjernet nodemailer-import siden det ikke er støttet i frontend-byggingen

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
 * MERK: Sending av e-post kan ikke gjøres direkte fra frontend via Nodemailer
 * Dette krever en backend-tjeneste eller en tredjeparts-API
 * 
 * Eksempler på løsninger:
 * 1. Lag en enkel Express-server som kjører Nodemailer
 * 2. Bruk en tredjeparts-tjeneste som SendGrid, Mailgun, eller EmailJS
 * 3. Bruk Google Apps Script for å lage et API-endepunkt for å sende via Gmail
 * 
 * Denne funksjonen simulerer e-postsending og returnerer koden for enklere testing
 * 
 * @param {string} to Mottakerens e-postadresse
 * @param {string} subject E-postens emne
 * @param {string} body E-postens innhold
 * @returns {Promise<object>} Resultatet av e-postsendingen og kode for testing
 */
export async function sendEmail(to, subject, body) {
  try {
    // Vis e-post i konsollen med tydelig formatering
    console.log('\n%c📧 E-POST SIMULERING 📧', 'font-size: 14px; font-weight: bold; color: #4285f4; background-color: #e8f0fe; padding: 5px; border-radius: 3px;');
    console.log('%cTil: ' + to, 'color: #333; font-weight: bold;');
    console.log('%cEmne: ' + subject, 'color: #333; font-weight: bold;');
    console.log('%cInnhold:\n' + body, 'color: #444;');
    console.log('%c⚠️ MERK: For faktisk e-postsending, må en backend-tjeneste implementeres. ⚠️', 'font-size: 12px; color: #d81b60; border-top: 1px solid #ccc; padding-top: 5px;');
    
    // Ekstraherer verifiseringskoden fra e-postinnholdet hvis det finnes en
    const kodeMatch = body.match(/\d{6}/);
    const kode = kodeMatch ? kodeMatch[0] : null;
    
    // Simuler en liten forsinkelse for mer realistisk oppførsel
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Returner suksess og inkluder koden for testing
    return { 
      success: true, 
      message: 'Simulert e-post til ' + to,
      messageId: 'sim-' + Date.now(),
      testCode: kode // Inkluder koden for testing
    };
  } catch (error) {
    console.error('Feil ved simulering av e-post:', error);
    
    return { 
      success: false, 
      message: 'Kunne ikke simulere e-post: ' + error.message,
      error: error.message
    };
  }
}

/**
 * Sender en verifiseringskode via e-post (simulert for testing)
 * I en produksjonsmiljø må dette erstattes med faktisk e-postsending via en backend
 * 
 * @param {string} email Brukerens e-postadresse
 * @param {string} name Brukerens navn
 * @param {string} purpose Formålet med verifiseringen (login/registration)
 * @returns {Promise<object>} Resultatet av e-postsendingen og kode for testing
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
    // Log verifiseringskoden tydelig i konsollen for testing
    console.log('\n%c🔑 VERIFISERINGSKODE: %c' + code + ' %c🔑', 
      'background-color: #1a73e8; color: white; font-size: 16px; font-weight: bold; padding: 5px; border-radius: 3px;', 
      'background-color: #e8f0fe; color: #1a73e8; font-size: 24px; font-weight: bold; padding: 5px 10px; border-radius: 3px;',
      'background-color: #1a73e8; color: white; font-size: 16px; font-weight: bold; padding: 5px; border-radius: 3px;'
    );
    console.log('%cE-post: ' + email, 'color: #333;');
    console.log('%cFormål: ' + verifiseringsTekst, 'color: #333;');
    
    // Simuler sending av e-post
    const result = await sendEmail(email, subject, body);
    
    // Returner resultatet med koden for testing
    return { 
      success: result.success, 
      message: result.success ? 'Verifiseringskode simulert (se konsollen)' : result.message,
      kode: code // Returnerer koden direkte for testing
    };
  } catch (error) {
    console.error('Feil ved sending av verifiseringskode:', error);
    return { 
      success: false, 
      message: 'Kunne ikke sende verifiseringskode: ' + error.message,
      kode: code // Returnerer koden selv ved feil
    };
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
    // Send e-post (simulert)
    const result = await sendEmail(email, subject, body);
    
    return { 
      success: result.success, 
      message: result.success ? 'Velkomst-e-post simulert (se konsollen)' : result.message,
      emailData: { to: email, subject, body }
    };
  } catch (error) {
    console.error('Feil ved sending av velkomst-e-post:', error);
    return { success: false, message: 'Kunne ikke sende velkomst-e-post: ' + error.message };
  }
} 