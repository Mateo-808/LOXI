import { supabase } from './supabaseClient.js';

// =============================
// 🌐 MENÚ MÓVIL
// =============================
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

document.addEventListener("click", (event) => {
    const overlay = document.getElementById("mobileMenuOverlay");
    const burgerMenu = document.querySelector(".burger-menu");
    if (overlay.classList.contains("active") && !overlay.contains(event.target) && !burgerMenu.contains(event.target)) {
        closeMobileMenu();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeMobileMenu();
        closeStoreModal();
    }
});

// =============================
// 🏪 MODAL DE TIENDA
// =============================
function openStoreModal() {
    const modal = document.getElementById("storeModal");
    if (modal) {
        modal.classList.add("active");
        document.body.style.overflow = "hidden";
    }
}

function closeStoreModal() {
    const modal = document.getElementById("storeModal");
    if (modal) {
        modal.classList.remove("active");
        document.body.style.overflow = "auto";
    }
}

function closeModalOnOutside(event) {
    if (event.target.id === "storeModal") {
        closeStoreModal();
    }
}

// =============================
// 🔒 CERRAR SESIÓN
// =============================
const cerrarSesionBtn = document.getElementById("cerrarSesion");
if (cerrarSesionBtn) {
    cerrarSesionBtn.addEventListener("click", () => {
        localStorage.removeItem("usuario");
        localStorage.removeItem("compras");
        window.location.href = "../../index.html";
    });
}

// =============================
// 👤 CARGAR PERFIL DEL USUARIO
// =============================
document.addEventListener("DOMContentLoaded", async () => {
    const usuarioLocal = JSON.parse(localStorage.getItem("usuario"));
    const profileInfo = document.querySelector(".profile-info");

    if (!usuarioLocal) {
        if (profileInfo) {
            profileInfo.innerHTML = `
                <p><strong><i class="fa-solid fa-signature"></i> Nombre:</strong> No disponible</p>
                <p><strong><i class="fa-solid fa-envelope"></i> Correo:</strong> No disponible</p>
                <p><strong><i class="fa-solid fa-calendar-days"></i> Fecha de registro:</strong> No disponible</p>
                <p><strong><i class="fa-solid fa-ranking-star"></i> Nivel actual:</strong> No disponible</p>
                <p><strong><i class="fa-solid fa-gem"></i> Puntos:</strong> No disponible</p>
            `;
        }
        return;
    }

    try {
        // 🔹 Traer los puntos desde la tabla progreso
        const { data: progreso, error } = await supabase
            .from("progreso")
            .select("puntuacion")
            .eq("usuario_id", usuarioLocal.id);

        if (error) throw error;

        const puntosTotales = progreso?.reduce((sum, p) => sum + (p.puntuacion || 0), 0) || 0;
        usuarioLocal.puntos = puntosTotales;

        localStorage.setItem("usuario", JSON.stringify(usuarioLocal));

        const fecha = usuarioLocal.fecha || usuarioLocal.created_at;
        const fechaFormateada = fecha ? new Date(fecha).toLocaleDateString() : "No disponible";

        profileInfo.innerHTML = `
            <p><strong><i class="fa-solid fa-signature"></i> Nombre:</strong> ${usuarioLocal.name || usuarioLocal.nombre || "Sin nombre"}</p>
            <p><strong><i class="fa-solid fa-envelope"></i> Correo:</strong> ${usuarioLocal.email || usuarioLocal.correo || "Sin correo"}</p>
            <p><strong><i class="fa-solid fa-calendar-days"></i> Fecha de registro:</strong> ${fechaFormateada}</p>
            <p><strong><i class="fa-solid fa-ranking-star"></i> Nivel actual:</strong> ${usuarioLocal.nivel || "No asignado"}</p>
            <p><strong><i class="fa-solid fa-gem"></i> Puntos:</strong> ${puntosTotales}</p>
        `;
    } catch (err) {
        console.error("Error al obtener progreso:", err);
    }

    // 🔹 Botón de nivel o juegos
    const levelButton = document.querySelector(".level-games");
    if (!levelButton) return;

    levelButton.addEventListener("click", () => {
        if (usuarioLocal.es_admin === true) {
            window.location.href = "../pages/admin";
            return;
        }

        if (!usuarioLocal.nivel) {
            alert("No se ha encontrado tu nivel actual.");
            return;
        }

        const nivel = usuarioLocal.nivel.toLowerCase().trim();
        window.location.href = `../pages/interface.html?nivel=${encodeURIComponent(nivel)}`;
    });
});

// =============================
// 🛒 CARGAR TIENDA
// =============================
async function cargarTienda() {
    const contenedor = document.getElementById("store-container");
    if (!contenedor) return;

    try {
        const response = await fetch("../js/data/tienda.json");
        const productos = await response.json();

        const usuario = JSON.parse(localStorage.getItem("usuario")) || {};
        const compras = JSON.parse(localStorage.getItem("compras")) || [];

        contenedor.innerHTML = "";

        productos.forEach((item) => {
            const comprado = compras.includes(item.id);
            const card = document.createElement("div");
            card.classList.add("store-item");
            card.innerHTML = `
                <img src="${item.imagen}" alt="${item.nombre}">
                <h3>${item.nombre}</h3>
                <p>${item.descripcion}</p>
                <p class="price"><i class="fa-solid fa-gem"></i> ${item.precio} puntos</p>
                <button ${comprado ? "disabled" : ""} data-id="${item.id}">
                    ${comprado ? '<i class="fa-solid fa-check"></i> Comprado' : '<i class="fa-solid fa-cart-shopping"></i> Comprar'}
                </button>
            `;
            contenedor.appendChild(card);
        });

        contenedor.addEventListener("click", (e) => {
            if (e.target.tagName === "BUTTON" && !e.target.disabled) {
                const id = parseInt(e.target.dataset.id);
                const producto = productos.find((p) => p.id === id);
                if (!producto) return;

                const usuarioActual = JSON.parse(localStorage.getItem("usuario")) || {};
                const comprasActuales = JSON.parse(localStorage.getItem("compras")) || [];

                if (usuarioActual.puntos >= producto.precio) {
                    usuarioActual.puntos -= producto.precio;
                    comprasActuales.push(producto.id);

                    localStorage.setItem("usuario", JSON.stringify(usuarioActual));
                    localStorage.setItem("compras", JSON.stringify(comprasActuales));

                    e.target.innerHTML = '<i class="fa-solid fa-check"></i> Comprado';
                    e.target.disabled = true;

                    alert(`¡Has comprado ${producto.nombre}!`);

                    // Actualizar puntos en la vista del perfil
                    const puntosEl = document.querySelector(".profile-info p:last-child");
                    if (puntosEl) puntosEl.innerHTML = `<strong><i class="fa-solid fa-gem"></i> Puntos:</strong> ${usuarioActual.puntos}`;
                } else {
                    alert("No tienes suficientes puntos para esta compra.");
                }
            }
        });
    } catch (error) {
        console.error("Error al cargar la tienda:", error);
        contenedor.innerHTML = "<p style='text-align: center; color: #c9d6ff;'>Error al cargar los productos de la tienda.</p>";
    }
}

document.addEventListener("DOMContentLoaded", cargarTienda);
