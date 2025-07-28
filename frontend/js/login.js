import { supabase } from './supabaseClient.js';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const nombre = document.getElementById('nombre').value.trim().toLowerCase();
  const correo = document.getElementById('correo').value.trim();
  const contrasena = document.getElementById('contrasena').value;

  try {
    const res = await fetch('https://loxi.onrender.com/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, correo, contrasena })
    });

    const data = await res.json();

    if (data.ok) {
      const usuario = data.usuario;

      localStorage.setItem('usuario', JSON.stringify(usuario));
      console.log("Usuario guardado en localStorage:", usuario);

    // Redirigir o recargar
      alert(`¡Bienvenido ${usuario.nombre}, tu nivel es ${usuario.nivel}!`);
      window.location.href = '../pages/services.html#level-selector';
    } else {
      alert(`Error: ${result.error}`);
    }
  } catch (err) {
    console.error("Error en la petición:", err);
    alert("No se pudo conectar con el servidor.");
  }
});

// Mostrar/ocultar contraseña
const togglePassword = document.getElementById('togglePassword');
const inputContrasena = document.getElementById('contrasena');

togglePassword.addEventListener('click', () => {
  inputContrasena.type = inputContrasena.type === "password" ? "text" : "password";
});

// Login con Google
document.getElementById('loginGoogle').addEventListener('click', async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'https://loxi-one.vercel.app/frontend/pages/callback.html'
    }
  });

  if (error) {
    alert('Error al iniciar con Google: ' + error.message);
  }
});

// Login con GitHub
document.getElementById('loginGitHub').addEventListener('click', async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: 'https://loxi-one.vercel.app/frontend/pages/callback.html'
    }
  });

  if (error) {
    alert('Error al iniciar con GitHub: ' + error.message);
  }
});
