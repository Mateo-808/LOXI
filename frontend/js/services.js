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

document.addEventListener('DOMContentLoaded', () => {
  const btnSesion = document.getElementById('btnSesion');
  const btnSesionMobile = document.getElementById('btnSesionMobile');

  const usuarioGuardado = localStorage.getItem('usuario');

  if (usuarioGuardado) {
    try {
      const usuario = JSON.parse(usuarioGuardado);
      
      if (usuario.es_admin === true) {
        btnSesion.textContent = 'Ir al Panel';
        btnSesion.href = 'frontend/pages/admin.html';

        btnSesionMobile.textContent = 'Ir al Panel';
        btnSesionMobile.href = 'frontend/pages/admin.html';
      } else {
        btnSesion.textContent = 'Ver perfil';
        btnSesion.href = 'frontend/pages/profile.html';

        btnSesionMobile.textContent = 'Ver perfil';
        btnSesionMobile.href = 'frontend/pages/profile.html';
      }
    } catch (error) {
      console.error('Error al parsear usuario de localStorage:', error);
      btnSesion.textContent = 'Iniciar sesión';
      btnSesion.href = 'frontend/pages/login.html';

      btnSesionMobile.textContent = 'Iniciar sesión';
      btnSesionMobile.href = 'frontend/pages/login.html';
    }
  } else {
    btnSesion.textContent = 'Iniciar sesión';
    btnSesion.href = 'frontend/pages/login.html';

    btnSesionMobile.textContent = 'Iniciar sesión';
    btnSesionMobile.href = 'frontend/pages/login.html';
  }
});