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

    // Verificar contraseña
    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!contrasenaValida) throw new Error('Contraseña incorrecta');

    // Obtener el progreso más reciente
    const { data: progresos, error: errorProgreso } = await supabase
      .from('progreso')
      .select('nivel, puntos, fecha')
      .eq('usuario_id', usuario.id)
      .order('fecha', { ascending: false }) 
      .limit(1);

    const progreso = progresos?.[0];

    // Valores por defecto si no hay progreso
    const nivel = progreso?.nivel ?? 'novato';
    const puntos = progreso?.puntos ?? 0;
    const fecha = progreso?.fecha ?? null;

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('usuario', JSON.stringify({
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        es_admin: usuario.es_admin || false,
        nivel,
        puntos,
        fecha 
      }));
    }

    const serverUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
      ? 'http://localhost:3000'
      : 'https://loxi.onrender.com';

    const datosAEnviar = {
      usuario_id: usuario.id,
      ejercicio_id: '7c1a8ae1-a72e-4a4f-9efb-5a7be07a8b3a',
      completado: true,
      puntuacion: puntos,
      nivel: nivel,
      intentos: 1,
      upsert: true
    };

    await fetch(`${serverUrl}/api/progreso`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosAEnviar)
    });

    // Excluir contraseña antes de retornar
    const { contrasena: _, ...usuarioSinContrasena } = usuario;

    return {
      ok: true,
      usuario: {
        ...usuarioSinContrasena,
        nivel,
        puntos,
        fecha
      }
    };

  } catch (err) {
    return { ok: false, error: err.message };
  }
}