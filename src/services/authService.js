import { supabase } from '../config/supabase';

// Autentiseringsfunksjoner
export const signUp = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error signing up:', error.message);
    throw error;
  }
};

export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error signing in:', error.message);
    throw error;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Error signing out:', error.message);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Error getting current user:', error.message);
    throw error;
  }
};

export const resetPassword = async (email) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  } catch (error) {
    console.error('Error resetting password:', error.message);
    throw error;
  }
};

// Brukerprofilfunksjoner
export const updateUserProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user profile:', error.message);
    throw error;
  }
};

export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting user profile:', error.message);
    throw error;
  }
};

export const hentAlleBrukere = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting all users:', error.message);
    throw error;
  }
};

export const loggUt = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Error logging out:', error.message);
    throw error;
  }
};

// Logg inn eksisterende bruker
export const loggInn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    if (!data.user) {
      return { success: false, error: 'Ingen bruker funnet' };
    }
    
    // Hent brukerens metadata fra Supabase
    const { data: userData, error: userError } = await supabase
      .from('brukere')
      .select('*')
      .eq('id', data.user.id)
      .single();
      
    // Hvis brukeren ikke finnes i brukere-tabellen, opprett en ny bruker
    if (userError && userError.code === 'PGRST116') {
      const { error: insertError } = await supabase
        .from('brukere')
        .insert([
          {
            id: data.user.id,
            navn: data.user.email.split('@')[0],
            rolle: 'bruker',
            godkjent: false
          }
        ]);
        
      if (insertError) {
        console.error('Error creating user profile:', insertError);
        return { success: false, error: 'Kunne ikke opprette brukerprofil' };
      }
      
      // Hent den nylig opprettede brukeren
      const { data: newUserData } = await supabase
        .from('brukere')
        .select('*')
        .eq('id', data.user.id)
        .single();
        
      return {
        success: true,
        bruker: {
          id: data.user.id,
          email: data.user.email,
          navn: newUserData.navn,
          rolle: newUserData.rolle,
          godkjent: newUserData.godkjent,
          klasse: newUserData.klasse
        }
      };
    }
    
    if (userError) {
      console.error('Error fetching user data:', userError);
      return { success: false, error: 'Kunne ikke hente brukerdata' };
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
    console.error('Error logging in:', error);
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
      ])
      .select()
      .single();
    
    if (brukerError) {
      console.error('Error creating user profile:', brukerError);
      return { success: false, error: 'Kunne ikke opprette brukerprofil' };
    }
    
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
  } catch (error) {
    console.error('Error registering user:', error.message);
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

    // Opprett brukerprofil i profiles-tabellen
    const { data: profileData, error: profileError } = await supabase
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
  } catch (error) {
    console.error('Error creating user with role:', error.message);
    return { success: false, error: error.message };
  }
}; 