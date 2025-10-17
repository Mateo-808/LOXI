import http from "http";
import fetch from "node-fetch";
import { config } from "dotenv";
import { registrarUsuario } from "./js/register.js";
import { loginUsuario } from "./js/login.js";
import { URL } from "url";

// Cargar variables del archivo .env
config();

// Variables de entorno
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Leer el cuerpo de la petición
function readBody(req) {
    return new Promise((resolve, reject) => {
        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", () => {
            try {
                resolve(JSON.parse(body));
            } catch (err) {
                reject(new Error("JSON inválido"));
            }
        });
    });
}

// Función para hacer peticiones a Supabase
async function supabaseRequest(endpoint, options = {}) {
    const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
    const headers = {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
        ...options.headers,
    };

    const response = await fetch(url, {
        ...options,
        headers,
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
    // Configuración de CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
    );
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );

    const { pathname } = new URL(req.url, `http://${req.headers.host}`);
    const method = req.method;

    if (method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
    }

    // Página principal
    if (method === "GET" && pathname === "/") {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(`
        <h1>Bienvenido al servidor LOXI</h1>
        <p>Endpoints disponibles:</p>
        <ul>
          <li><strong>POST</strong> /api/registro - Registrar usuario</li>
          <li><strong>POST</strong> /api/login - Iniciar sesión</li>
          <li><strong>POST</strong> /api/verificar-token - Verificar usuario con Supabase</li>
          <li><strong>POST</strong> /api/progreso - Guardar progreso del ejercicio</li>
          <li><strong>GET</strong> /api/progreso/:usuario_id - Obtener progreso</li>
          <li><strong>GET</strong> /api/progreso/estadisticas/:usuario_id - Obtener estadísticas</li>
          <li><strong>GET</strong> /api/ejercicios - Obtener lista de ejercicios</li>
          <li><strong>GET</strong> /api/comentarios - Ver comentarios</li>
          <li><strong>POST</strong> /api/comentarios - Crear comentario</li>
        </ul>
      `);
        return;
    }

    // --- Registro de usuario ---
    if (method === "POST" && pathname === "/api/registro") {
        try {
            const datos = await readBody(req);
            const resultado = await registrarUsuario(datos);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ ok: true, data: resultado }));
        } catch (err) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ ok: false, error: err.message }));
        }
        return;
    }

    // --- Login ---
    if (method === "POST" && pathname === "/api/login") {
        try {
            const { nombre, correo, contrasena } = await readBody(req);
            const result = await loginUsuario(nombre, correo, contrasena);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(result));
        } catch (err) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ ok: false, error: err.message }));
        }
        return;
    }

    // --- Verificación de token ---
    if (method === "POST" && pathname === "/api/verificar-token") {
        try {
            const { token } = await readBody(req);
            if (!token) {
                res.writeHead(400, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ error: "Token no proporcionado" }));
            }

            const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    apikey: SUPABASE_ANON_KEY,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Error de Supabase:", response.status, errorText);
                res.writeHead(401, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ error: "Token inválido o expirado" }));
            }

            const userData = await response.json();
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({
                id: userData.id,
                name: userData.user_metadata?.full_name || userData.user_metadata?.name || "Usuario",
                email: userData.email,
                nivel: userData.user_metadata?.nivel,
                puntos: userData.user_metadata?.puntos,
            }));
        } catch (err) {
            console.error("Error al verificar token:", err);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Error al comunicarse con Supabase" }));
        }
        return;
    }

    // --- Guardar progreso ---
    if (method === "POST" && pathname === "/api/progreso") {
        try {
            const { usuario_id, ejercicio_id, completado, puntuacion, nivel, intentos } = await readBody(req);
            if (!usuario_id || !ejercicio_id) {
                res.writeHead(400, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ ok: false, error: "usuario_id y ejercicio_id son requeridos" }));
            }

            const existingRecord = await supabaseRequest(
                `progreso?usuario_id=eq.${usuario_id}&ejercicio_id=eq.${ejercicio_id}&select=*`
            );

            let result;
            if (existingRecord && existingRecord.length > 0) {
                const nuevosIntentos = existingRecord[0].intentos + (intentos || 1);
                const mejorPuntuacion = Math.max(existingRecord[0].puntuacion || 0, puntuacion || 0);

                result = await supabaseRequest(
                    `progreso?usuario_id=eq.${usuario_id}&ejercicio_id=eq.${ejercicio_id}`,
                    {
                        method: "PATCH",
                        body: JSON.stringify({
                            completado,
                            puntuacion: mejorPuntuacion,
                            nivel,
                            intentos: nuevosIntentos,
                            fecha: new Date().toISOString(),
                        }),
                    }
                );
            } else {
                result = await supabaseRequest("progreso", {
                    method: "POST",
                    body: JSON.stringify({
                        usuario_id,
                        ejercicio_id,
                        completado: completado || false,
                        puntuacion: puntuacion || 0,
                        nivel,
                        intentos: intentos || 1,
                    }),
                });
            }

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ ok: true, data: result, message: "Progreso guardado exitosamente" }));
        } catch (err) {
            console.error("Error al guardar progreso:", err);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ ok: false, error: err.message }));
        }
        return;
    }

    // --- Obtener ejercicios ---
    if (method === "GET" && pathname === "/api/ejercicios") {
        try {
            const ejercicios = await supabaseRequest("ejercicios?select=*&order=titulo");
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ ok: true, data: ejercicios || [] }));
        } catch (err) {
            console.error("Error al obtener ejercicios:", err);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ ok: false, error: err.message }));
        }
        return;
    }

    // --- Comentarios ---
    if (method === "POST" && pathname === "/api/comentarios") {
        try {
            const { usuario_id, mensaje } = await readBody(req);
            if (!mensaje || !usuario_id) {
                res.writeHead(400, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ ok: false, error: "usuario_id y mensaje son requeridos" }));
            }

            const ahora = new Date().toISOString();
            const result = await supabaseRequest("comentarios", {
                method: "POST",
                body: JSON.stringify({ usuario_id, mensaje, fecha: ahora }),
            });

            res.writeHead(201, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ ok: true, data: result }));
        } catch (err) {
            console.error("Error al crear comentario:", err);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ ok: false, error: err.message }));
        }
        return;
    }

    if (method === "GET" && pathname === "/api/comentarios") {
        try {
            const comentarios = await supabaseRequest(
                "comentarios?select=id,mensaje,fecha,usuario_id,usuarios(nombre)&order=fecha.desc"
            );
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ ok: true, data: comentarios || [] }));
        } catch (err) {
            console.error("Error al obtener comentarios:", err);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ ok: false, error: err.message }));
        }
        return;
    }

    // --- Rutas no encontradas ---
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: false, error: `Ruta ${method} ${pathname} no encontrada` }));
});

// Iniciar servidor
server.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log("Endpoints principales:");
    console.log("  POST /api/registro");
    console.log("  POST /api/login");
    console.log("  POST /api/verificar-token");
    console.log("  POST /api/progreso");
    console.log("  GET  /api/ejercicios");
    console.log("  GET  /api/comentarios");
});
