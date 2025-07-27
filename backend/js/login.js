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

    // Verificar si existe progreso
    let { data: progreso, error: errorProgreso } = await supabase
      .from('progreso')
      .select('nivel, puntuacion')
      .eq('usuario_id', usuario.id)
      .single();

    // Si no existe progreso, crearlo con valores por defecto
    if (errorProgreso || !progreso) {
      const { data: nuevoProgreso, error: errorInsert } = await supabase
        .from('progreso')
        .insert({
          usuario_id: usuario.id,
          nivel: 'Novato',
          puntuacion: 0
        })
        .select('nivel, puntuacion')
        .single();

      if (errorInsert) {
        throw new Error('Error al crear progreso del usuario');
      }

      progreso = nuevoProgreso;
    }

    // Excluir contraseña y devolver info
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
