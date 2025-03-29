// migratePasswords.js - Skript for å kryptere alle eksisterende passord

import { encrypt, isEncrypted } from './cryptoUtil';

/**
 * Migrerer alle eksisterende passord i localStorage til kryptert format
 * @returns {Object} - Resultat av migreringen
 */
export const migratePasswords = () => {
  try {
    // Hent brukere fra localStorage
    const brukere = JSON.parse(localStorage.getItem('brukere')) || [];
    let migrerte = 0;
    let alleredeMigrert = 0;
    
    // Gå gjennom alle brukere og krypter passord som ikke allerede er kryptert
    const oppdaterteBrukere = brukere.map(bruker => {
      if (bruker.password && !isEncrypted(bruker.password)) {
        migrerte++;
        return {
          ...bruker,
          password: encrypt(bruker.password)
        };
      } else {
        if (bruker.password) alleredeMigrert++;
        return bruker;
      }
    });
    
    // Lagre oppdaterte brukere i localStorage
    if (migrerte > 0) {
      localStorage.setItem('brukere', JSON.stringify(oppdaterteBrukere));
    }
    
    return {
      success: true,
      total: brukere.length,
      migrerte: migrerte,
      alleredeMigrert: alleredeMigrert,
      ingenPassord: brukere.length - migrerte - alleredeMigrert
    };
  } catch (error) {
    console.error('Feil ved migrering av passord:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Kjører passordmigrering automatisk ved oppstart (kan kalles fra App.js)
 */
export const autoMigratePasswords = () => {
  try {
    const result = migratePasswords();
    if (result.success && result.migrerte > 0) {
      console.log(`Migrerte ${result.migrerte} passord til kryptert format.`);
    }
    return result;
  } catch (error) {
    console.error('Automatisk passordmigrering feilet:', error);
    return { success: false, error: error.message };
  }
}; 