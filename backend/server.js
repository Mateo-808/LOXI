import http from 'http';
import fetch from 'node-fetch'; 
import { registrarUsuario } from './js/register.js';
import { loginUsuario } from './js/login.js';
import { 
  getUserProgress, 
  getUserExerciseProgress,
  recordExerciseAttempt, 
  getUserStats,
  getUserRanking,
  getUserProgressByCategory,
  getUserProgressByLevel,
  markExerciseCompleted,
  getRecentUserProgress
} from './js/progressController.js';
import { URL } from 'url';

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

const PORT = 3000;

const server = http.createServer(async (req, res) => {
  // Acá se habilitan los CORS globalmente
  res.setHeader('Access-Control-Allow-Origin', 'https://loxi-one.vercel.app');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  const { pathname } = new URL(req.url, `http://${req.headers.host}`);
  const method = req.method;

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (method === 'GET' && pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <h1>Bienvenido al servidor Loxi</h1>
      <p>Endpoints disponibles:</p>
      <ul>
        <li><strong>POST</strong> /api/registro - Registrar un nuevo usuario</li>
        <li><strong>POST</strong> /api/login - Iniciar sesión</li>
        <li><strong>POST</strong> /api/verificar-token - Verificar usuario con Supabase</li>
        <hr>
        <li><strong>GET</strong> /api/user/:userId/progress - Obtener todo el progreso del usuario</li>
        <li><strong>GET</strong> /api/user/:userId/exercise/:exerciseId/progress - Progreso específico de un ejercicio</li>
        <li><strong>POST</strong> /api/user/:userId/exercise/:exerciseId/attempt - Registrar intento de ejercicio</li>
        <li><strong>PUT</strong> /api/user/:userId/exercise/:exerciseId/complete - Marcar ejercicio como completado</li>
        <li><strong>GET</strong> /api/user/:userId/stats - Estadísticas del usuario</li>
        <li><strong>GET</strong> /api/user/:userId/progress/categories - Progreso por categorías</li>
        <li><strong>GET</strong> /api/user/:userId/progress/levels - Progreso por niveles</li>
        <li><strong>GET</strong> /api/user/:userId/progress/recent - Últimos ejercicios realizados</li>
        <li><strong>GET</strong> /api/ranking - Ranking de usuarios</li>
      </ul>
    `);
    return;
  }

  // Endpoints originales
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

  if (method === 'POST' && pathname === '/api/login') {
    try {
      const { nombre, correo, contrasena } = await readBody(req);
      const result = await loginUsuario(nombre, correo, contrasena);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
    return;
  }

  if (method === 'POST' && pathname === '/api/verificar-token') {
    try {
      const { token } = await readBody(req);

      if (!token) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Token no proporcionado' }));
      }

      const response = await fetch('https://bllvqufahggmbhhfqidk.supabase.co/auth/v1/user', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsbHZxdWZhaGdnbWJoaGZxaWRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyMTA1NTgsImV4cCI6MjA1OTc4NjU1OH0.Sucy2GME2XYMxW7cVSbqnxG4cmeTkY2IeqSvWUHSxts',
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
        created_at: userData.created_at
      }));
    } catch (err) {
      console.error('Error al verificar token:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Error al comunicarse con Supabase' }));
    }
    return;
  }

  // Nuevos endpoints de progreso
  try {
    // GET /api/user/{id}/progress - Todo el progreso del usuario
    if (method === 'GET' && pathname.match(/^\/api\/user\/[^\/]+\/progress$/)) {
      const userId = pathname.split('/')[3];
      const progress = await getUserProgress(userId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, data: progress }));
      return;
    }
    
    // GET /api/user/{userId}/exercise/{exerciseId}/progress - Progreso específico
    if (method === 'GET' && pathname.match(/^\/api\/user\/[^\/]+\/exercise\/[^\/]+\/progress$/)) {
      const userId = pathname.split('/')[3];
      const exerciseId = pathname.split('/')[5];
      const progress = await getUserExerciseProgress(userId, exerciseId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, data: progress }));
      return;
    }
    
    // POST /api/user/{userId}/exercise/{exerciseId}/attempt - Registrar intento
    if (method === 'POST' && pathname.match(/^\/api\/user\/[^\/]+\/exercise\/[^\/]+\/attempt$/)) {
      const userId = pathname.split('/')[3];
      const exerciseId = pathname.split('/')[5];
      const attemptData = await readBody(req);
      const result = await recordExerciseAttempt(userId, exerciseId, attemptData);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, data: result }));
      return;
    }
    
    // PUT /api/user/{userId}/exercise/{exerciseId}/complete - Marcar como completado
    if (method === 'PUT' && pathname.match(/^\/api\/user\/[^\/]+\/exercise\/[^\/]+\/complete$/)) {
      const userId = pathname.split('/')[3];
      const exerciseId = pathname.split('/')[5];
      const { puntuacion } = await readBody(req);
      const result = await markExerciseCompleted(userId, exerciseId, puntuacion);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, data: result }));
      return;
    }
    
    // GET /api/user/{id}/stats - Estadísticas del usuario
    if (method === 'GET' && pathname.match(/^\/api\/user\/[^\/]+\/stats$/)) {
      const userId = pathname.split('/')[3];
      const stats = await getUserStats(userId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, data: stats }));
      return;
    }
    
    // GET /api/user/{id}/progress/categories - Progreso por categorías
    if (method === 'GET' && pathname.match(/^\/api\/user\/[^\/]+\/progress\/categories$/)) {
      const userId = pathname.split('/')[3];
      const progressByCategory = await getUserProgressByCategory(userId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, data: progressByCategory }));
      return;
    }
    
    // GET /api/user/{id}/progress/levels - Progreso por niveles
    if (method === 'GET' && pathname.match(/^\/api\/user\/[^\/]+\/progress\/levels$/)) {
      const userId = pathname.split('/')[3];
      const progressByLevel = await getUserProgressByLevel(userId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, data: progressByLevel }));
      return;
    }
    
    // GET /api/user/{id}/progress/recent - Últimos ejercicios
    if (method === 'GET' && pathname.match(/^\/api\/user\/[^\/]+\/progress\/recent$/)) {
      const userId = pathname.split('/')[3];
      const urlParams = new URL(req.url, `http://${req.headers.host}`);
      const limit = urlParams.searchParams.get('limit') || 5;
      const recentProgress = await getRecentUserProgress(userId, parseInt(limit));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, data: recentProgress }));
      return;
    }
    
    // GET /api/ranking - Ranking de usuarios
    if (method === 'GET' && pathname === '/api/ranking') {
      const urlParams = new URL(req.url, `http://${req.headers.host}`);
      const limit = urlParams.searchParams.get('limit') || 10;
      const ranking = await getUserRanking(parseInt(limit));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, data: ranking }));
      return;
    }

  } catch (error) {
    console.error('Error en endpoints de progreso:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      success: false,
      error: 'Error interno del servidor',
      message: error.message 
    }));
    return;
  }

  // Si no se encuentra ruta
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Ruta no encontrada');
});

server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});