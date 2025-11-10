import { supabase } from '../db/supabase.js';
import bcrypt from 'bcryptjs';

export async function loginUsuario(nombre, correo, contrasena) {
  try {
    const { data: usuario, error: errorUsuario } = await supabase
      .from('usuarios')
      .select('id, nombre, correo, contrasena, es_admin')
      .eq('correo', correo)
      .single();

    if (errorUsuario || !usuario) throw new Error('Correo no registrado');

    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!contrasenaValida) throw new Error('Contraseña incorrecta');

    const { data: progresos } = await supabase
      .from('progreso')
      .select('nivel, puntos, fecha')
      .eq('usuario_id', usuario.id)
      .order('fecha', { ascending: false })
      .limit(1);

    const progreso = progresos?.[0];
    const nivel = progreso?.nivel ?? 'novato';
    const puntos = progreso?.puntos ?? 0;
    const fecha = progreso?.fecha ?? null;

    return {
      ok: true,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        nivel,
        puntos,
        fecha,
        es_admin: usuario.es_admin === true,
      },
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
