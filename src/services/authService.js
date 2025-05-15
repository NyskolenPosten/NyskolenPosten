import { supabase } from '../config/supabase';

// Sjekk om vi er i produksjonsmiljø
const isProd = process.env.NODE_ENV === 'production';

// Feilhåndtering
const handleError = (error, operation = 'Autentisering') => {
  // I produksjon, begrens logging
  if (isProd) {
    console.warn(`${operation} feilet. Bruker fallback.`);
    return;
  }
  
  // I utvikling, gi mer informasjon
  console.error(`${operation} feilet:`, error);
};

// Sett en timeout for asynkrone kall
const withTimeout = (promise, timeoutMs = 5000, operationName = 'Operasjon') => {
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error(`Tidsavbrudd for ${operationName}`)), timeoutMs)
  );
  
  return Promise.race([promise, timeoutPromise]);
};

// Autentiseringsfunksjoner
export const signUp = async (email, password) => {
  try {
    const authPromise = supabase.auth.signUp({
      email,
      password,
    });
    
    const { data, error } = await withTimeout(authPromise, 8000, 'registrering');
    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error, 'Registrering');
    throw error;
  }
};

export const signIn = async (email, password) => {
  try {
    const authPromise = supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    const { data, error } = await withTimeout(authPromise, 8000, 'innlogging');
    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error, 'Innlogging');
    throw error;
  }
};

export const signOut = async () => {
  try {
    // Sjekk om vi kjører på GitHub Pages
    const isGitHubPages = window.location.hostname.includes('github.io');
    
    // På GitHub Pages, hopp over Supabase-kall og gjør bare lokal utlogging
    if (isGitHubPages) {
      renseBrukerData();
      return;
    }
    
    const { error } = await withTimeout(supabase.auth.signOut(), 5000, 'utlogging');
    if (error) throw error;
  } catch (error) {
    handleError(error, 'Utlogging');
    // Ikke kast feilen videre - bare la utloggingen skje uansett
    // Sørg for at lokale data blir slettet
    renseBrukerData();
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await withTimeout(supabase.auth.getUser(), 5000, 'henting av bruker');
    if (error) throw error;
    return user;
  } catch (error) {
    handleError(error, 'Henting av gjeldende bruker');
    return null;
  }
};

export const resetPassword = async (email) => {
  try {
    const { error } = await withTimeout(
      supabase.auth.resetPasswordForEmail(email),
      5000,
      'tilbakestilling av passord'
    );
    if (error) throw error;
  } catch (error) {
    handleError(error, 'Tilbakestilling av passord');
    throw error;
  }
};

// Brukerprofilfunksjoner
export const updateUserProfile = async (userId, updates) => {
  try {
    const { data, error } = await withTimeout(
      supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId),
      5000,
      'oppdatering av brukerprofil'
    );
    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error, 'Oppdatering av brukerprofil');
    throw error;
  }
};

export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await withTimeout(
      supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single(),
      5000,
      'henting av brukerprofil'
    );
    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error, 'Henting av brukerprofil');
    throw error;
  }
};

export const hentAlleBrukere = async () => {
  try {
    const { data, error } = await withTimeout(
      supabase
        .from('profiles')
        .select('*'),
      5000,
      'henting av brukere'
    );
    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error, 'Henting av brukere');
    return [];
  }
};

export const loggUt = async () => {
  try {
    // Sjekk om vi kjører på GitHub Pages
    const isGitHubPages = window.location.hostname.includes('github.io');
    
    // Prøv å logge ut via Supabase, men sett kort timeout på GitHub Pages
    const timeoutMs = isGitHubPages ? 1000 : 5000; // Kortere timeout på GitHub Pages
    
    const { error } = await withTimeout(supabase.auth.signOut(), timeoutMs, 'utlogging');
    
    // Hvis vi får feil, eller kjører på GitHub Pages, sørg for manuell utlogging
    if (error || isGitHubPages) {
      // Manuell opprydding av lokal lagring
      renseBrukerData();
      return { success: true };
    }
    
    return { success: true };
  } catch (error) {
    handleError(error, 'Utlogging');
    
    // Garanterer at brukeren blir logget ut selv hvis Supabase-kallet feiler
    renseBrukerData();
    
    // Returnerer suksess selv om det var en Supabase-feil
    // siden brukeren effektivt er logget ut lokalt
    return { success: true };
  }
};

// Hjelpefunksjon for å rense alle brukerdata fra lokale lagring
const renseBrukerData = () => {
  // Fjern all brukerrelatert data fra localStorage
  localStorage.removeItem('nyskolenposten-auth');
  localStorage.removeItem('innloggetBruker');
  localStorage.removeItem('currentUser');
  
  // Utløs en event for å varsle andre faner om utlogging
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'innloggetBruker',
    newValue: null
  }));
};

