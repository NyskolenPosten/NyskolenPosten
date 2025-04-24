import { createClient } from '@supabase/supabase-js'

// For lokal utvikling
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

// Opprett én enkelt Supabase-klient med forbedret konfigurasjon
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'nyskolen-posten-auth'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  db: {
    schema: 'public'
  }
})

// Eksporter én enkelt instans
export { supabase }

// Hjelpefunksjon for å sjekke autentisering
export const sjekkAuth = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  } catch (error) {
    console.error('Autentiseringsfeil:', error)
    return null
  }
}

// Hjelpefunksjon for å initialisere website_settings
export const initialiserWebsiteSettings = async () => {
  try {
    const { data, error } = await supabase
      .from('website_settings')
      .select('*')
      .single()

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
        .single()

      if (insertError) throw insertError
      return newData
    }

    return data
  } catch (error) {
    console.error('Feil ved initialisering av website_settings:', error)
    return null
  }
}

// Hjelpefunksjoner for autentisering
export const auth = {
  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  getSession: async () => {
    const { data, error } = await supabase.auth.getSession()
    return { data, error }
  }
}

// Hjelpefunksjoner for database
export const db = {
  // Artikler
  getArticles: async () => {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  createArticle: async (article) => {
    const { data, error } = await supabase
      .from('articles')
      .insert([article])
      .select()
    return { data, error }
  },

  updateArticle: async (id, updates) => {
    const { data, error } = await supabase
      .from('articles')
      .update(updates)
      .eq('id', id)
      .select()
    return { data, error }
  },

  deleteArticle: async (id) => {
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id)
    return { error }
  },

  // Brukere
  getUsers: async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
    return { data, error }
  },

  updateUser: async (id, updates) => {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
    return { data, error }
  }
} 