function toggleMobileMenu() {
    const overlay = document.getElementById("mobileMenuOverlay");
    const burgerMenu = document.querySelector(".burger-menu");

    overlay.classList.toggle("active");
    burgerMenu.classList.toggle("active");

    if (overlay.classList.contains("active")) {
        document.body.style.overflow = "hidden";
    } else {
        document.body.style.overflow = "auto";
    }
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

document.getElementById('cerrarSesion').addEventListener('click', () => {
  localStorage.removeItem('usuario');

  window.location.href = '../../index.html';
});

document.addEventListener("DOMContentLoaded", () => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    const profileInfo = document.querySelector(".profile-info");

    if (!usuario || !profileInfo) {
        profileInfo.innerHTML = `
            <p><strong>Nombre:</strong> No disponible</p>
            <p><strong>Correo:</strong> No disponible</p>
            <p><strong>Fecha de registro:</strong> No disponible</p>
            <p><strong>Nivel actual:</strong> No disponible</p>
            <p><strong>Puntos:</strong> No disponible</p>
        `;
        return;
    }

    console.log(profileInfo)
    console.log(usuario)

    profileInfo.innerHTML = `
      <p><strong>Nombre:</strong> ${usuario.nombre || 'Sin nombre'}</p>
      <p><strong>Correo:</strong> ${usuario.correo || 'Sin correo'}</p>
      <p><strong>Fecha de registro:</strong> ${usuario.fecha_registro 
        ? new Date(usuario.fecha_registro).toLocaleDateString()
        : 'No disponible'}</p>
      <p><strong>Nivel actual:</strong> ${usuario.nivel || 'No asignado'}</p>
      <p><strong>Puntos:</strong> ${usuario.puntos || 0}</p>
    `;
});