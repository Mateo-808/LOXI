export async function loginUsuario(nombre, correo, contrasena) {
  try {
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('correo', correo)
      .single();
      
    if (error || !usuario) throw new Error('Correo no registrado');

    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!contrasenaValida) throw new Error('Contraseña incorrecta');

    // Obtener cantidad de ejercicios completados por el usuario = nivel
    const { count, error: errorNivel } = await supabase
      .from('progreso')
      .select('*', { count: 'exact', head: true })
      .eq('usuario_id', usuario.id)
      .eq('completado', true);

    usuario.nivel = errorNivel ? 0 : count;

    // También puedes sumar puntuación total si quieres
    const { data: puntosData, error: errorPuntos } = await supabase
      .from('progreso')
      .select('puntuacion')
      .eq('usuario_id', usuario.id)
      .eq('completado', true);

    usuario.puntos = errorPuntos
      ? 0
      : puntosData.reduce((acc, cur) => acc + (cur.puntuacion || 0), 0);

    return { ok: true, usuario };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
