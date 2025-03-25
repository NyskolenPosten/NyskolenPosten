/**
 * Genererer en tilfeldig verifiseringskode
 * @returns {string} 6-sifret kode
 */
export function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Lagrer verifiseringskode midlertidig i localStorage
 * @param {string} email Brukerens e-post
 * @param {string} code Verifiseringskoden
 * @param {number} expiresIn Utløpstid i minutter (standard 10)
 */
export function storeVerificationCode(email, code, expiresIn = 10) {
  const expires = new Date(Date.now() + expiresIn * 60 * 1000).getTime();
  const verification = { code, expires };
  
  // Hent eksisterende verifiseringer eller opprett ny liste
  const verifications = JSON.parse(localStorage.getItem('verificationCodes')) || {};
  verifications[email] = verification;
  
  localStorage.setItem('verificationCodes', JSON.stringify(verifications));
}

/**
 * Verifiserer en kode for en gitt e-post
 * @param {string} email Brukerens e-post
 * @param {string} code Koden som skal verifiseres
 * @returns {boolean} Sant hvis koden er gyldig
 */
export function verifyCode(email, code) {
  const verifications = JSON.parse(localStorage.getItem('verificationCodes')) || {};
  const verification = verifications[email];
  
  if (!verification) return false;
  
  const now = Date.now();
  // Sjekk om koden er riktig og ikke utløpt
  if (verification.code === code && verification.expires > now) {
    // Fjern koden etter vellykket verifisering
    delete verifications[email];
    localStorage.setItem('verificationCodes', JSON.stringify(verifications));
    return true;
  }
  
  return false;
}

/**
 * Sjekker om en e-postadresse tilhører en admin/redaktør
 * @param {string} email E-postadressen som skal sjekkes
 * @returns {string|null} Brukerrolle (admin/redaktør) eller null
 */
export function checkPrivilegedEmail(email) {
  const adminEmails = ['mattis.tollefsen@nionett.no', 'admin@nyskolen.no', 'redaksjonenyskolenposten@nionett.no'];
  const redaktorEmails = ['redaktor@nyskolen.no'];

  if (adminEmails.includes(email.toLowerCase())) {
    return 'admin';
  } else if (redaktorEmails.includes(email.toLowerCase())) {
    return 'redaktør';
  }
  
  return null;
} 