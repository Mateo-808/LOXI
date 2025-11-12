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
    const form = document.getElementById("formComentario");
    const input = document.getElementById("write");

    const usuarioStr = localStorage.getItem("usuario");
    const usuarioActual = usuarioStr ? JSON.parse(usuarioStr) : null;

    if (!form || !input) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const mensaje = input.value.trim();
        if (!mensaje) {
            mostrarAlerta("Escribe algo antes de enviar 📝", "warning");
            return;
        }

        if (!usuarioActual) {
            mostrarAlerta("Debes iniciar sesión para enviar una sugerencia 🔒", "warning");
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
                mostrarAlerta("No se pudo enviar el comentario ❌", "error");
                return;
            }

            input.value = "";
            mostrarAlerta("Tu comentario ha sido enviado personita :). Lo responderemos pronto ✨", "success");
        } catch (err) {
            console.error("Error de conexión al enviar comentario:", err);
            mostrarAlerta("No se pudo enviar el comentario ❌", "error");
        }
    });

    function mostrarAlerta(mensaje, tipo) {
        // Remover alertas existentes
        const alertaExistente = document.querySelector('.alerta-comentario');
        if (alertaExistente) {
            alertaExistente.remove();
        }

        // Crear la alerta
        const alerta = document.createElement('div');
        alerta.className = `alerta-comentario alerta-${tipo}`;
        alerta.innerHTML = `
            <div class="alerta-contenido">
                <span class="alerta-icono">${tipo === 'success' ? '✓' : tipo === 'warning' ? '⚠' : '✕'}</span>
                <span class="alerta-texto">${mensaje}</span>
            </div>
        `;

        // Agregar estilos si no existen
        if (!document.getElementById('estilos-alerta')) {
            const estilos = document.createElement('style');
            estilos.id = 'estilos-alerta';
            estilos.textContent = `
                .alerta-comentario {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 1.5rem 2rem;
                    border-radius: 16px;
                    box-shadow: 0px 0px 20px rgba(0, 255, 255, 0.15);
                    z-index: 10000;
                    animation: slideIn 0.3s ease-out;
                    max-width: 420px;
                    font-family: 'Poppins', sans-serif;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                }

                .alerta-success {
                    background: linear-gradient(135deg, rgba(17, 17, 17, 0.95) 0%, rgba(34, 34, 34, 0.95) 100%);
                    color: white;
                    border-left: 4px solid #16a34a;
                }

                .alerta-warning {
                    background: linear-gradient(135deg, rgba(17, 17, 17, 0.95) 0%, rgba(34, 34, 34, 0.95) 100%);
                    color: white;
                    border-left: 4px solid #f59e0b;
                }

                .alerta-error {
                    background: linear-gradient(135deg, rgba(17, 17, 17, 0.95) 0%, rgba(34, 34, 34, 0.95) 100%);
                    color: white;
                    border-left: 4px solid #ef4444;
                }

                .alerta-contenido {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .alerta-icono {
                    font-size: 2rem;
                    font-weight: bold;
                    min-width: 40px;
                    text-align: center;
                }

                .alerta-success .alerta-icono {
                    color: #16a34a;
                }

                .alerta-warning .alerta-icono {
                    color: #f59e0b;
                }

                .alerta-error .alerta-icono {
                    color: #ef4444;
                }

                .alerta-texto {
                    font-size: 0.95rem;
                    line-height: 1.5;
                    color: #ddd;
                }

                @keyframes slideIn {
                    from {
                        transform: translateX(450px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }

                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(450px);
                        opacity: 0;
                    }
                }

                @media (max-width: 768px) {
                    .alerta-comentario {
                        top: 10px;
                        right: 10px;
                        left: 10px;
                        max-width: none;
                        padding: 1.25rem 1.5rem;
                    }
                }
            `;
            document.head.appendChild(estilos);
        }

        // Agregar al DOM
        document.body.appendChild(alerta);

        // Remover después de 4 segundos
        setTimeout(() => {
            alerta.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => alerta.remove(), 300);
        }, 4000);
    }
});