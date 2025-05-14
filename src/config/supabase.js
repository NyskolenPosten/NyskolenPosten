import { createClient } from '@supabase/supabase-js'

// Bestem URL basert på miljø - lokal eller produksjon
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const supabaseUrl = isLocalhost ? 'http://127.0.0.1:54321' : 'https://lucbodhuwimhqnvtmdzg.supabase.co';
export const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY

// Lag en singleton-instans for å unngå "Multiple GoTrueClient instances" advarsel
let supabaseInstance = null;

const getSupabase = () => {
  if (supabaseInstance) return supabaseInstance;
  
  supabaseInstance = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    global: {
      headers: {
        'x-my-custom-header': 'NyskolenPosten'
      }
    },
    db: {
      schema: 'public'
    }
  });
  
  return supabaseInstance;
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
    console.error('Autentiseringsfeil:', error);
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
    console.error('Feil ved initialisering av website_settings:', error);
    return null;
  }
};

// Hjelpefunksjoner for autentisering
export const auth = {
  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    return { data, error };
  }
};

// Hjelpefunksjoner for database
export const db = {
  // Artikler
  getArticles: async () => {
    const { data, error } = await supabase
      .from('artikler')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  createArticle: async (article) => {
    const { data, error } = await supabase
      .from('artikler')
      .insert([article])
      .select();
    return { data, error };
  },

  updateArticle: async (id, updates) => {
    const { data, error } = await supabase
      .from('artikler')
      .update(updates)
      .eq('id', id)
      .select();
    return { data, error };
  },

  deleteArticle: async (id) => {
    const { error } = await supabase
      .from('artikler')
      .delete()
      .eq('id', id);
    return { error };
  },

  // Brukere
  getUsers: async () => {
    const { data, error } = await supabase
      .from('brukere')
      .select('*');
    return { data, error };
  },

  updateUser: async (id, updates) => {
    const { data, error } = await supabase
      .from('brukere')
      .update(updates)
      .eq('id', id)
      .select();
    return { data, error };
  }
}; 