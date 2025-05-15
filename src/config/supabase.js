import { createClient } from '@supabase/supabase-js'

// Sjekk om vi kjører på GitHub Pages
const isGithubPages = window.location.hostname.includes('github.io');
// Bestem URL basert på miljø - lokal eller produksjon
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
export const supabaseUrl = isLocalhost ? 'http://127.0.0.1:54321' : 'https://lucbodhuwimhqnvtmdzg.supabase.co';
export const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Lag en singleton-instans for å unngå "Multiple GoTrueClient instances" advarsel
let supabaseInstance = null;

// Sjekk om vi er i produksjonsmiljø
const isProd = process.env.NODE_ENV === 'production';

// Feilhåndtering og logging for Supabase
const handleSupabaseError = (error, operation = 'Supabase operation') => {
  // I produksjon, begrens logging til konsollen
  if (isProd) {
    // Bare logg operasjonen som feilet, ikke hele feilstacken
    console.warn(`${operation} feilet. Bruker fallback.`);
    return;
  }
  
  // I utvikling, logg detaljert feilinformasjon
  console.error(`${operation} feilet:`, error);
};

// Opprett en fallback-klient som returnerer tomme data og ingen feil
const createFallbackClient = () => {
  const mockResponse = { data: null, error: null };
  const emptyArrayResponse = { data: [], error: null };
  
  // Simulerer en ekte returverdi for artikler
  const mockArticles = [
    {
      id: 'fallback-1',
      artikkelID: 'local-' + Date.now().toString(36),
      tittel: 'Feilsikker fallback-artikkel',
      innhold: 'Denne artikkelen vises når vi ikke kan koble til Supabase.',
      forfatter: 'Systemet',
      forfatterID: 'system',
      kategori: 'system',
      dato: new Date().toISOString(),
      godkjent: true,
      created_at: new Date().toISOString()
    }
  ];
  
  // Funksjon for å returnere mock-artikler
  const artikkelTabell = {
    select: () => ({
      order: () => Promise.resolve({ data: mockArticles, error: null }),
      eq: () => Promise.resolve({ data: mockArticles[0], error: null }),
      single: () => Promise.resolve({ data: mockArticles[0], error: null }),
    }),
    insert: () => Promise.resolve({ 
      data: { ...mockArticles[0], id: 'new-' + Date.now().toString(36) }, 
      error: null 
    }),
    update: () => Promise.resolve({ data: mockArticles[0], error: null }),
    delete: () => Promise.resolve({ error: null }),
  };
  
  // Funksjon for å returnere mock-brukere
  const brukerTabell = {
    select: () => ({
      eq: () => Promise.resolve({ 
        data: { id: 'local-user', navn: 'Lokal Bruker', rolle: 'bruker', godkjent: true }, 
        error: null 
      }),
      single: () => Promise.resolve({ 
        data: { id: 'local-user', navn: 'Lokal Bruker', rolle: 'bruker', godkjent: true }, 
        error: null 
      }),
    }),
    insert: () => Promise.resolve({ 
      data: { id: 'new-user-' + Date.now().toString(36), navn: 'Ny Bruker', rolle: 'bruker' }, 
      error: null 
    }),
    update: () => Promise.resolve({ data: { id: 'local-user', navn: 'Oppdatert Bruker' }, error: null }),
    delete: () => Promise.resolve({ error: null }),
  };
  
  // Standard tabelloperasjoner
  const defaultTabellOperasjoner = {
    select: () => ({
      eq: () => Promise.resolve(mockResponse),
      single: () => Promise.resolve(mockResponse),
      order: () => Promise.resolve(emptyArrayResponse),
    }),
    insert: () => Promise.resolve(mockResponse),
    update: () => Promise.resolve(mockResponse),
    delete: () => Promise.resolve({ error: null }),
  };
  
  return {
    // Mer realistisk from() metode som returnerer tabell-spesifikk funksjonalitet
    from: (tabell) => {
      if (tabell === 'artikler') return artikkelTabell;
      if (tabell === 'brukere') return brukerTabell;
      return defaultTabellOperasjoner;
    },
    
    auth: {
      getSession: () => Promise.resolve({ 
        data: { 
          session: { 
            user: { id: 'offline-user', email: 'offline@example.com' } 
          } 
        }, 
        error: null 
      }),
      getUser: () => Promise.resolve({ 
        data: { 
          user: { id: 'offline-user', email: 'offline@example.com' } 
        }, 
        error: null 
      }),
      signUp: () => Promise.resolve({ 
        data: { user: { id: 'new-user', email: 'new@example.com' } }, 
        error: null 
      }),
      signInWithPassword: () => Promise.resolve({ 
        data: { 
          user: { id: 'offline-user', email: 'offline@example.com' },
          session: { access_token: 'mock-token' }
        }, 
        error: null 
      }),
      signOut: () => Promise.resolve({ error: null }),
      resetPasswordForEmail: () => Promise.resolve({ error: null }),
      // Legg til onAuthStateChange-funksjon
      onAuthStateChange: (callback) => {
        // Kall callback med simulert påloggingsstatus
        setTimeout(() => {
          callback('SIGNED_IN', { 
            user: { id: 'offline-user', email: 'offline@example.com' }
          });
        }, 10);
        
        // Returner et fiktivt abonnement
        return { 
          data: { 
            subscription: {
              unsubscribe: () => {}, // Tom funksjon som ikke gjør noe
            }
          }
        };
      }
    },
    // Legg til supabaseUrl som en egenskap for konsekvens med vanlig klient
    supabaseUrl,
  };
};

