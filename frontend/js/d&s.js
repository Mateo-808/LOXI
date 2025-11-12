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
        btnSesion.href = '../pages/admin.html';

        btnSesionMobile.textContent = 'Ir al Panel';
        btnSesionMobile.href = '../pages/admin.html';
      } else {
        btnSesion.textContent = 'Ver perfil';
        btnSesion.href = '../pages/profile.html';

        btnSesionMobile.textContent = 'Ver perfil';
        btnSesionMobile.href = '../pages/profile.html';
      }
    } catch (error) {
      console.error('Error al parsear usuario de localStorage:', error);
      btnSesion.textContent = 'Iniciar sesión';
      btnSesion.href = '../pages/login.html';

      btnSesionMobile.textContent = 'Iniciar sesión';
      btnSesionMobile.href = '../pages/login.html';
    }
  } else {
    btnSesion.textContent = 'Iniciar sesión';
    btnSesion.href = '../pages/login.html';

    btnSesionMobile.textContent = 'Iniciar sesión';
    btnSesionMobile.href = '../pages/login.html';
  }
});

document.querySelector(".down-arrow").addEventListener("click", () => {
    faqTitle.scrollIntoView({ behavior: "smooth" });
});

const faqTitle = document.getElementById("faq-title");
const heartIcons = document.querySelectorAll(".faq-like i");

document.addEventListener("click", (e) => {
  if (e.target.matches(".faq-like i")) {
    e.target.classList.toggle("fa-regular");
    e.target.classList.toggle("fa-solid");
    e.target.classList.toggle("filled");
  }
});

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-comentario");
    const input = document.getElementById("input-comentario");
    const lista = document.getElementById("lista-comentarios");

    // ✅ Cargar usuario actual del LocalStorage
    const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual"));

    // ✅ Cargar comentarios guardados localmente
    let comentariosLocales = JSON.parse(localStorage.getItem("comentarios")) || [];

    // Renderizar los comentarios guardados localmente
    renderComentarios(comentariosLocales);

    // =====================================================
    // 📨 Enviar nuevo comentario
    // =====================================================
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const mensaje = input.value.trim();
        if (!mensaje) {
            alert("Escribe algo antes de enviar.");
            return;
        }

        if (!usuarioActual) {
            alert("Debes iniciar sesión para enviar una sugerencia.");
            return;
        }

        try {
            const res = await fetch("https://loxi.onrender.com/api/comentarios", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    usuario_id: usuarioActual.id,
                    mensaje,
                }),
            });

            const data = await res.json();

            if (!res.ok || !data.ok) {
                console.error("Error enviando comentario:", data);
                alert("× No se pudo enviar el comentario. Intenta de nuevo más tarde.");
                return;
            }

            // ✅ Guardar el comentario localmente sin mostrarlo en pantalla
            const nuevoComentario = {
                usuario: usuarioActual.nombre || "Usuario",
                mensaje: mensaje,
                fecha: new Date().toLocaleString(),
            };

            comentariosLocales.push(nuevoComentario);
            localStorage.setItem("comentarios", JSON.stringify(comentariosLocales));

            // ✅ Mostrar mensaje de confirmación
            mostrarMensajeConfirmacion("✅ Tu comentario ha sido enviado. Será respondido lo más pronto posible.");

            // Limpiar input
            input.value = "";

        } catch (err) {
            console.error("Error de conexión al enviar comentario:", err);
            alert("× No se pudo enviar el comentario. Revisa tu conexión.");
        }
    });

    // =====================================================
    // 🧾 Función para renderizar los comentarios locales
    // =====================================================
    function renderComentarios(comentarios) {
        lista.innerHTML = "";
        comentarios.forEach((comentario) => {
            const item = document.createElement("li");
            item.classList.add("comentario-item");
            item.innerHTML = `
                <strong>${comentario.usuario}:</strong>
                <p>${comentario.mensaje}</p>
                <small>${comentario.fecha}</small>
            `;
            lista.appendChild(item);
        });
    }

    // =====================================================
    // 💬 Función para mostrar un mensaje bonito de confirmación
    // =====================================================
    function mostrarMensajeConfirmacion(texto) {
        const mensajeDiv = document.createElement("div");
        mensajeDiv.textContent = texto;
        mensajeDiv.classList.add("mensaje-confirmacion");

        // Estilo del mensaje (puedes modificarlo a tu gusto)
        Object.assign(mensajeDiv.style, {
            position: "fixed",
            bottom: "20px",
            right: "20px",
            background: "#27ae60",
            color: "white",
            padding: "12px 18px",
            borderRadius: "8px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            fontSize: "14px",
            zIndex: "9999",
            opacity: "0",
            transition: "opacity 0.4s ease",
        });

        document.body.appendChild(mensajeDiv);
        setTimeout(() => (mensajeDiv.style.opacity = "1"), 50);

        // Desaparecer después de 3 segundos
        setTimeout(() => {
            mensajeDiv.style.opacity = "0";
            setTimeout(() => mensajeDiv.remove(), 400);
        }, 3000);
    }
});
