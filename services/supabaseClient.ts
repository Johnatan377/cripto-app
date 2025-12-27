
import { createClient } from '@supabase/supabase-js';

// No ambiente de desenvolvimento (Vite), usamos import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Mock para evitar crash caso as chaves não existam
// Mock robusto para evitar crash em chamadas encadeadas
const createMockSupabase = () => {
  const chainable = () => ({
    select: () => chainable(),
    insert: () => chainable(),
    update: () => chainable(),
    upsert: () => chainable(),
    delete: () => chainable(),
    eq: () => chainable(),
    order: () => chainable(),
    limit: () => chainable(),
    single: async () => ({ data: null, error: null }),
    maybeSingle: async () => ({ data: null, error: null }),
    match: () => chainable(),
  });

  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
      signInWithOAuth: async () => ({ data: {}, error: new Error("Modo Offline") }),
      signInWithOtp: async () => ({ data: {}, error: new Error("Modo Offline") }),
      signInWithPassword: async () => ({ data: {}, error: new Error("Modo Offline") }), // Add this
      signUp: async () => ({ data: {}, error: new Error("Modo Offline") }), // Add this
      resetPasswordForEmail: async () => ({ data: {}, error: new Error("Modo Offline") }), // Add this
      updateUser: async () => ({ data: {}, error: new Error("Modo Offline") }), // Add this
      signOut: async () => ({ error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
    },
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: new Error("Modo Offline: Configure VITE_SUPABASE_URL e Key para fazer upload.") }),
        getPublicUrl: () => ({ data: { publicUrl: "http://mock-url/file.pdf" } }),
      }),
    },
    from: () => chainable(),
  };
};

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockSupabase() as any;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase: URL ou Anon Key ausentes. O app está rodando em modo offline/mock.");
}
