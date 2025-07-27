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
      body: JSON.stringify({ nombre, correo, contrasena, nivel, puntos })
    });

    const data = await res.json();

    if (res.ok && data.ok) {
      console.log('Usuario:', data.usuario);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      window.location.href = '../pages/question.html';
    } else if (res.status === 401) {
      alert('Error de autenticación: ' + data.error); // Contraseña incorrecta o correo no registrado
    } else {
      alert('Error del servidor: ' + data.error); // Algo más salió mal
    }

  } catch (err) {
    alert('No se pudo conectar con el servidor. Intenta más tarde.');
    console.error('Error de red o inesperado:', err);
  }
});

// Mostrar/ocultar contraseña
const togglePassword = document.getElementById('togglePassword');
const inputContrasena = document.getElementById('contrasena');

togglePassword.addEventListener('click', () => {
  inputContrasena.type = inputContrasena.type === 'password' ? 'text' : 'password';
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
