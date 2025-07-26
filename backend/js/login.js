import { supabase } from '../db/supabase.js';
import bcrypt from 'bcryptjs';

export async function loginUsuario(nombre, correo, contrasena) {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nombre, correo, nivel, puntos, contrasena') 
      .eq('correo', correo)
      .single();

    if (error || !data) throw new Error('Correo no registrado');

    const contrasenaValida = await bcrypt.compare(contrasena, data.contrasena);
    if (!contrasenaValida) throw new Error('Contraseña incorrecta');

    // Excluimos contrasena del retorno para no exponerla
    const { contrasena: _, ...usuarioSinContrasena } = data;

    return {
      ok: true,
      usuario: usuarioSinContrasena
    };

  } catch (err) {
    return { ok: false, error: err.message };
  }
}
