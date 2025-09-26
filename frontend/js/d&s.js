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
    const form = document.getElementById("formComentario");
    const input = document.getElementById("write");
    const lista = document.getElementById("lista-comentarios");

    const usuarioStr = localStorage.getItem("usuario");
    const usuarioActual = usuarioStr ? JSON.parse(usuarioStr) : null;

    if (!form || !input || !lista) return;

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
            const res = await fetch(
                "https://loxi.onrender.com/api/comentarios",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        usuario_id: usuarioActual.id,
                        mensaje,
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok || !data.ok) {
                console.error("Error enviando comentario:", data);
                alert("× No se pudo enviar el comentario");
                return;
            }

            input.value = "";
            cargarComentarios();
        } catch (err) {
            console.error("Error de conexión al enviar comentario:", err);
            alert("× No se pudo enviar el comentario");
        }
    });

    async function cargarComentarios() {
        try {
            const res = await fetch(
                "https://loxi.onrender.com/api/comentarios"
            );
            const json = await res.json();
            if (!res.ok || !json.ok) {
                console.error("Error al cargar comentarios:", json);
                return;
            }

            json.data.forEach((c, index) => {
                const nombre =
                    c.usuarios && c.usuarios.nombre
                        ? c.usuarios.nombre
                        : "Anónimo";
                const fecha = c.fecha
                    ? new Date(c.fecha).toLocaleString("es-CO", {
                          timeZone: "America/Bogota",
                      })
                    : "";

                const newComment = document.createElement("div");
                newComment.className =
                    index % 2 === 0 ? "faq-card-small" : "faq-card";
                newComment.innerHTML = `
          <div class="faq-question">${escapeHtml(c.mensaje)}</div>

          <div class="faq-admin">
            ADMIN <i class="fa-solid fa-code"></i>
          </div>
          
          <div class="faq-answer">
            Al terminar el programa puedes ingresar a la sección
            de prácticas y buscar en la sección de "Mi progreso"
          </div>

          <div class="faq-user">
            <div class="user-avatar"></div>
            <div class="user-name">${escapeHtml(nombre)}</div>
          </div>

          <div class="faq-date">${fecha}</div>

          <div class="faq-like">
            <i class="fa-regular fa-heart"></i>
          </div>
        `;

                if (usuarioActual && c.usuario_id === usuarioActual.id) {
                    const btnEditar = document.createElement("button");
                    btnEditar.textContent = "Editar";
                    btnEditar.className = "btn-editar";
                    btnEditar.onclick = () => editarComentario(c);

                    const btnEliminar = document.createElement("button");
                    btnEliminar.textContent = "Eliminar";
                    btnEliminar.className = "btn-eliminar";
                    btnEliminar.onclick = () => eliminarComentario(c.id);

                    const botonesDiv = document.createElement("div");
                    botonesDiv.className = "comentario-actions";
                    botonesDiv.appendChild(btnEditar);
                    botonesDiv.appendChild(btnEliminar);

                    newComment.appendChild(botonesDiv);
                }
                lista.appendChild(newComment);
            });
        } catch (err) {
            console.error("Error al cargar comentarios (fetch):", err);
        }
    }

    async function editarComentario(comentario) {
        const nuevoMensaje = prompt(
            "Editar tu comentario:",
            comentario.mensaje
        );
        if (!nuevoMensaje) return;

        try {
            const res = await fetch(
                `https://loxi.onrender.com/api/comentarios/${comentario.id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ mensaje: nuevoMensaje }),
                }
            );

            const data = await res.json();
            if (res.ok && data.ok) {
                alert("Comentario actualizado");
                cargarComentarios();
            } else {
                alert("Error al editar comentario");
            }
        } catch (err) {
            console.error("Error al editar comentario:", err);
        }
    }

    async function eliminarComentario(id) {
        if (!confirm("¿Seguro que quieres eliminar este comentario?")) return;

        try {
            const res = await fetch(
                `https://loxi.onrender.com/api/comentarios/${id}`,
                { method: "DELETE" }
            );
            const data = await res.json();

            if (res.ok && data.ok) {
                alert("Comentario eliminado");
                cargarComentarios();
            } else {
                alert("Error al eliminar comentario");
            }
        } catch (err) {
            console.error("Error al eliminar comentario:", err);
        }
    }

    function escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }

    cargarComentarios();
});
