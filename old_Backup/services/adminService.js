// services/adminService.js - Administrasjonsfunksjoner med lokal lagring

// Hent alle brukere
export const hentAlleBrukere = async () => {
  try {
    const brukere = JSON.parse(localStorage.getItem('brukere')) || [];
    const sorterteBrukere = brukere.sort((a, b) => {
      // Sorter etter opprettelsesdato (nyeste først)
      return new Date(b.opprettet) - new Date(a.opprettet);
    });
    
    return { success: true, brukere: sorterteBrukere };
  } catch (error) {
    return { success: false, error: error.message || 'Kunne ikke hente brukere' };
  }
};

// Hent brukere som venter på godkjenning
export const hentVentendeBrukere = async () => {
  try {
    const brukere = JSON.parse(localStorage.getItem('brukere')) || [];
    const ventendeBrukere = brukere.filter(bruker => bruker.godkjent === false)
      .sort((a, b) => new Date(b.opprettet) - new Date(a.opprettet));
    
    return { success: true, brukere: ventendeBrukere };
  } catch (error) {
    return { success: false, error: error.message || 'Kunne ikke hente ventende brukere' };
  }
};

// Godkjenn bruker
export const godkjennBruker = async (brukerId) => {
  try {
    const brukere = JSON.parse(localStorage.getItem('brukere')) || [];
    const brukerIndex = brukere.findIndex(b => b.id === brukerId);
    
    if (brukerIndex === -1) {
      return { success: false, error: 'Brukeren finnes ikke' };
    }
    
    brukere[brukerIndex].godkjent = true;
    localStorage.setItem('brukere', JSON.stringify(brukere));
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message || 'Kunne ikke godkjenne brukeren' };
  }
};

// Endre brukerrolle
export const endreBrukerrolle = async (brukerId, nyRolle) => {
  try {
    const brukere = JSON.parse(localStorage.getItem('brukere')) || [];
    const brukerIndex = brukere.findIndex(b => b.id === brukerId);
    
    if (brukerIndex === -1) {
      return { success: false, error: 'Brukeren finnes ikke' };
    }
    
    brukere[brukerIndex].rolle = nyRolle;
    localStorage.setItem('brukere', JSON.stringify(brukere));
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message || 'Kunne ikke endre brukerrolle' };
  }
};

// Slett bruker
export const slettBruker = async (brukerId) => {
  try {
    const brukere = JSON.parse(localStorage.getItem('brukere')) || [];
    const oppdaterteBrukere = brukere.filter(b => b.id !== brukerId);
    
    localStorage.setItem('brukere', JSON.stringify(oppdaterteBrukere));
    
    // Slett også brukerens artikler
    const artikler = JSON.parse(localStorage.getItem('artikler')) || [];
    const oppdaterteArtikler = artikler.filter(a => a.forfatterID !== brukerId);
    
    localStorage.setItem('artikler', JSON.stringify(oppdaterteArtikler));
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message || 'Kunne ikke slette brukeren' };
  }
}; 