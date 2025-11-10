import { supabase } from "./supabaseClient.js"; // Asegúrate de tener este archivo configurado

/* ============================================================
   🔹 MENÚ MÓVIL
============================================================ */
function toggleMobileMenu() {
  const overlay = document.getElementById("mobileMenuOverlay");
  const burgerMenu = document.querySelector(".burger-menu");

  overlay.classList.toggle("active");
  burgerMenu.classList.toggle("active");
}

function toggleMenuSection(section) {
  const items = section.querySelector(".mobile-menu-items");
  const icon = section.querySelector("i");

  items.classList.toggle("active");
  icon.classList.toggle("rotated");
}

window.toggleMobileMenu = toggleMobileMenu;
window.toggleMenuSection = toggleMenuSection;

const nombreEl = document.querySelector(".profile-info p:nth-child(1)");
const correoEl = document.querySelector(".profile-info p:nth-child(2)");
const fechaEl = document.querySelector(".profile-info p:nth-child(3)");
const nivelEl = document.querySelector(".profile-info p:nth-child(4)");
const puntosEl = document.querySelector(".profile-info p:nth-child(5)");
const cerrarSesionBtn = document.getElementById("cerrarSesion");

async function obtenerUsuario() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    window.location.href = "../../index.html";
    return null;
  }
  return data.user;
}

async function obtenerPuntos(usuarioId) {
  const { data, error } = await supabase
    .from("progreso")
    .select("puntuacion")
    .eq("usuario_id", usuarioId);

  if (error) {
    console.error("Error al obtener puntos:", error);
    return 0;
  }

  return data.reduce((total, row) => total + (row.puntuacion || 0), 0);
}

async function cargarPerfil() {
  const usuario = await obtenerUsuario();
  if (!usuario) return;

  const puntos = await obtenerPuntos(usuario.id);
  localStorage.setItem("puntos", puntos);

  nombreEl.innerHTML = `<strong>Nombre:</strong> ${usuario.user_metadata?.nombre || "Desconocido"}`;
  correoEl.innerHTML = `<strong>Correo:</strong> ${usuario.email}`;
  fechaEl.innerHTML = `<strong>Fecha de registro:</strong> ${new Date(usuario.created_at).toLocaleDateString()}`;
  nivelEl.innerHTML = `<strong>Nivel actual:</strong> Calculando...`;
  puntosEl.innerHTML = `<strong>Puntos:</strong> ${puntos}`;
}

cerrarSesionBtn.addEventListener("click", async () => {
  await supabase.auth.signOut();
  localStorage.removeItem("puntos");
  window.location.href = "../../index.html";
});

cargarPerfil();

const tiendaBtn = document.createElement("button");
tiendaBtn.classList.add("open-store");
tiendaBtn.innerHTML = `<i class="fa-solid fa-store"></i>`;
document.body.appendChild(tiendaBtn);

const modal = document.createElement("div");
modal.classList.add("store-modal");
modal.innerHTML = `
  <div class="store-content">
    <button class="close-store">&times;</button>
    <h2>Tienda de LOXI</h2>
    <div class="store-points">
      Puntos actuales: <span id="storePoints">${localStorage.getItem("puntos") || 0}</span>
    </div>
    <div id="storeItems" class="store-items"></div>
  </div>
`;
document.body.appendChild(modal);

tiendaBtn.addEventListener("click", () => modal.classList.add("active"));
modal.querySelector(".close-store").addEventListener("click", () => modal.classList.remove("active"));

async function cargarTienda() {
  try {
    const response = await fetch("../js/data/tienda.json");
    const productos = await response.json();
    const contenedor = document.getElementById("storeItems");

    contenedor.innerHTML = "";

    productos.forEach((item) => {
      const card = document.createElement("div");
      card.classList.add("store-item");
      card.innerHTML = `
        <img src="${item.imagen}" alt="${item.nombre}">
        <h3>${item.nombre}</h3>
        <p>${item.descripcion}</p>
        <p class="price">${item.precio} pts</p>
        <button class="buy-btn">Comprar</button>
      `;

      card.querySelector(".buy-btn").addEventListener("click", () => comprarItem(item));
      contenedor.appendChild(card);
    });
  } catch (error) {
    console.error("Error cargando tienda:", error);
  }
}

async function comprarItem(item) {
  let puntos = parseInt(localStorage.getItem("puntos") || 0);
  if (puntos < item.precio) {
    alert("❌ No tienes suficientes puntos.");
    return;
  }

  puntos -= item.precio;
  localStorage.setItem("puntos", puntos);
  document.getElementById("storePoints").textContent = puntos;
  puntosEl.innerHTML = `<strong>Puntos:</strong> ${puntos}`;
  alert(`✅ Has comprado ${item.nombre}. ¡Disfrútalo!`);
}

cargarTienda();

const style = document.createElement("style");
style.textContent = `
.store-modal {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: rgba(0,0,0,0.8);
  display: none;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.store-modal.active { display: flex; }

.store-content {
  background: #1e1e2f;
  color: white;
  padding: 2rem;
  border-radius: 1rem;
  width: 90%;
  max-width: 600px;
  text-align: center;
  position: relative;
}
.close-store {
  position: absolute;
  top: 1rem; right: 1rem;
  background: none;
  border: none;
  font-size: 2rem;
  color: white;
  cursor: pointer;
}
.store-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}
.store-item {
  background: #292942;
  border-radius: 0.8rem;
  padding: 1rem;
}
.store-item img {
  width: 80px; height: 80px;
  object-fit: contain;
}
.buy-btn {
  background: #a93226;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  color: white;
  cursor: pointer;
  transition: 0.3s;
}
.buy-btn:hover { background: #922b21; }
.open-store {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  background: #a93226;
  border: none;
  padding: 1rem 1.2rem;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  font-size: 1.5rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  transition: 0.3s;
}
.open-store:hover { background: #922b21; }
`;
document.head.appendChild(style);
