import { supabase } from '../db/supabase.js';
import bcrypt from 'bcryptjs';

export async function loginUsuario(nombre, correo, contrasena) {
  try {
    // Buscar al usuario por correo
    const { data: usuario, error: errorUsuario } = await supabase
      .from('usuarios')
      .select('id, nombre, correo, contrasena')
      .eq('correo', correo)
      .single();

    if (errorUsuario || !usuario) throw new Error('Correo no registrado');

    // Verificar contraseña
    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!contrasenaValida) throw new Error('Contraseña incorrecta');

    // Intentar obtener progreso
    const { data: progreso, error: errorProgreso } = await supabase
      .from('progreso')
      .select('nivel, puntos')
      .eq('usuario_id', usuario.id)
      .maybeSingle(); // <- importante para que no lance error si no hay resultado

    // Si no hay progreso, asignar valores por defecto
    const nivel = progreso?.nivel ?? 'novato';
    const puntos = progreso?.puntos ?? 0;

    // Excluir contraseña
    const { contrasena: _, ...usuarioSinContrasena } = usuario;

    return {
      ok: true,
      usuario: {
        ...usuarioSinContrasena,
        nivel,
        puntos
      }
    };

  } catch (err) {
    return { ok: false, error: err.message };
  }
}
