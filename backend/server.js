import http from 'http';
import fetch from 'node-fetch'; 
import { registrarUsuario } from './js/register.js';
import { loginUsuario } from './js/login.js';
import { URL } from 'url';

// Configuración de Supabase
const SUPABASE_URL = 'https://bllvqufahggmbhhfqidk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsbHZxdWZhaGdnbWJoaGZxaWRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyMTA1NTgsImV4cCI6MjA1OTc4NjU1OH0.Sucy2GME2XYMxW7cVSbqnxG4cmeTkY2IeqSvWUHSxts';

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('JSON inválido'));
      }
    });
  });
}

// Función para hacer peticiones a Supabase
async function supabaseRequest(endpoint, options = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
    ...options.headers
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase error: ${response.status} - ${errorText}`);
  }

  const data = await response.text();
  return data ? JSON.parse(data) : null;
}

const PORT = 3000;

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://loxi-one.vercel.app');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  const { pathname } = new URL(req.url, `http://${req.headers.host}`);
  const method = req.method;

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Ruta principal con información de endpoints
  if (method === 'GET' && pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <h1>Bienvenido al servidor LOXI</h1>
      <p>Endpoints disponibles:</p>
      <ul>
        <li><strong>POST</strong> /api/registro - Registrar un nuevo usuario</li>
        <li><strong>POST</strong> /api/login - Iniciar sesión</li>
        <li><strong>POST</strong> /api/verificar-token - Verificar usuario con Supabase</li>
        <li><strong>POST</strong> /api/progreso - Guardar progreso del ejercicio</li>
        <li><strong>GET</strong> /api/progreso/:usuario_id - Obtener progreso de un usuario</li>
        <li><strong>GET</strong> /api/ejercicios - Obtener lista de ejercicios</li>
        <li><strong>GET</strong> /api/progreso/estadisticas/:usuario_id - Obtener estadísticas de progreso</li>
      </ul>
    `);
    return;
  }

  // Endpoint de registro (existente)
  if (method === 'POST' && pathname === '/api/registro') {
    try {
      const datos = await readBody(req);
      const resultado = await registrarUsuario(datos);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, data: resultado }));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
    return;
  }

  // Endpoint de login (existente)
if (method === 'POST' && pathname === '/api/login') {
  try {
    const { nombre, correo, contrasena, nivel, puntos } = await readBody(req);
    const result = await loginUsuario(nombre, correo, contrasena, nivel, puntos);

    if (result.ok) {
      // Login exitoso
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } else {
      // Error de login (correo no registrado o contraseña incorrecta)
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    }

  } catch (err) {
    // Error interno del servidor
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: false, error: err.message }));
  }
  return;
}


  // Endpoint de verificación de token (existente)
  if (method === 'POST' && pathname === '/api/verificar-token') {
    try {
      const { token } = await readBody(req);

      if (!token) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Token no proporcionado' }));
      }

      const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error de Supabase:', response.status, errorText);
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Token inválido o expirado' }));
      }

      const userData = await response.json();
      console.log('Datos del usuario:', userData);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        id: userData.id,
        name: userData.user_metadata?.full_name || userData.user_metadata?.name || 'Usuario',
        email: userData.email,
        email_confirmed_at: userData.email_confirmed_at,
        created_at: userData.created_at,
        nivel: userData.user_metadata?.nivel,
        puntos: userData.user_metadata?.puntos
      }));
    } catch (err) {
      console.error('Error al verificar token:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Error al comunicarse con Supabase' }));
    }
    return;
  }

  // ===================== NUEVOS ENDPOINTS PARA PROGRESO =====================

  // POST /api/progreso - Guardar progreso del ejercicio
// POST /api/progreso - Guardar progreso del ejercicio
if (method === 'POST' && pathname === '/api/progreso') {
  try {
    const {
      usuario_id,
      ejercicio_id,
      completado,
      puntuacion,
      nivel, 
      intentos
    } = await readBody(req);

    // Validar datos requeridos
    if (!usuario_id || !ejercicio_id) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        ok: false,
        error: 'usuario_id y ejercicio_id son requeridos'
      }));
    }

    // Validar nivel
    const nivelesValidos = ['Novato', 'Principiante', 'Intermedio', 'Avanzado'];
    if (nivel && !nivelesValidos.includes(nivel)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        ok: false,
        error: 'nivel debe ser uno de: ' + nivelesValidos.join(', ')
      }));
    }

    // Verificar si ya existe un registro
    const existingRecord = await supabaseRequest(
      `progreso?usuario_id=eq.${usuario_id}&ejercicio_id=eq.${ejercicio_id}&select=*`
    );

    let result;

    if (existingRecord && existingRecord.length > 0) {
      // Actualizar registro existente
      const nuevosIntentos = existingRecord[0].intentos + (intentos || 1);
      const mejorPuntuacion = Math.max(existingRecord[0].puntuacion || 0, puntuacion || 0);
      
      result = await supabaseRequest(`progreso?usuario_id=eq.${usuario_id}&ejercicio_id=eq.${ejercicio_id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          completado: completado,
          puntuacion: mejorPuntuacion,
          nivel: nivel,
          intentos: nuevosIntentos,
          fecha: new Date().toISOString()
        })
      });
    } else {
      // Crear nuevo registro
      result = await supabaseRequest('progreso', {
        method: 'POST',
        body: JSON.stringify({
          usuario_id: usuario_id,
          ejercicio_id: ejercicio_id,
          completado: completado || false,
          puntuacion: puntuacion || 0,
          nivel: nivel, 
          intentos: intentos || 1
        })
      });
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      ok: true,
      data: result,
      message: 'Progreso guardado exitosamente'
    }));

  } catch (err) {
    console.error('Error al guardar progreso:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      ok: false,
      error: 'Error interno del servidor',
      details: err.message
    }));
  }
  return;
}

  // GET /api/progreso/:usuario_id - Obtener progreso de un usuario
  if (method === 'GET' && pathname.startsWith('/api/progreso/') && !pathname.includes('/estadisticas/')) {
    try {
      const pathParts = pathname.split('/');
      const usuario_id = pathParts[3]; // Extraer usuario_id de la URL

      if (!usuario_id) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          ok: false,
          error: 'usuario_id es requerido'
        }));
      }

      const progreso = await supabaseRequest(
        `progreso?usuario_id=eq.${usuario_id}&select=*,ejercicios(nombre,descripcion)&order=fecha.desc`
      );

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        ok: true,
        data: progreso || []
      }));

    } catch (err) {
      console.error('Error al obtener progreso:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        ok: false,
        error: 'Error interno del servidor'
      }));
    }
    return;
  }

  // GET /api/progreso/estadisticas/:usuario_id - Obtener estadísticas de progreso
  if (method === 'GET' && pathname.startsWith('/api/progreso/estadisticas/')) {
    try {
      const pathParts = pathname.split('/');
      const usuario_id = pathParts[4]; // Extraer usuario_id de la URL

      if (!usuario_id) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          ok: false,
          error: 'usuario_id es requerido'
        }));
      }

      const progreso = await supabaseRequest(
        `progreso?usuario_id=eq.${usuario_id}&select=*`
      );

      // Calcular estadísticas
      const estadisticas = {
        total_ejercicios: progreso ? progreso.length : 0,
        ejercicios_completados: progreso ? progreso.filter(p => p.completado).length : 0,
        puntuacion_promedio: progreso && progreso.length > 0 
          ? progreso.filter(p => p.completado).reduce((sum, p) => sum + (p.puntuacion || 0), 0) / progreso.filter(p => p.completado).length || 0
          : 0,
        total_intentos: progreso ? progreso.reduce((sum, p) => sum + (p.intentos || 0), 0) : 0,
        nivel_novato: progreso ? progreso.filter(p => p.nivel === 'Novato').length : 0, // Cambiado
        nivel_principiante: progreso ? progreso.filter(p => p.nivel === 'Principiante').length : 0, // Cambiado
        nivel_intermedio: progreso ? progreso.filter(p => p.nivel === 'Intermedio').length : 0, // Cambiado
        nivel_avanzado: progreso ? progreso.filter(p => p.nivel === 'Avanzado').length : 0 // Cambiado
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        ok: true,
        data: estadisticas
      }));

    } catch (err) {
      console.error('Error al obtener estadísticas:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        ok: false,
        error: 'Error interno del servidor'
      }));
    }
    return;
  }

  // GET /api/ejercicios - Obtener lista de ejercicios
  if (method === 'GET' && pathname === '/api/ejercicios') {
    try {
      const ejercicios = await supabaseRequest('ejercicios?select=*&order=nombre');

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        ok: true,
        data: ejercicios || []
      }));

    } catch (err) {
      console.error('Error al obtener ejercicios:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        ok: false,
        error: 'Error interno del servidor'
      }));
    }
    return;
  }

  // POST /api/ejercicios - Crear un nuevo ejercicio
  if (method === 'POST' && pathname === '/api/ejercicios') {
    try {
      const { nombre, descripcion, tipo, nivel_dificultad } = await readBody(req);
      
      if (!nombre || !descripcion) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          ok: false,
          error: 'nombre y descripcion son requeridos'
        }));
      }
      
      const result = await supabaseRequest('ejercicios', {
        method: 'POST',
        body: JSON.stringify({
          nombre: nombre,
          descripcion: descripcion,
          tipo: tipo,
          nivel_dificultad: nivel_dificultad
        })
      });
      
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        ok: true,
        data: result,
        message: 'Ejercicio creado exitosamente'
      }));
      
    } catch (err) {
      console.error('Error al crear ejercicio:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        ok: false,
        error: 'Error interno del servidor'
      }));
    }
    return;
  }

  // Ruta no encontrada
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    ok: false,
    error: 'Ruta no encontrada',
    message: `La ruta ${method} ${pathname} no existe`
  }));
});

server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log('Endpoints disponibles:');
  console.log('  POST /api/registro');
  console.log('  POST /api/login');
  console.log('  POST /api/verificar-token');
  console.log('  POST /api/progreso');
  console.log('  GET  /api/progreso/:usuario_id');
  console.log('  GET  /api/progreso/estadisticas/:usuario_id');
  console.log('  GET  /api/ejercicios');
  console.log('  POST /api/ejercicios');
});