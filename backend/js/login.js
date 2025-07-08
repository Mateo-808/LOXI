import { supabase } from '../db/supabase.js';
import bcrypt from 'bcryptjs';

export async function loginUsuario(nombre, correo, contrasena) {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('nombre', nombre)
      .eq('correo', correo)
      .single();

    if (error || !data) throw new Error('Correo no registrado');

    if (data.nombre !== nombre) throw new Error('Nombre no coincide con el registrado');

    const contrasenaValida = await bcrypt.compare(contrasena, data.contrasena);
    if (!contrasenaValida) throw new Error('Contraseña incorrecta');

    return { ok: true, usuario: data };
  } catch (err) {
    console.error('Login error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: false, error: err.message }));
}
}