const getSupabase = () => {
  if (supabaseInstance) return supabaseInstance;
  
  // Hvis vi er på GitHub Pages, bruk alltid fallback-klienten for å unngå CORS-feil
  if (isGithubPages) {
    if (!isProd) {
      console.log('GitHub Pages detektert - bruker offline fallback for Supabase');
    }
    return createFallbackClient();
  }
  
  try {
    // Definere headers for å håndtere 406-feil
    const customHeaders = {
      'X-Client-Info': 'NyskolenPosten',
      'Content-Type': 'application/json',
      'Accept': '*/*',
      'Prefer': 'return=representation',
      'Accept-Profile': 'public',
      'Accept-Encoding': 'gzip, deflate, br'
    };
    
    supabaseInstance = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storageKey: 'nyskolenposten-auth'
      },
      global: {
        headers: customHeaders
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      },
      // Bruk pålitelig fetch-oppsett med retries
      fetch: {
        handleError: false  // La oss håndtere feil manuelt
      },
      db: {
        schema: 'public' // Angi schema eksplisitt
      }
    });
    
    return supabaseInstance;
  } catch (error) {
    handleSupabaseError(error, 'Initialisering av Supabase-klient');
    
    // Returner en mock-klient som ikke gjør noe skadelig
    return createFallbackClient();
  }
};

// Eksporter én enkelt instans
export const supabase = getSupabase();

// Hjelpefunksjon for å sjekke autentisering
export const sjekkAuth = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    handleSupabaseError(error, 'Autentiseringssjekk');
    return null;
  }
};

// Hjelpefunksjon for å initialisere website_settings
export const initialiserWebsiteSettings = async () => {
  try {
    const { data, error } = await supabase
      .from('website_settings')
      .select('*')
      .single();

    if (error && error.code === 'PGRST116') {
      // Opprett standardinnstillinger hvis tabellen er tom
      const { data: newData, error: insertError } = await supabase
        .from('website_settings')
        .insert([{
          id: 1,
          lockdown: false,
          full_lockdown: false,
          note: "",
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (insertError) throw insertError;
      return newData;
    }

    return data;
  } catch (error) {
    handleSupabaseError(error, 'Initialisering av website_settings');
    
    // Returner standardinnstillinger hvis noe går galt
    return {
      id: 1,
      lockdown: false,
      full_lockdown: false,
      note: "",
      updated_at: new Date().toISOString()
    };
  }
};

// Hjelpefunksjoner for autentisering
export const auth = {
  signUp: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      return { data, error };
    } catch (error) {
      handleSupabaseError(error, 'Brukerregistrering');
      return { data: null, error: { message: 'Kunne ikke registrere bruker' } };
    }
  },

  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    } catch (error) {
      handleSupabaseError(error, 'Innlogging');
      return { data: null, error: { message: 'Kunne ikke logge inn' } };
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      handleSupabaseError(error, 'Utlogging');
      return { error: { message: 'Kunne ikke logge ut' } };
    }
  },

  getSession: async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      return { data, error };
    } catch (error) {
      handleSupabaseError(error, 'Henting av sesjon');
      return { data: { session: null }, error: null };
    }
  }
};

// Hjelpefunksjoner for database
export const db = {
  // Artikler
  getArticles: async () => {
    try {
      const { data, error } = await supabase
        .from('artikler')
        .select('*')
        .order('created_at', { ascending: false });
      return { data, error };
    } catch (error) {
      handleSupabaseError(error, 'Henting av artikler');
      return { data: [], error: null };
    }
  },

  createArticle: async (article) => {
    try {
      const { data, error } = await supabase
        .from('artikler')
        .insert([article])
        .select();
      return { data, error };
    } catch (error) {
      handleSupabaseError(error, 'Oppretting av artikkel');
      return { data: null, error: { message: 'Kunne ikke opprette artikkel' } };
    }
  },

  updateArticle: async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('artikler')
        .update(updates)
        .eq('id', id)
        .select();
      return { data, error };
    } catch (error) {
      handleSupabaseError(error, 'Oppdatering av artikkel');
      return { data: null, error: { message: 'Kunne ikke oppdatere artikkel' } };
    }
  },

  deleteArticle: async (id) => {
    try {
      const { error } = await supabase
        .from('artikler')
        .delete()
        .eq('id', id);
      return { error };
    } catch (error) {
      handleSupabaseError(error, 'Sletting av artikkel');
      return { error: { message: 'Kunne ikke slette artikkel' } };
    }
  },

  // Brukere
  getUsers: async () => {
    try {
      const { data, error } = await supabase
        .from('brukere')
        .select('*');
      return { data, error };
    } catch (error) {
      handleSupabaseError(error, 'Henting av brukere');
      return { data: [], error: null };
    }
  },

  updateUser: async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('brukere')
        .update(updates)
        .eq('id', id)
        .select();
      return { data, error };
    } catch (error) {
      handleSupabaseError(error, 'Oppdatering av bruker');
      return { data: null, error: { message: 'Kunne ikke oppdatere bruker' } };
    }
  }
}; 