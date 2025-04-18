import { supabase } from '../db/supabase.js';

export async function loginUser(correo, contrasena) {
  const { data: user, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('correo', correo)
    .eq('contrasena', contrasena)
    .single();

  if (error || !user) {
    return { ok: false, error: 'Correo o contraseña incorrectos' };
  }

  return { ok: true, user };
}
