import { supabase } from './supabaseClient.js';

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
    if (overlay.classList.contains("active") && !overlay.contains(event.target) && !burgerMenu.contains(event.target)) {
        closeMobileMenu();
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeMobileMenu();
        closeStoreModal();
    }
});

function openStoreModal() {
    const modal = document.getElementById('storeModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeStoreModal() {
    const modal = document.getElementById('storeModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function closeModalOnOutside(event) {
    if (event.target.id === 'storeModal') {
        closeStoreModal();
    }
}

const cerrarSesionBtn = document.getElementById('cerrarSesion');
if (cerrarSesionBtn) {
    cerrarSesionBtn.addEventListener('click', () => {
        localStorage.removeItem('usuario');
        window.location.href = '../../index.html';
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const profileInfo = document.querySelector(".profile-info");
    if (!usuario || !profileInfo) {
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

    const fecha = usuario.fecha || usuario.created_at;
    const fechaFormateada = fecha ? new Date(fecha).toLocaleDateString() : 'No disponible';
    profileInfo.innerHTML = `
        <p><strong><i class="fa-solid fa-signature"></i> Nombre:</strong> ${usuario.name || usuario.nombre || 'Sin nombre'}</p>
        <p><strong><i class="fa-solid fa-envelope"></i> Correo:</strong> ${usuario.email || usuario.correo || 'Sin correo'}</p>
        <p><strong><i class="fa-solid fa-calendar-days"></i> Fecha de registro:</strong> ${fechaFormateada}</p>
        <p><strong><i class="fa-solid fa-ranking-star"></i> Nivel actual:</strong> ${usuario.nivel || 'No asignado'}</p>
        <p><strong><i class="fa-solid fa-gem"></i> Puntos:</strong> ${usuario.puntos ?? 0}</p>
    `;

    const levelButton = document.querySelector(".level-games");
    if (!levelButton) return;

    levelButton.addEventListener("click", () => {
        if (!usuario) {
            alert("No se ha encontrado tu sesión actual.");
            return;
        }
        if (usuario.es_admin === true) {
            window.location.href = "../pages/admin";
            return;
        }
        if (!usuario.nivel) {
            alert("No se ha encontrado tu nivel actual.");
            return;
        }
        const nivel = usuario.nivel.toLowerCase().trim();
        const url = `../pages/interface.html?nivel=${encodeURIComponent(nivel)}`;
        window.location.href = url;
    });
});

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

        contenedor.addEventListener("click", async (e) => {
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
                    const { error } = await supabase
                        .from("progreso")
                        .update({ puntuacion: usuarioActual.puntos })
                        .eq("usuario_id", usuarioActual.id);
                    if (error) console.error("Error al actualizar la puntuación:", error);
                    e.target.innerHTML = '<i class="fa-solid fa-check"></i> Comprado';
                    e.target.disabled = true;
                    alert(`¡Has comprado ${producto.nombre}!`);
                    const profileInfo = document.querySelector(".profile-info");
                    if (profileInfo) {
                        const fecha = usuarioActual.fecha || usuarioActual.created_at;
                        const fechaFormateada = fecha ? new Date(fecha).toLocaleDateString() : 'No disponible';
                        profileInfo.innerHTML = `
                            <p><strong><i class="fa-solid fa-signature"></i> Nombre:</strong> ${usuarioActual.name || usuarioActual.nombre || 'Sin nombre'}</p>
                            <p><strong><i class="fa-solid fa-envelope"></i> Correo:</strong> ${usuarioActual.email || usuarioActual.correo || 'Sin correo'}</p>
                            <p><strong><i class="fa-solid fa-calendar-days"></i> Fecha de registro:</strong> ${fechaFormateada}</p>
                            <p><strong><i class="fa-solid fa-ranking-star"></i> Nivel actual:</strong> ${usuarioActual.nivel || 'No asignado'}</p>
                            <p><strong><i class="fa-solid fa-gem"></i> Puntos:</strong> ${usuarioActual.puntos ?? 0}</p>
                        `;
                    }
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

window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;
window.openStoreModal = openStoreModal;
window.closeStoreModal = closeStoreModal;
window.toggleMenuSection = toggleMenuSection;
window.closeModalOnOutside = closeModalOnOutside;
