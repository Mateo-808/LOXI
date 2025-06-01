import { supabase } from '../db/supabase.js';
import bcrypt from 'bcryptjs';

export async function registrarUsuario({ nombre, correo, contrasena }) {
  try {
    const { data: existente } = await supabase
      .from('usuarios')
      .select('id')
      .eq('correo', correo)
      .single();

    if (existente) throw new Error('El correo ya está registrado');

    const salt = await bcrypt.genSalt(10);
    const contrasenaEncriptada = await bcrypt.hash(contrasena, salt);

    const { data, error } = await supabase.from('usuarios').insert([
      {
        nombre,
        correo,
        contrasena: contrasenaEncriptada,
        fecha_registro: new Date().toISOString(),
      },
    ]);

    if (error) throw error;

    return data;
  } catch (err) {
    throw new Error(err.message);
  }
}
