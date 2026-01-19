import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Ensures the user has an anonymous session.
 * This is called on app startup to enable RPC functions that require auth.uid().
 */
export async function ensureAnonymousSession() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    const { error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.error('Failed to create anonymous session:', error);
      throw error;
    }
  }
}
