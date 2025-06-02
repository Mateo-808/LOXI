import http from 'http';
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
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);
  const method = req.method;

  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  if (method === 'POST' && pathname === '/api/registro') {
    try {
      const datos = await readBody(req);
      const resultado = await registrarUsuario(datos);

      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      });
      res.end(JSON.stringify({ ok: true, data: resultado }));
    } catch (err) {
      res.writeHead(400, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      });
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
  } else if (method === 'POST' && pathname === '/api/login') {
    try {
      const { correo, contrasena } = await readBody(req);
      const result = await loginUsuario(correo, contrasena);

      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(500, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      });
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
  } else {
    res.writeHead(404);
    res.end('No encontrado');
  }
});

server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});