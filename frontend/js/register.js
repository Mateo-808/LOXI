document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registroForm");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const correo = document.getElementById("correo").value;
    const contrasena = document.getElementById("contrasena").value;

    const res = await fetch("http://localhost:3001/api/registro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, correo, contrasena }),
    });

    const result = await res.json();

    if (result.ok) {
      alert("Registro exitoso. Redirigiendo al login...");
      window.location.href = "./login.html";
    } else {
      alert("Error al registrarse.");
    }
  });
});

const inputContrasena = document.getElementById('contrasena');

const botonVisualizar = document.querySelector('.visualizar');
botonVisualizar.addEventListener('click', () => {
    if (inputContrasena.type == "password") {
        inputContrasena.type = "text";
    } else {
        inputContrasena.type = "password";
    }
});
