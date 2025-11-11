const result = document.getElementById("result");
const sendBtn = document.getElementById("send");
const input = document.getElementById("write");
const title = document.querySelector(".description h2");
const question = document.querySelector(".text");
const description = document.querySelector(".description");

// Función para inicializar el contenedor de chat
function initializeChatContainer() {
    const chatContainer = document.createElement("div");
    chatContainer.className = "chat-container";
    chatContainer.id = "chatContainer";

    description.appendChild(chatContainer);
}

// Inicializar el contenedor cuando se carga la página
window.addEventListener("DOMContentLoaded", function () {
    initializeChatContainer();

    // Enfocar automáticamente el campo de entrada al cargar
    input.focus();
});

// Función para guardar progreso en Supabase
async function guardarProgreso(nivel, puntuacion, completado = true) {
    try {
        console.log("=== INICIANDO GUARDADO DE PROGRESO ===");

        // Obtener el ID del usuario desde localStorage
        const usuarioGuardado = localStorage.getItem("usuario");
        let usuarioId = null;

        if (usuarioGuardado) {
            try {
                const usuario = JSON.parse(usuarioGuardado);
                usuarioId = usuario.id;
                console.log(
                    "Usuario encontrado:",
                    usuario.nombre,
                );
            } catch (e) {
                console.error("Error al parsear usuario guardado:", e);
            }
        } else {
            usuarioId =
                localStorage.getItem("user_id") ||
                localStorage.getItem("usuario_id");
        }

        const ejercicioId = "7c1a8ae1-a72e-4a4f-9efb-5a7be07a8b3a"; // UUID del ejercicio de lógica

        if (!usuarioId) {
            console.warn(
                "No se encontró ID de usuario válido. El progreso no se guardará."
            );
            return;
        }

        // URL de tu servidor
        const serverUrl =
            window.location.hostname === "localhost"
                ? "http://localhost:3000"
                : "https://loxi.onrender.com";

        const datosAEnviar = {
            usuario_id: usuarioId,
            ejercicio_id: ejercicioId,
            completado: completado,
            puntuacion: puntuacion,
            nivel: nivel,
            intentos: 1,
        };

        const response = await fetch(`${serverUrl}/api/progreso`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(datosAEnviar),
        });

        const responseText = await response.text();

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error("Error al parsear respuesta JSON:", e);
            throw new Error(
                `Respuesta no válida del servidor: ${responseText}`
            );
        }

        if (!response.ok) {
            throw new Error(data.error || `Error HTTP: ${response.status}`);
        }
        return data;
    } catch (error) {
        console.error("=== ERROR AL GUARDAR PROGRESO ===");
        console.error("Error completo:", error);
        console.error("Stack trace:", error.stack);
    }
}

