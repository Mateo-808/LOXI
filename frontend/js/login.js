document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const correo = document.getElementById('correo').value.trim();
  const contrasena = document.getElementById('contrasena').value;

  const res = await fetch('http://localhost:3000/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo, contrasena })
  });

  const data = await res.json();

  if (data.ok) {
    window.location.href = 'confirmation.html';
  } else {
    alert('Error: ' + data.error);
  }
});

document.getElementById('loginGoogle').addEventListener('click', async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'http://127.0.0.1:5500/frontend/pages/callback.html'
    }
  });

  if (error) {
    alert('Error al iniciar con Google: ' + error.message);
  }
});
