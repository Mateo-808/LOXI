document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registroForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('primerNombre').value.trim() + ' ' +
                   document.getElementById('primerApellido').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const contrasena = document.getElementById('contrasena').value;

    try {
      const res = await fetch('http://localhost:3000/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, correo, contrasena })
      });

      const data = await res.json();
      if (data.ok) {
        alert('Registrado con éxito');
        window.location.href = 'login.html';
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error(error);
      alert('Error al conectar con el servidor: ' + error.message);
    }
  });
});

let togglePassword = document.getElementById('togglePassword');
let inputContrasena = document.getElementById('contrasena');

togglePassword.addEventListener('click', () => {
  inputContrasena.type = inputContrasena.type === "password" ? "text" : "password";
});