// Función para enviar el mensaje y procesar la respuesta
function sendMessage() {
    const answer = input.value.trim();
    const chatContainer = document.getElementById("chatContainer");
    const writeContainer = document.querySelector(".write");

    if (answer === "") return;

    chatContainer.innerHTML += `
        <div class="user-msg">Tú: ${answer}</div>
    `;

    input.value = "";

    const numAnswer = parseInt(answer);
    let level = "";
    let redirectURL = "";
    let isValidAnswer = false;
    let puntuacion = 0;

    if (numAnswer === 42) {
        level = "Avanzado";
        puntuacion = 100;
        redirectURL = `../pages/practice.html?nivel=${level.toLowerCase()}`;
        isValidAnswer = true;
    } else if (numAnswer === 36) {
        level = "Intermedio";
        puntuacion = 75;
        redirectURL = `../pages/practice.html?nivel=${level.toLowerCase()}`;
        isValidAnswer = true;
    } else if (numAnswer === 30 || numAnswer === 40) {
        level = numAnswer === 40 ? "Principiante" : "Novato";
        puntuacion = numAnswer === 40 ? 60 : 40;
        redirectURL = `../pages/practice.html?nivel=${level.toLowerCase()}`;
        isValidAnswer = true;
    } else {
        level = "No identificado";
        puntuacion = 0;
        isValidAnswer = false;
    }

    // Ocultar el área de entrada después de recibir una respuesta
    writeContainer.classList.add("write-hidden");

    // Mostrar respuesta según si es válida o no
    setTimeout(() => {
        if (isValidAnswer) {
            chatContainer.innerHTML += `
                <div class="bot-msg">LOXI: Su nivel de lógica es <strong>${level}</strong></div>
            `;

            // Guardar progreso en Supabase
            guardarProgreso(level, puntuacion, true);

            // Guardar también en localStorage para usarlo en otras páginas
            localStorage.setItem("nivel", level.toLowerCase());
        } else {
            chatContainer.innerHTML += `
                <div class="bot-msg error-msg">LOXI: <strong>Respuesta incorrecta.</strong> Necesita intentarlo de nuevo para obtener un nivel de lógica válido.</div>
            `;
        }

        scrollToBottom(result);
    }, 1000);

    // Mostrar explicación o volver a intentar
    setTimeout(() => {
        if (isValidAnswer) {
            let explanation = "";

            if (numAnswer === 42) {
                explanation = `La secuencia sigue un patrón de diferencias cuadráticas...`;
            } else if (numAnswer === 36) {
                explanation = `Muchas personas identifican un patrón donde...`;
            } else if (numAnswer === 40) {
                explanation = `Has identificado un patrón de suma...`;
            } else if (numAnswer === 30) {
                explanation = `Has identificado probablemente un patrón repetitivo...`;
            }

            chatContainer.innerHTML += `
                <div class="bot-msg">LOXI: <strong>Explicación:</strong><br>${explanation}</div>
            `;
        } else {
            chatContainer.innerHTML += `
                <div class="bot-msg">LOXI: La secuencia 2, 6, 12, 20, 30... sigue un patrón específico. Analice cuidadosamente cómo aumentan los números.</div>
            `;
            setTimeout(() => {
                writeContainer.classList.remove("write-hidden");
                input.focus();
            }, 1500);
        }

        scrollToBottom(result);
    }, 2000);

    // Preguntar si quiere continuar
    if (isValidAnswer) {
        setTimeout(() => {
            chatContainer.innerHTML += `
                <div class="bot-msg">LOXI: ¿Quiere continuar con su experiencia? 
                    <div class="continue-options">
                        <button class="continue-btn yes">Sí, continuar</button>
                        <button class="continue-btn no">No, gracias</button>
                    </div>
                </div>
            `;

            scrollToBottom(result);

            document.querySelectorAll(".continue-btn").forEach((btn) => {
                btn.addEventListener("click", function () {
                    if (this.classList.contains("yes")) {
                        if (redirectURL) {
                            window.location.href = redirectURL;
                        } else {
                            chatContainer.innerHTML += `
                                <div class="bot-msg">LOXI: Preparando su experiencia personalizada...</div>
                            `;
                            scrollToBottom(result);
                        }
                    } else {
                        chatContainer.innerHTML += `
                            <div class="bot-msg">LOXI: Gracias por participar. ¡Vuelva pronto!</div>
                        `;
                        setTimeout(() => {
                            window.location.href = "../../index.html";
                        }, 2000);
                        scrollToBottom(result);
                    }
                });
            });
        }, 3000);
    }
}

// Función para desplazar al final del chat
function scrollToBottom(element) {
    element.scrollTop = element.scrollHeight;
}

// Agregar evento de click al botón de enviar
sendBtn.addEventListener("click", sendMessage);

// Agregar evento de tecla Enter al campo de entrada
input.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        sendMessage();
    }
});

// Funciones para el menú móvil
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

// Event listeners para el menú móvil
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

// Manejo de sesión de usuario
document.addEventListener('DOMContentLoaded', () => {
  const btnSesion = document.getElementById('btnSesion');
  const btnSesionMobile = document.getElementById('btnSesionMobile');

  const usuarioGuardado = localStorage.getItem('usuario');

  if (usuarioGuardado) {
    try {
      const usuario = JSON.parse(usuarioGuardado);
      
      if (usuario.es_admin === true) {
        btnSesion.textContent = 'Ir al Panel';
        btnSesion.href = 'frontend/pages/admin.html';

        btnSesionMobile.textContent = 'Ir al Panel';
        btnSesionMobile.href = 'frontend/pages/admin.html';
      } else {
        btnSesion.textContent = 'Ver perfil';
        btnSesion.href = 'frontend/pages/profile.html';

        btnSesionMobile.textContent = 'Ver perfil';
        btnSesionMobile.href = 'frontend/pages/profile.html';
      }
    } catch (error) {
      console.error('Error al parsear usuario de localStorage:', error);
      btnSesion.textContent = 'Iniciar sesión';
      btnSesion.href = 'frontend/pages/login.html';

      btnSesionMobile.textContent = 'Iniciar sesión';
      btnSesionMobile.href = 'frontend/pages/login.html';
    }
  } else {
    btnSesion.textContent = 'Iniciar sesión';
    btnSesion.href = 'frontend/pages/login.html';

    btnSesionMobile.textContent = 'Iniciar sesión';
    btnSesionMobile.href = 'frontend/pages/login.html';
  }
});
