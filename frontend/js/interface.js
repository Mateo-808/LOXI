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

document.addEventListener("click", (event) => {
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

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMobileMenu();
});

document.addEventListener('DOMContentLoaded', () => {
  const btnSesion = document.getElementById('btnSesion');
  const btnSesionMobile = document.getElementById('btnSesionMobile');

  const usuarioGuardado = localStorage.getItem('usuario');

  if (usuarioGuardado) {
    try {
      const usuario = JSON.parse(usuarioGuardado);
      
      if (usuario.es_admin === true) {
        btnSesion.textContent = 'Ir al Panel';
        btnSesion.href = '../pages/admin.html';

        btnSesionMobile.textContent = 'Ir al Panel';
        btnSesionMobile.href = '../pages/admin.html';
      } else {
        btnSesion.textContent = 'Ver perfil';
        btnSesion.href = '../pages/profile.html';

        btnSesionMobile.textContent = 'Ver perfil';
        btnSesionMobile.href = '../pages/profile.html';
      }
    } catch (error) {
      console.error('Error al parsear usuario de localStorage:', error);
      btnSesion.textContent = 'Iniciar sesión';
      btnSesion.href = '../pages/login.html';

      btnSesionMobile.textContent = 'Iniciar sesión';
      btnSesionMobile.href = '../pages/login.html';
    }
  } else {
    btnSesion.textContent = 'Iniciar sesión';
    btnSesion.href = '../pages/login.html';

    btnSesionMobile.textContent = 'Iniciar sesión';
    btnSesionMobile.href = '../pages/login.html';
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

    if (ejercicios.length > 0) cargarEjercicioActual();
    else
      document.querySelector(".contenedor").innerHTML =
        `<p>No hay ejercicios disponibles para el nivel ${nivel}.</p>`;
  } catch (err) {
    console.error("❌ Error al cargar ejercicios:", err.message);
  }
}

function cargarEjercicioActual() {
  const { titulo } = obtenerParametros();
  const ejercicio =
    ejercicios.find(
      (e) => e.titulo.toLowerCase() === titulo.toLowerCase()
    ) || ejercicios[0];

  indiceActual = ejercicios.indexOf(ejercicio);
  mostrarEjercicio(ejercicio);
}

function mostrarEjercicio(ejercicio) {
  const subHeaders = document.querySelectorAll("#sub-header");
  const contents = document.querySelectorAll(".content");

  if (subHeaders.length < 3 || contents.length < 3) return;

  subHeaders[0].innerHTML = `<h3>${ejercicio.nivel}: ${ejercicio.titulo}</h3>`;
  contents[0].innerHTML = `<p>${ejercicio.descripcion || "Sin descripción disponible."}</p>`;

  subHeaders[1].innerHTML = `<h3>Ejercicio</h3>`;
  contents[1].innerHTML = `
    <p>${ejercicio.descripción_ejercicio || ""}</p>
    <p><strong>${ejercicio.ejercicio || ""}</strong></p>
    <input type="text" id="respuestaUsuario" placeholder="Escribe tu respuesta aquí..." />
  `;

  subHeaders[2].innerHTML = `<h3>Explicación</h3>`;
  contents[2].innerHTML = `
    <p id="explicacion">Aquí aparecerá la explicación o resultado.</p>
    <div class="botones">
      <button id="btnResultado" class="btn">Ver resultado</button>
      <button id="btnContinuar" class="btn">Continuar</button>
    </div>
  `;

  inicializarEventos();
}

async function validarRespuesta() {
  const input = document.getElementById("respuestaUsuario");
  const explicacion = document.getElementById("explicacion");
  if (!input || !explicacion) return;

  const respuestaUsuario = input.value.trim().toLowerCase();
  const ejercicio = ejercicios[indiceActual];
  const respuestaCorrecta = ejercicio.respuesta?.trim().toLowerCase() || "";

  if (!respuestaUsuario) {
    explicacion.innerHTML = "⚠️ Escribe una respuesta antes de continuar.";
    return;
  }

  if (respuestaUsuario === respuestaCorrecta) {
    explicacion.innerHTML = `🎉 ¡Correcto! Has acertado y ganas <strong>${ejercicio.puntos}</strong> puntos.`;
    await agregarPuntosUsuario(ejercicio.puntos);
  } else {
    explicacion.innerHTML = `❌ Incorrecto. La respuesta correcta es: <strong>${ejercicio.respuesta}</strong>`;
  }
}

async function agregarPuntosUsuario(puntosGanados) {
  const usuarioGuardado = localStorage.getItem("usuario");
  if (!usuarioGuardado) {
    alert("⚠️ Debes iniciar sesión para ganar puntos.");
    return;
  }

  try {
    const usuario = JSON.parse(usuarioGuardado);
    const idUsuario = usuario.id;

    const { data, error } = await supabase
      .from("progreso")
      .select("puntos")
      .eq("id", idUsuario)
      .single();

    if (error) throw error;

    const puntosActuales = data?.puntos || 0;
    const nuevosPuntos = puntosActuales + puntosGanados;

    const { error: updateError } = await supabase
      .from("progresos")
      .update({ puntos: nuevosPuntos })
      .eq("id", idUsuario);

    if (updateError) throw updateError;

    console.log(`✅ Puntos actualizados: ${nuevosPuntos}`);
  } catch (err) {
    console.error("Error al actualizar puntos:", err.message);
  }
}

function siguienteEjercicio() {
  if (indiceActual < ejercicios.length - 1) {
    indiceActual++;
    const siguiente = ejercicios[indiceActual];
    const nivel = siguiente.nivel;
    const tituloURL = encodeURIComponent(siguiente.titulo);

    // 🔄 Transición suave antes de cargar el siguiente
    document.querySelector(".contenedor").style.opacity = "0";
    setTimeout(() => {
      window.history.pushState({}, "", `?nivel=${nivel.toLowerCase()}&ejercicio=${tituloURL}`);
      mostrarEjercicio(siguiente);
      document.querySelector(".contenedor").style.opacity = "1";
    }, 300);
  } else {
    alert("🎉 ¡Has completado todos los ejercicios de este nivel!");
  }
}

function inicializarEventos() {
  const btnResultado = document.getElementById("btnResultado");
  const btnContinuar = document.getElementById("btnContinuar");
  const input = document.getElementById("respuestaUsuario");

  if (btnResultado) btnResultado.onclick = validarRespuesta;
  if (btnContinuar) btnContinuar.onclick = siguienteEjercicio;

  if (input) {
    input.onkeydown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        validarRespuesta();
      }
    };
  }
}

document.addEventListener("DOMContentLoaded", () => {
  cargarEjercicios();
});
