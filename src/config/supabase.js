import { createClient } from '@supabase/supabase-js'

// For lokal utvikling
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'http://localhost:54321'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilMk4dQy0x5Y'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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