function toggleMobileMenu() {
  const overlay = document.getElementById("mobileMenuOverlay");
  const burgerMenu = document.querySelector(".burger-menu");

  overlay.classList.toggle("active");
  burgerMenu.classList.toggle("active");

  document.body.style.overflow = overlay.classList.contains("active")
    ? "hidden"
    : "auto";
}

function closeMobileMenu() {
  const overlay = document.getElementById("mobileMenuOverlay");
  const burgerMenu = document.querySelector(".burger-menu");

  overlay.classList.remove("active");
  burgerMenu.classList.remove("active");
  document.body.style.overflow = "auto";
}

function toggleMenuSection(section) {
  section.classList.toggle("expanded");
}

document.addEventListener("click", function (event) {
  const overlay = document.getElementById("mobileMenuOverlay");
  const burgerMenu = document.querySelector(".burger-menu");

  if (
    overlay.classList.contains("active") &&
    !overlay.contains(event.target) &&
    !burgerMenu.contains(event.target)
  ) {
    closeMobileMenu();
  }
});

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeMobileMenu();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const btnSesion = document.getElementById("btnSesion");
  const btnSesionMobile = document.getElementById("btnSesionMobile");

  const usuarioGuardado = localStorage.getItem("usuario");

  if (usuarioGuardado) {
    btnSesion.textContent = "Ver perfil";
    btnSesion.href = "../pages/profile.html";

    btnSesionMobile.textContent = "Ver perfil";
    btnSesionMobile.href = "../pages/profile.html";
  } else {
    btnSesion.textContent = "Iniciar sesión";
    btnSesion.href = "../pages/login.html";

    btnSesionMobile.textContent = "Iniciar sesión";
    btnSesionMobile.href = "../pages/login.html";
  }
});

import { supabase } from "./supabaseClient.js";

let ejercicios = [];
let indiceActual = 0;

function obtenerParametros() {
  const params = new URLSearchParams(window.location.search);
  let nivel = params.get("nivel") || "Principiante";
  let titulo = params.get("ejercicio") || "";

  nivel = nivel.charAt(0).toUpperCase() + nivel.slice(1).toLowerCase();
  titulo = decodeURIComponent(titulo);

  return { nivel, titulo };
}

async function cargarEjercicios() {
  const { nivel } = obtenerParametros();

  try {
    const { data, error } = await supabase
      .from("ejercicios")
      .select("*")
      .eq("nivel", nivel)
      .order("titulo", { ascending: true });

    if (error) throw error;

    ejercicios = data;
    indiceActual = 0;

    if (ejercicios.length > 0) {
      cargarEjercicioActual();
    } else {
      document.querySelector(".contenedor").innerHTML =
        `<p>No hay ejercicios disponibles para el nivel ${nivel}.</p>`;
    }
  } catch (err) {
    console.error("❌ Error al cargar ejercicios:", err.message);
  }
}

function cargarEjercicioActual() {
  const { titulo } = obtenerParametros();
  const ejercicio = ejercicios.find(
    (e) => e.titulo.toLowerCase() === titulo.toLowerCase()
  ) || ejercicios[0];

  indiceActual = ejercicios.indexOf(ejercicio);
  mostrarEjercicio(ejercicio);
}

function mostrarEjercicio(ejercicio) {
  document.querySelectorAll("#sub-header")[0].innerHTML = `
    <h3>${ejercicio.nivel}: ${ejercicio.titulo}</h3>
  `;

  document.querySelectorAll(".content")[0].innerHTML = `
    <p>${ejercicio.descripcion || "Sin descripción disponible."}</p>
  `;

  document.querySelectorAll("#sub-header")[1].innerHTML = `
    <h3>Ejercicio</h3>
  `;
  document.querySelectorAll(".content")[1].innerHTML = `
    <p>${ejercicio.descripción_ejercicio || ""}</p>
    <p><strong>${ejercicio.ejercicio || ""}</strong></p>
    <input type="text" id="respuestaUsuario" placeholder="Escribe tu respuesta aquí..." />
  `;

  document.querySelectorAll("#sub-header")[2].innerHTML = `
    <h3>Explicación</h3>
  `;
  document.querySelectorAll(".content")[2].innerHTML = `
    <p id="explicacion">Aquí aparecerá la explicación o resultado.</p>
  `;

  const input = document.getElementById("respuestaUsuario");
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      validarRespuesta();
    }
  });
}

function validarRespuesta() {
  const input = document.getElementById("respuestaUsuario");
  const explicacion = document.getElementById("explicacion");

  if (!input) return;

  const respuestaUsuario = input.value.trim().toLowerCase();
  const respuestaCorrecta =
    ejercicios[indiceActual].respuesta?.trim().toLowerCase() || "";

  if (respuestaUsuario === "") {
    explicacion.innerHTML = "⚠️ Escribe una respuesta antes de continuar.";
    return;
  }

  if (respuestaUsuario === respuestaCorrecta) {
    explicacion.innerHTML = "🎉 ¡Correcto! Has acertado.";
  } else {
    explicacion.innerHTML = `❌ Incorrecto. La respuesta correcta es: <strong>${ejercicios[indiceActual].respuesta}</strong>`;
  }
}

function siguienteEjercicio() {
  if (indiceActual < ejercicios.length - 1) {
    indiceActual++;
    const siguiente = ejercicios[indiceActual];
    const nivel = ejercicios[indiceActual].nivel;
    const tituloURL = encodeURIComponent(siguiente.titulo);

    window.history.pushState({}, "", `?nivel=${nivel.toLowerCase()}&ejercicio=${tituloURL}`);
    mostrarEjercicio(siguiente);
  } else {
    alert("🎉 ¡Has completado todos los ejercicios de este nivel!");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  cargarEjercicios();

  // Botón "RESULTADO"
  const btnResultado = document.querySelectorAll("button")[1];
  if (btnResultado) {
    btnResultado.addEventListener("click", validarRespuesta);
  }

  // Botón "CONTINUAR"
  const btnContinuar = document.querySelectorAll("button")[2];
  if (btnContinuar) {
    btnContinuar.addEventListener("click", siguienteEjercicio);
  }
});
