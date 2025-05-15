import { createClient } from '@supabase/supabase-js'

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

const getSupabase = () => {
  if (supabaseInstance) return supabaseInstance;
  
  try {
    // Definere headers for å håndtere 406-feil
    const customHeaders = {
      'X-Client-Info': 'NyskolenPosten',
      'Content-Type': 'application/json',
      'Accept': '*/*',
      'Prefer': 'return=representation'
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
      // Legg til timeouts for å unngå at kall henger
      fetch: {
        handleError: false  // La oss håndtere feil manuelt
      }
    });
    
    return supabaseInstance;
  } catch (error) {
    handleSupabaseError(error, 'Initialisering av Supabase-klient');
    
    // Returner en mock-klient som ikke gjør noe skadelig
    return createFallbackClient();
  }
};

// Opprett en fallback-klient som returnerer tomme data og ingen feil
const createFallbackClient = () => {
  const mockResponse = { data: null, error: null };
  
  return {
    from: () => ({
      select: () => ({
        eq: () => Promise.resolve(mockResponse),
        single: () => Promise.resolve(mockResponse),
        order: () => Promise.resolve(mockResponse),
        delete: () => Promise.resolve(mockResponse),
        update: () => Promise.resolve(mockResponse),
        insert: () => Promise.resolve(mockResponse),
      }),
      insert: () => Promise.resolve(mockResponse),
      update: () => Promise.resolve(mockResponse),
      delete: () => Promise.resolve(mockResponse),
    }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signUp: () => Promise.resolve(mockResponse),
      signInWithPassword: () => Promise.resolve(mockResponse),
      signOut: () => Promise.resolve(mockResponse),
      resetPasswordForEmail: () => Promise.resolve(mockResponse),
    },
    // Legg til supabaseUrl som en egenskap for konsekvens med vanlig klient
    supabaseUrl,
  };
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