// login.js
import { supabase } from '../db/supabase.js';
import bcrypt from 'bcryptjs';

export async function loginUsuario(nombre, correo, contrasena) {
  try {
    const { data: usuario, error: errorUsuario } = await supabase
      .from('usuarios')
      .select('id, nombre, correo, contrasena')
      .eq('correo', correo)
      .single();

    if (errorUsuario || !usuario) throw new Error('Correo no registrado');

    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!contrasenaValida) throw new Error('Contraseña incorrecta');

    // Verificar o crear progreso
    let { data: progreso, error: errorProgreso } = await supabase
      .from('progreso')
      .select('nivel, puntos')
      .eq('usuario_id', usuario.id)
      .maybeSingle();

    if (!progreso) {
      // Crear progreso inicial
      const { data: nuevoProgreso } = await supabase
        .from('progreso')
        .insert({
          usuario_id: usuario.id,
          nivel: 'Novato',
          puntos: 0
        })
        .select()
        .single();

      progreso = nuevoProgreso;
    }

    const { contrasena: _, ...usuarioSinContrasena } = usuario;

    return {
      ok: true,
      usuario: {
        ...usuarioSinContrasena,
        nivel: progreso.nivel,
        puntos: progreso.puntos
      }
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
