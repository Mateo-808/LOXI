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

    // Obtener nivel y puntos desde la tabla 'progreso' usando el id del usuario
    const { data: progreso, error: errorProgreso } = await supabase
      .from('progreso')
      .select('nivel, puntos')
      .eq('usuario_id', usuario.id)
      .single();

    if (errorProgreso || !progreso) throw new Error('No se encontró progreso para este usuario');

    // Excluir contraseña y unir datos
    const { contrasena: _, ...usuarioSinContrasena } = usuario;

    return {
      ok: true,
      usuario: {
        ...usuarioSinContrasena,
        ...progreso
      }
    };

  } catch (err) {
    return { ok: false, error: err.message };
  }
}
