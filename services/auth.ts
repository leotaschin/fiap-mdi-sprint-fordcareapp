import { supabase } from './supabase';

export async function cadastrar(name: string, email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  if (error) throw error;
  if (!data.session) {
    // signUp returned no session → email confirmation is still enabled in Supabase dashboard
    throw new Error('EMAIL_CONFIRMATION_REQUIRED');
  }
  return data.user;
}

export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function esqueceuSenha(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
}
