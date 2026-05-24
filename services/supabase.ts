import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// ─── Chaves carregadas do .env (nunca hardcoded) ──────────────────────────────
const SUPABASE_URL      = process.env.EXPO_PUBLIC_SUPABASE_URL      ?? '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

// ─── Adaptador seguro: substitui AsyncStorage por SecureStore ─────────────────
// SecureStore usa Keychain (iOS) e EncryptedSharedPreferences (Android),
// mantendo o token de sessão criptografado em repouso no dispositivo.
const SecureStoreAdapter = {
  getItem:    (key: string)                => SecureStore.getItemAsync(key),
  setItem:    (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string)                => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage:          SecureStoreAdapter,
    autoRefreshToken: true,
    persistSession:   true,
    detectSessionInUrl: false,
  },
});
