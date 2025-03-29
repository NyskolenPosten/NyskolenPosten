// cryptoUtil.js - Verktøy for sikker kryptering av data

/**
 * Enkel kryptering av passord med en konstant nøkkel
 * Dette er ikke produksjons-nivå sikkerhet, men mye bedre enn klartekst
 */

// En hemmelig nøkkel for kryptering (i produksjon bør dette være en miljøvariabel)
const CRYPTO_KEY = 'NyskolenPosten2023_HEMMELIG_NØKKEL';

/**
 * Krypterer en streng
 * @param {string} text - Strengen som skal krypteres
 * @returns {string} - Den krypterte strengen
 */
export const encrypt = (text) => {
  if (!text) return '';
  
  try {
    // Enkel XOR-basert kryptering med nøkkelen
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ CRYPTO_KEY.charCodeAt(i % CRYPTO_KEY.length);
      result += String.fromCharCode(charCode);
    }
    
    // Konverter til base64 for sikker lagring
    return btoa(result);
  } catch (error) {
    console.error('Kryptering feilet:', error);
    return '';
  }
};

/**
 * Dekrypterer en kryptert streng
 * @param {string} encryptedText - Den krypterte strengen
 * @returns {string} - Den opprinnelige strengen
 */
export const decrypt = (encryptedText) => {
  if (!encryptedText) return '';
  
  try {
    // Dekoder fra base64
    const decoded = atob(encryptedText);
    
    // XOR-dekryptering
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ CRYPTO_KEY.charCodeAt(i % CRYPTO_KEY.length);
      result += String.fromCharCode(charCode);
    }
    
    return result;
  } catch (error) {
    console.error('Dekryptering feilet:', error);
    return '';
  }
};

/**
 * Sjekker om et passord matcher det krypterte passordet
 * @param {string} plainPassword - Passordet i klartekst
 * @param {string} encryptedPassword - Det krypterte passordet
 * @returns {boolean} - True hvis passordene matcher
 */
export const verifyPassword = (plainPassword, encryptedPassword) => {
  if (!plainPassword || !encryptedPassword) return false;
  
  try {
    return encrypt(plainPassword) === encryptedPassword;
  } catch (error) {
    console.error('Passordverifisering feilet:', error);
    return false;
  }
};

/**
 * Sjekker om en streng allerede er kryptert
 * Dette er en enkel sjekk basert på om strengen er en gyldig base64-streng
 * @param {string} text - Strengen som skal sjekkes
 * @returns {boolean} - True hvis strengen ser ut til å være kryptert
 */
export const isEncrypted = (text) => {
  if (!text) return false;
  
  try {
    // Sjekk om det er en gyldig base64-streng
    const regex = /^[A-Za-z0-9+/=]+$/;
    return regex.test(text) && text.length % 4 === 0;
  } catch (error) {
    return false;
  }
}; 