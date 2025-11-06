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
  if (event.key === "Escape") {
    closeMobileMenu();
  }
});

document.getElementById("cerrarSesion").addEventListener("click", () => {
  localStorage.removeItem("usuario");
  window.location.href = "../../index.html";
});

/**
 * Convierte varios posibles valores de es_admin a booleano.
 * Acepta: true, false, "true", "false", 1, 0, "1", "0", "t", "f", "T", "F".
 */
function parseEsAdmin(value) {
  if (value === true || value === 1) return true;
  if (value === false || value === 0) return false;
  if (value == null) return false; // null/undefined -> no admin
  const s = String(value).trim().toLowerCase();
  return s === "true" || s === "1" || s === "t" || s === "yes";
}

document.addEventListener("DOMContentLoaded", () => {
  const raw = localStorage.getItem("usuario");
  let usuario = null;

  try {
    usuario = raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error("Error parseando localStorage usuario:", err);
    usuario = null;
  }

  const profileInfo = document.querySelector(".profile-info");

  if (!usuario || !profileInfo) {
    if (profileInfo) {
      profileInfo.innerHTML = `
        <p><strong>Nombre:</strong> No disponible</p>
        <p><strong>Correo:</strong> No disponible</p>
        <p><strong>Fecha de registro:</strong> No disponible</p>
        <p><strong>Nivel actual:</strong> No disponible</p>
        <p><strong>Puntos:</strong> No disponible</p>
      `;
    }
    return;
  }

  const fecha = usuario.fecha || usuario.created_at;
  const fechaFormateada = fecha
    ? new Date(fecha).toLocaleDateString()
    : "No disponible";

  profileInfo.innerHTML = `
    <p><strong>Nombre:</strong> ${usuario.name || usuario.nombre || "Sin nombre"}</p>
    <p><strong>Correo:</strong> ${usuario.email || usuario.correo || "Sin correo"}</p>
    <p><strong>Fecha de registro:</strong> ${fechaFormateada}</p>
    <p><strong>Nivel actual:</strong> ${usuario.nivel || "No asignado"}</p>
    <p><strong>Puntos:</strong> ${usuario.puntos ?? 0}</p>
  `;

  const levelButton = document.querySelector(".level-games");
  if (!levelButton) return;

  levelButton.addEventListener("click", () => {
    // Obtener siempre la versión más reciente del usuario desde localStorage
    let usuarioActual = null;
    try {
      usuarioActual = JSON.parse(localStorage.getItem("usuario"));
    } catch (err) {
      console.error("Error parseando usuario al hacer click:", err);
      usuarioActual = usuario; // fallback
    }
    if (!usuarioActual) {
      alert("No se ha encontrado tu sesión actual.");
      return;
    }

    // parsear es_admin robustamente
    const esAdmin = parseEsAdmin(usuarioActual.es_admin);
    console.log("es_admin raw:", usuarioActual.es_admin, "-> parsed:", esAdmin);

    if (esAdmin) {
      // Redirige al dashboard del admin
      window.location.href = "../pages/admin.html";
      return;
    }

    // Si no es admin, redirige al nivel
    if (!usuarioActual.nivel) {
      alert("No se ha encontrado tu nivel actual.");
      return;
    }

    const nivel = String(usuarioActual.nivel).toLowerCase().trim();
    const url = `../pages/interface.html?nivel=${encodeURIComponent(nivel)}`;
    window.location.href = url;
  });
});
