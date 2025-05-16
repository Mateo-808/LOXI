import { supabase } from '../db/supabase.js';

export async function loginUser(correo, contrasena) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: correo,
    password: contrasena
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, user: data.user };
}