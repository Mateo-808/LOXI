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
    btnSesion.textContent = 'Ver perfil';
    btnSesion.href = '../pages/profile.html';

    btnSesionMobile.textContent = 'Ver perfil';
    btnSesionMobile.href = '../pages/profile.html';
  } else {
    btnSesion.textContent = 'Iniciar sesión';
    btnSesion.href = '../pages/login.html';

    btnSesionMobile.textContent = 'Iniciar sesión';
    btnSesionMobile.href = '../pages/login.html';
  }
});

const faqTitle = document.getElementById('faq-title');
const heartIcons = document.querySelectorAll('.faq-like i');

document.querySelector(".down-arrow").addEventListener("click", () => {
    faqTitle.scrollIntoView({ behavior: "smooth" });
});

heartIcons.forEach(icon => {
    icon.addEventListener('click', () => {
        icon.classList.toggle('fa-regular');
        icon.classList.toggle('fa-solid');
        icon.classList.toggle('filled');
    });
});

heartIcon.addEventListener('click', () => {
    heartIcon.classList.toggle('fa-regular');
    heartIcon.classList.toggle('fa-solid');
});
