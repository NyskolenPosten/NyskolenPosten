// dataService.js - Håndterer lagring og lasting av data til/fra localStorage og filer

// Hjelpefunksjon for å lagre data i localStorage
export const lagreLokalt = (nøkkel, data) => {
  try {
    localStorage.setItem(nøkkel, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Feil ved lagring av ${nøkkel}:`, error);
    return false;
  }
};

// Hjelpefunksjon for å laste data fra localStorage
export const lastLokalt = (nøkkel) => {
  try {
    const data = localStorage.getItem(nøkkel);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Feil ved lasting av ${nøkkel}:`, error);
    return null;
  }
};

// Funksjon for å laste startdata for en gitt datatype
export const lastStartdata = (datatype) => {
  switch (datatype) {
    case 'artikler':
      return [];
    case 'brukere':
      const adminBruker = {
        id: 'admin-' + Date.now(),
        navn: 'Administrator',
        email: 'admin@nyskolen.no',
        password: 'admin123',
        rolle: 'admin',
        godkjent: true,
        opprettet: new Date().toISOString()
      };
      return [adminBruker];
    case 'jobbliste':
      return [
        {
          id: 'jobb-1',
          navn: 'Administrator',
          rolle: 'Redaktør',
          dato: new Date().toISOString()
        }
      ];
    case 'kategoriliste':
      return [
        { id: 'kat-1', kategori: 'Nyheter', ansvarlig: 'Administrator' },
        { id: 'kat-2', kategori: 'Kultur', ansvarlig: 'Administrator' },
        { id: 'kat-3', kategori: 'Sport', ansvarlig: 'Administrator' },
        { id: 'kat-4', kategori: 'Skole', ansvarlig: 'Administrator' },
        { id: 'kat-5', kategori: 'Saksmøtet', ansvarlig: 'Administrator' },
        { id: 'kat-6', kategori: 'Meninger', ansvarlig: 'Administrator' },
        { id: 'kat-7', kategori: 'Heureka', ansvarlig: 'Administrator' },
        { id: 'kat-8', kategori: 'Klassen', ansvarlig: 'Administrator' },
        { id: 'kat-9', kategori: 'Annet', ansvarlig: 'Administrator' }
      ];
    case 'websiteSettings':
      return {
        lockdown: false,
        fullLockdown: false,
        note: ""
      };
    default:
      return null;
  }
};

// Funksjon for å eksportere alle data til JSON filer
export const exporterAlleData = async () => {
  try {
    const data = {
      artikler: lastLokalt('artikler') || [],
      brukere: lastLokalt('brukere') || [],
      jobbliste: lastLokalt('jobbliste') || [],
      kategoriliste: lastLokalt('kategoriliste') || [],
      websiteSettings: lastLokalt('websiteSettings') || {}
    };
    
    // Oppretter en JSON-fil for nedlasting
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Lager en lenke og klikker på den
    const a = document.createElement('a');
    a.href = url;
    a.download = `nyskolen_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Rydder opp
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
    
    return { success: true };
  } catch (error) {
    console.error('Feil ved eksportering av data:', error);
    return { success: false, error: error.message };
  }
};

// Funksjon for å importere data fra JSON-fil
export const importerData = async (filData) => {
  try {
    const data = JSON.parse(filData);
    
    // Sjekk om dataen inneholder forventede felter
    if (!data.artikler || !data.brukere || !data.jobbliste || !data.kategoriliste) {
      throw new Error('Filen inneholder ikke gyldig data for Nyskolen Posten');
    }
    
    // Lagre dataene i localStorage
    lagreLokalt('artikler', data.artikler);
    lagreLokalt('brukere', data.brukere);
    lagreLokalt('jobbliste', data.jobbliste);
    lagreLokalt('kategoriliste', data.kategoriliste);
    
    // Lagre websiteSettings hvis det finnes
    if (data.websiteSettings) {
      lagreLokalt('websiteSettings', data.websiteSettings);
    }
    
    // Trigger en event slik at komponentene kan oppdatere seg
    window.dispatchEvent(new Event('storage'));
    
    return { success: true };
  } catch (error) {
    console.error('Feil ved importering av data:', error);
    return { success: false, error: error.message };
  }
};

// Funksjon for å laste inn data basert på datatype
export const lastData = (datatype) => {
  try {
    const data = lastLokalt(datatype);
    if (data) {
      return { success: true, data: data };
    } else {
      // Hvis ingen data finnes, last inn startdata
      const startdata = lastStartdata(datatype);
      lagreLokalt(datatype, startdata);
      return { success: true, data: startdata };
    }
  } catch (error) {
    console.error(`Feil ved lasting av ${datatype}:`, error);
    return { success: false, error: error.message };
  }
};

// Funksjon for å lagre data
export const lagreData = (datatype, data) => {
  try {
    lagreLokalt(datatype, data);
    return { success: true };
  } catch (error) {
    console.error(`Feil ved lagring av ${datatype}:`, error);
    return { success: false, error: error.message };
  }
}; 