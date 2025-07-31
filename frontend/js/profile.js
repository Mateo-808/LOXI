import { supabase } from "./supabaseClient.js"; // Asegúrate de que esta ruta sea correcta

function toggleMobileMenu() {
    const overlay = document.getElementById("mobileMenuOverlay");
    const burgerMenu = document.querySelector(".burger-menu");

    overlay.classList.toggle("active");
    burgerMenu.classList.toggle("active");

    document.body.style.overflow = overlay.classList.contains("active") ? "hidden" : "auto";
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

document.getElementById("cerrarSesion").addEventListener("click", () => {
    localStorage.removeItem("usuario");
    window.location.href = "../../index.html";
});

document.addEventListener("DOMContentLoaded", async () => {
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

    // Buscar fecha real desde la tabla progreso
    let fechaRegistro = 'No disponible';
    try {
        const { data: progreso, error } = await supabase
            .from("progreso")
            .select("fecha")
            .eq("usuario_id", usuario.id)
            .order("fecha", { ascending: true })
            .limit(1)
            .single();

        if (error) {
            console.warn("No se pudo obtener la fecha de registro desde progreso:", error.message);
        } else if (progreso && progreso.fecha) {
            fechaRegistro = new Date(progreso.fecha).toLocaleDateString();
        }
    } catch (err) {
        console.error("Error obteniendo progreso:", err);
    }

    profileInfo.innerHTML = `
        <p><strong>Nombre:</strong> ${usuario.name || usuario.nombre || "Sin nombre"}</p>
        <p><strong>Correo:</strong> ${usuario.email || usuario.correo || "Sin correo"}</p>
        <p><strong>Fecha de inicio:</strong> ${fechaRegistro}</p>
        <p><strong>Nivel actual:</strong> ${usuario.nivel || "No asignado"}</p>
        <p><strong>Puntos:</strong> ${usuario.puntos || 0}</p>
    `;
});
