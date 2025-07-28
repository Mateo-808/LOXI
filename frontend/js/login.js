import { supabase } from './supabaseClient.js';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const nombre = document.getElementById('nombre').value.trim().toLowerCase();
  const correo = document.getElementById('correo').value.trim();
  const contrasena = document.getElementById('contrasena').value;

  const res = await fetch('https://loxi.onrender.com/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, correo, contrasena })
  });

  const data = await res.json();

  if (result.ok) {
    const usuario = JSON.parse(localStorage.getItem('usuario')) || {};
    usuario.nivel = progreso.nivel; 
    usuario.puntos = progreso.puntuacion;
    localStorage.setItem('usuario', JSON.stringify(usuario));
  } else {
    console.error("Error al guardar progreso:", result.error);
  }
});

// Mostrar/ocultar contraseña
let togglePassword = document.getElementById('togglePassword');
let inputContrasena = document.getElementById('contrasena');

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
