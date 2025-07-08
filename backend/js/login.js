import { supabase } from '../db/supabase.js';
import bcrypt from 'bcryptjs';

export async function loginUsuario(correo, contrasena) {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('nombre', nombre)
      .eq('correo', correo)
      .single();

    if (error || !data) throw new Error('Correo no registrado');

    if (data.nombre !== nombre) {
      throw new Error('Nombre no coincide con el registrado');
    }

    const contrasenaValida = await bcrypt.compare(contrasena, data.contrasena);
    if (!contrasenaValida) throw new Error('Contraseña incorrecta');

    return { ok: true, usuario: data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}