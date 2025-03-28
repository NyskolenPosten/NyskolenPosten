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
 * Sender e-post via e-posttjeneste
 * I produksjon bør dette byttes ut med faktisk API-kall til en e-posttjeneste
 * @param {string} to Mottakerens e-postadresse
 * @param {string} subject E-postens emne
 * @param {string} body E-postens innhold
 * @returns {Promise<object>} Resultatet av e-postsendingen
 */
export async function sendEmail(to, subject, body) {
  try {
    // TEMP: Vis e-post i konsollen i utviklingsmodus
    if (process.env.NODE_ENV === 'development') {
      console.log('\n%c📧 E-POST | TIL API FOR SENDING 📧', 'font-size: 14px; font-weight: bold; color: #4285f4; background-color: #e8f0fe; padding: 5px; border-radius: 3px;');
      console.log('%cTil: ' + to, 'color: #333; font-weight: bold;');
      console.log('%cEmne: ' + subject, 'color: #333; font-weight: bold;');
      console.log('%cInnhold:\n' + body, 'color: #444;');
    }
    
    // Her kommer koden for faktisk sending via e-posttjeneste
    // For eksempel, bruk fetch eller axios til å kalle en back-end API-endepunkt
    // som håndterer sending via Gmail eller annen e-posttjeneste
    
    // Eksempel:
    // const response = await fetch('/api/send-email', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ to, subject, body, from: EMAIL_CONFIG.fromEmail })
    // });
    // const data = await response.json();
    // if (!data.success) throw new Error(data.message);
    
    // Simuler en liten forsinkelse for mer realistisk oppførsel
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Returner suksess (dette vil erstattes av faktisk respons fra API)
    return { 
      success: true, 
      message: 'E-post sendt til ' + to,
      messageId: 'temp-' + Date.now()
    };
  } catch (error) {
    console.error('Feil ved sending av e-post:', error);
    
    return { 
      success: false, 
      message: 'Kunne ikke sende e-post: ' + error.message,
      error: error.message
    };
  }
}

/**
 * Sender en verifiseringskode via e-post
 * @param {string} email Brukerens e-postadresse
 * @param {string} name Brukerens navn
 * @param {string} purpose Formålet med verifiseringen (login/registration)
 * @returns {Promise<object>} Resultatet av e-postsendingen
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
    // Send e-post
    const result = await sendEmail(email, subject, body);
    
    // Returner resultatet
    return { 
      success: result.success, 
      message: result.success ? 'Verifiseringskode sendt til din e-post' : result.message
    };
  } catch (error) {
    console.error('Feil ved sending av verifiseringskode:', error);
    return { 
      success: false, 
      message: 'Kunne ikke sende verifiseringskode: ' + error.message
    };
  }
}

/**
 * Sender en velkomst-e-post til nyregistrert bruker
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
    // Send e-post
    const result = await sendEmail(email, subject, body);
    
    return { 
      success: result.success, 
      message: result.success ? 'Velkomst-e-post sendt' : result.message
    };
  } catch (error) {
    console.error('Feil ved sending av velkomst-e-post:', error);
    return { success: false, message: 'Kunne ikke sende velkomst-e-post: ' + error.message };
  }
} 