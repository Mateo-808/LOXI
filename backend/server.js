import http from 'http';
import fetch from 'node-fetch'; 
import { registrarUsuario } from './js/register.js';
import { loginUsuario } from './js/login.js';
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
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

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
      <h1>Bienvenido al servidor</h1>
      <p>Endpoints disponibles:</p>
      <ul>
        <li><strong>POST</strong> /api/registro - Registrar un nuevo usuario</li>
        <li><strong>POST</strong> /api/login - Iniciar sesión</li>
        <li><strong>POST</strong> /api/verificar-token - Verificar usuario con Supabase</li>
      </ul>
    `);
    return;
  }

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
      const { correo, contrasena } = await readBody(req);
      const result = await loginUsuario(correo, contrasena);

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

  // Si no se encuentra ruta
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Ruta no encontrada');
});

server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});