// Logg inn eksisterende bruker
export const loggInn = async (email, password) => {
  try {
    const { data, error } = await withTimeout(
      supabase.auth.signInWithPassword({
        email,
        password,
      }),
      8000,
      'innlogging'
    );
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    if (!data.user) {
      return { success: false, error: 'Ingen bruker funnet' };
    }
    
    // Hent brukerens metadata fra Supabase
    const { data: userData, error: userError } = await withTimeout(
      supabase
        .from('brukere')
        .select('*')
        .eq('id', data.user.id)
        .single(),
      5000,
      'henting av brukerdata'
    );
      
    // Hvis brukeren ikke finnes i brukere-tabellen, opprett en ny bruker
    if (userError && userError.code === 'PGRST116') {
      const { error: insertError } = await withTimeout(
        supabase
          .from('brukere')
          .insert([
            {
              id: data.user.id,
              navn: data.user.email.split('@')[0],
              rolle: 'bruker',
              godkjent: false
            }
          ]),
        5000,
        'opprettelse av brukerprofil'
      );
        
      if (insertError) {
        handleError(insertError, 'Opprettelse av brukerprofil');
        return { success: false, error: 'Kunne ikke opprette brukerprofil' };
      }
      
      // Hent den nylig opprettede brukeren
      try {
        const { data: newUserData } = await withTimeout(
          supabase
            .from('brukere')
            .select('*')
            .eq('id', data.user.id)
            .single(),
          5000,
          'henting av ny brukerprofil'
        );
          
        return {
          success: true,
          bruker: {
            id: data.user.id,
            email: data.user.email,
            navn: newUserData?.navn || data.user.email.split('@')[0],
            rolle: newUserData?.rolle || 'bruker',
            godkjent: newUserData?.godkjent || false,
            klasse: newUserData?.klasse || null
          }
        };
      } catch (fetchError) {
        // Selv om henting feiler, kan vi bruke standard brukerdata
        handleError(fetchError, 'Henting av nyopprettet bruker');
        return {
          success: true,
          bruker: {
            id: data.user.id,
            email: data.user.email,
            navn: data.user.email.split('@')[0],
            rolle: 'bruker',
            godkjent: false,
            klasse: null
          }
        };
      }
    }
    
    if (userError) {
      handleError(userError, 'Henting av brukerdata');
      // Fallback til basis brukerinfo
      return { 
        success: true, 
        bruker: {
          id: data.user.id,
          email: data.user.email,
          navn: data.user.email.split('@')[0],
          rolle: 'bruker',
          godkjent: false,
          klasse: null
        }
      };
    }
    
    // Kombiner auth-data med brukerdata
    const bruker = {
      id: data.user.id,
      email: data.user.email,
      navn: userData?.navn || data.user.email.split('@')[0],
      rolle: userData?.rolle || 'bruker',
      godkjent: userData?.godkjent || false,
      klasse: userData?.klasse || null
    };
    
    return { 
      success: true, 
      bruker 
    };
  } catch (error) {
    handleError(error, 'Innlogging');
    return { success: false, error: error.message || 'Innlogging feilet' };
  }
};

export const registrerBruker = async (email, password, navn, klasse) => {
  try {
    // Registrer brukeren i auth systemet
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: 'Kunne ikke opprette brukeren' };
    }
    
    // Opprett brukerprofil i brukere-tabellen
    try {
      // Bruk trygg metode for å unngå chaining-feil
      const { data: brukerData, error: brukerError } = await supabase
        .from('brukere')
        .insert([
          {
            id: data.user.id,
            navn: navn,
            rolle: 'bruker',
            godkjent: false,
            klasse: klasse
          }
        ]);
      
      if (brukerError) {
        console.error('Feil ved opprettelse av brukerprofil:', brukerError);
        return { success: false, error: 'Kunne ikke opprette brukerprofil' };
      }
      
      // Hent brukeren for å returnere til klienten
      const bruker = {
        id: data.user.id,
        email: email,
        navn: navn,
        rolle: 'bruker',
        godkjent: false,
        klasse: klasse
      };
      
      return {
        success: true,
        bruker: bruker
      };
    } catch (insertError) {
      console.error('Feil ved insert/select operasjon:', insertError);
      
      // Fallback - fortsett uansett med standard brukerdata
      return {
        success: true,
        bruker: {
          id: data.user.id,
          email: email,
          navn: navn,
          rolle: 'bruker',
          godkjent: false,
          klasse: klasse
        }
      };
    }
  } catch (error) {
    console.error('Feil ved registrering av bruker:', error.message);
    return { success: false, error: error.message };
  }
};

export const opprettBrukerMedRolle = async (email, password, navn, rolle = 'bruker', klasse = null) => {
  try {
    // Registrer brukeren i auth systemet
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (authError) throw authError;
    
    if (!authData || !authData.user) {
      throw new Error('Kunne ikke opprette brukeren i autentiseringssystemet');
    }

    try {
      // Opprett brukerprofil i profiles-tabellen
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            email: email,
            navn: navn,
            rolle: rolle,
            godkjent: true, // Automatisk godkjent siden vi oppretter med spesifikk rolle
            klasse: klasse
          }
        ]);

      if (profileError) throw profileError;

      return {
        success: true,
        bruker: {
          id: authData.user.id,
          email: email,
          navn: navn,
          rolle: rolle,
          godkjent: true,
          klasse: klasse
        }
      };
    } catch (profileError) {
      console.error('Feil ved opprettelse av brukerprofil:', profileError);
      
      // Fortsett likevel med standarddata
      return {
        success: true,
        bruker: {
          id: authData.user.id,
          email: email,
          navn: navn,
          rolle: rolle,
          godkjent: true,
          klasse: klasse
        }
      };
    }
  } catch (error) {
    console.error('Feil ved opprettelse av bruker med rolle:', error.message);
    return { success: false, error: error.message };
  }
}; 