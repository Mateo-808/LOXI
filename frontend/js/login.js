document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");
  
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
  
      const correo = document.getElementById("correo").value;
      const contrasena = document.getElementById("contrasena").value;
  
      const res = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, contrasena }),
      });
  
      const result = await res.json();
  
      if (result.ok) {
        alert("Inicio de sesión exitoso.");
        window.location.href = "../pages/index.html";
      } else {
        alert("Correo o contraseña incorrectos.");
      }
    });
  });
  