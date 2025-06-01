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
