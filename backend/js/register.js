import { supabase } from '../db/supabase.js';

export async function signUpUser(nombre, correo, contrasena) {
  const { data: existingUser, error: fetchError } = await supabase
    .from('usuarios')
    .select('*')
    .eq('correo', correo)
    .single();

  if (existingUser) {
    return { ok: false, error: 'El correo ya está registrado' };
  }

  const { data, error } = await supabase
    .from('usuarios')
    .insert([{ nombre, correo, contrasena }]);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, data };
}
