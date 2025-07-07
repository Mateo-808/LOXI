// frontend/js/login.js
import { supabase } from './supabaseClient.js';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const correo = document.getElementById('correo').value.trim();
  const contrasena = document.getElementById('contrasena').value;

  const res = await fetch('https://loxi.onrender.com/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo, contrasena })
  });

  const data = await res.json();

  if (data.ok) {
    console.log('Usuario:', data.usuario);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));
    window.location.href = '../pages/profile.html'
  } else {
    alert('Error: ' + data.error);
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
      redirectTo: 'http://127.0.0.1:5500/frontend/pages/callback.html' 
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
      redirectTo: 'http://127.0.0.1:5500/frontend/pages/callback.html'
    }
  });

  if (error) {
    alert('Error al iniciar con GitHub: ' + error.message);
  }
});
