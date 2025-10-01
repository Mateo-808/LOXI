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

async function obtenerEjercicios(nivel) {
    try {
        const res = await fetch(`http://localhost:3000/api/ejercicios`);
        if (!res.ok) throw new Error("Error al obtener ejercicios");

        const data = await res.json();

        // Filtrar los ejercicios por el nivel que recibimos
        return data.data.filter((ej) => ej.nivel === nivel);
    } catch (err) {
        console.error(err);
        return [];
    }
}

function getNivel() {
    const params = new URLSearchParams(window.location.search);
    return params.get("nivel") || "principiante";
}

async function generarEjercicios(nivel) {
    const container = document.getElementById("ejercicios-container");
    const ejercicios = await obtenerEjercicios(nivel);

    container.innerHTML = "";

    ejercicios.forEach((ejercicio, index) => {
        const detailsElement = document.createElement("details");
        detailsElement.setAttribute("name", "ejercicios");

        detailsElement.innerHTML = `
            <summary>
                <div class="summary-text">
                    Ejercicio ${index + 1}: ${ejercicio.nombre}
                </div>
                <span class="chevron">
                    <img
                        width="24"
                        height="24"
                        src="https://img.icons8.com/material-rounded/24/FFFFFF/chevron-down.png"
                        alt="chevron-down"
                    />
                </span>
            </summary>
            <p>${ejercicio.descripcion}</p>
            <a class="button_two" href="interface.html?nivel=${nivel}&ejercicio=${index + 1}">
                Iniciar ahora
            </a>
        `;

        container.appendChild(detailsElement);
    });
}

function inicializarPagina() {
    const nivel = getNivel();
    const titulo = document.getElementById("titulo");
    const contenido = document.getElementById("contenido");

    switch (nivel) {
        case "principiante":
            titulo.textContent = "Prácticas para Principiantes";
            contenido.textContent =
                "Aquí encontrarás ejercicios básicos para empezar desde cero.";
            break;
        case "novato":
            titulo.textContent = "Prácticas para Novatos";
            contenido.textContent =
                "Tienes algo de experiencia, vamos a subir el nivel.";
            break;
        case "intermedio":
            titulo.textContent = "Prácticas Intermedias";
            contenido.textContent =
                "Estas prácticas te ayudarán a consolidar tus conocimientos.";
            break;
        case "avanzado":
            titulo.textContent = "Prácticas Avanzadas";
            contenido.textContent =
                "Retos de alto nivel para que pongas a prueba tus habilidades.";
            break;
        default:
            titulo.textContent = "Nivel no reconocido";
            contenido.textContent =
                "Por favor selecciona un nivel válido desde la página de niveles.";
    }

    generarEjercicios(nivel);
}

document.addEventListener("DOMContentLoaded", inicializarPagina);
