import { supabase } from "./supabaseClient.js";

const storeModal = document.getElementById("storeModal");
const storeContainer = document.getElementById("store-container");
const mobileMenuOverlay = document.getElementById("mobileMenuOverlay");

window.toggleMobileMenu = function () {
    mobileMenuOverlay.classList.toggle("active");
};

window.toggleMenuSection = function (section) {
    const items = section.querySelector(".mobile-menu-items");
    section.classList.toggle("open");
    items.classList.toggle("show");
};

window.closeMobileMenu = function () {
    mobileMenuOverlay.classList.remove("active");
};

window.openStoreModal = function () {
    storeModal.style.display = "flex";
    loadStoreProducts();
};

window.closeStoreModal = function () {
    storeModal.style.display = "none";
};

window.closeModalOnOutside = function (event) {
    if (event.target === storeModal) closeStoreModal();
};

document.addEventListener("DOMContentLoaded", async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        alert("Por favor, inicia sesión.");
        window.location.href = "../../index.html";
        return;
    }

    const nombreEl = document.querySelector(".profile-info p:nth-child(1)");
    const correoEl = document.querySelector(".profile-info p:nth-child(2)");
    const fechaEl = document.querySelector(".profile-info p:nth-child(3)");
    const nivelEl = document.querySelector(".profile-info p:nth-child(4)");
    const puntosEl = document.querySelector(".profile-info p:nth-child(5)");

    nombreEl.innerHTML = `<strong><i class="fa-solid fa-signature"></i> Nombre:</strong> ${user.nombre}`;
    correoEl.innerHTML = `<strong><i class="fa-solid fa-envelope"></i> Correo:</strong> ${user.email}`;
    fechaEl.innerHTML = `<strong><i class="fa-solid fa-calendar-days"></i> Fecha de registro:</strong> ${new Date(user.created_at).toLocaleDateString()}`;
    nivelEl.innerHTML = `<strong><i class="fa-solid fa-ranking-star"></i> Nivel actual:</strong> Cargando...`;
    puntosEl.innerHTML = `<strong><i class="fa-solid fa-gem"></i> Puntos:</strong> Cargando...`;

    await loadUserProgress(user.id, puntosEl);
});

async function loadUserProgress(userId, puntosEl) {
    try {
        const { data, error } = await supabase
            .from("progreso")
            .select("puntuacion")
            .eq("usuario_id", userId);

        if (error) throw error;

        const totalPuntos = data.reduce((sum, row) => sum + (row.puntuacion || 0), 0);

        localStorage.setItem("userPoints", totalPuntos);
        puntosEl.innerHTML = `<strong><i class="fa-solid fa-gem"></i> Puntos:</strong> ${totalPuntos}`;
    } catch (err) {
        console.error("Error al cargar progreso:", err.message);
        puntosEl.innerHTML = `<strong><i class="fa-solid fa-gem"></i> Puntos:</strong> Error`;
    }
}

async function loadStoreProducts() {
    try {
        const response = await fetch("../js/data/shop.json");
        const productos = await response.json();
        const userPoints = parseInt(localStorage.getItem("userPoints")) || 0;

        storeContainer.innerHTML = productos
            .map((item) => {
                const puedeComprar = userPoints >= item.precio;
                return `
                <div class="store-item ${puedeComprar ? "" : "disabled"}">
                    <img src="${item.imagen}" alt="${item.nombre}" />
                    <h3>${item.nombre}</h3>
                    <p>${item.descripcion}</p>
                    <p class="precio"><i class="fa-solid fa-gem"></i> ${item.precio}</p>
                    <button class="buy-btn" ${!puedeComprar ? "disabled" : ""} onclick="comprarProducto('${item.id}', ${item.precio})">
                        ${puedeComprar ? "Comprar" : "No tienes suficientes puntos"}
                    </button>
                </div>`;
            })
            .join("");
    } catch (err) {
        console.error("Error al cargar productos:", err);
        storeContainer.innerHTML = "<p>Error al cargar los productos.</p>";
    }
}

window.comprarProducto = async function (id, precio) {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        alert("Debes iniciar sesión para comprar.");
        return;
    }

    let userPoints = parseInt(localStorage.getItem("userPoints")) || 0;
    if (userPoints < precio) {
        alert("No tienes suficientes puntos.");
        return;
    }

    userPoints -= precio;
    localStorage.setItem("userPoints", userPoints);

    const puntosEl = document.querySelector(".profile-info p:nth-child(5)");
    puntosEl.innerHTML = `<strong><i class="fa-solid fa-gem"></i> Puntos:</strong> ${userPoints}`;

    try {
        const { data: registro, error: selectError } = await supabase
            .from("progreso")
            .select("id, puntuacion")
            .eq("usuario_id", user.id)
            .is("ejercicio_id", null)
            .single();

        if (selectError && selectError.code !== "PGRST116") throw selectError;

        if (registro) {
            const { error: updateError } = await supabase
                .from("progreso")
                .update({ puntuacion: userPoints })
                .eq("id", registro.id);

            if (updateError) throw updateError;
        } else {
            const { error: insertError } = await supabase.from("progreso").insert([
                {
                    usuario_id: user.id,
                    ejercicio_id: null,
                    completado: false,
                    puntuacion: userPoints,
                    nivel: "Novato"
                },
            ]);

            if (insertError) throw insertError;
        }

        alert("✅ ¡Has comprado este producto exitosamente!");
        loadStoreProducts();
    } catch (error) {
        console.error("Error al actualizar puntos en Supabase:", error.message);
        alert("⚠️ Error al actualizar tus puntos en la base de datos.");
    }
};

const cerrarSesionBtn = document.getElementById("cerrarSesion");
cerrarSesionBtn.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "../../index.html";
});
