import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://ljvuynddfkgnaagcdvaz.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqdnV5bmRkZmtnbmFhZ2NkdmF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzODYxODYsImV4cCI6MjA5NDk2MjE4Nn0.8cP3toMJkxCMj7bS549P6Hu5mmHP2skxY32LcG8yh24';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
