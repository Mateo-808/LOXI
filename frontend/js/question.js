const result = document.getElementById("result");
const sendBtn = document.getElementById("send");
const input = document.getElementById("write");
const title = document.querySelector(".description h2");
const question = document.querySelector(".text");
const description = document.querySelector(".description");

// Función para inicializar el contenedor de chat
function initializeChatContainer() {
    const chatContainer = document.createElement('div');
    chatContainer.className = 'chat-container';
    chatContainer.id = 'chatContainer';
    
    description.appendChild(chatContainer);
}

// Inicializar el contenedor cuando se carga la página
window.addEventListener('DOMContentLoaded', function() {
    initializeChatContainer();
    
    // Enfocar automáticamente el campo de entrada al cargar
    input.focus();
});

// Función para guardar progreso en Supabase
async function guardarProgreso(nivel, puntuacion, completado = true) {
    try {
        // Obtener el ID del usuario desde localStorage (ajustar según tu implementación)
        const usuarioId = localStorage.getItem('id') || localStorage.getItem('usuario_id');
        const ejercicioId = '550e8400-e29b-41d4-a716-446655440001'; 
        
        if (!usuarioId) {
            console.warn('No se encontró ID de usuario. El progreso no se guardará.');
            return;
        }

        // URL de tu servidor 
        const serverUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:3000' 
            : 'https://loxi.onrender.com'; 
        
        const response = await fetch(`${serverUrl}/api/progreso`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                usuario_id: usuarioId,
                ejercicio_id: ejercicioId,
                completado: completado,
                puntuacion: puntuacion,
                nivel_logica: nivel,
                intentos: 1
            })
        });

        const data = await response.json();
        
        if (!data.ok) {
            throw new Error(data.error || 'Error al guardar progreso');
        }

        console.log('Progreso guardado exitosamente:', data);
        return data;
        
    } catch (error) {
        console.error('Error al guardar progreso:', error);
        
        // Mostrar mensaje discreto al usuario
        const chatContainer = document.getElementById("chatContainer");
        if (chatContainer) {
            chatContainer.innerHTML += `
                <div class="bot-msg" style="opacity: 0.7; font-style: italic;">
                    LOXI: <small>(Progreso no guardado - ${error.message})</small>
                </div>
            `;
            scrollToBottom(result);
        }
    }
}

// Función para enviar el mensaje
function sendMessage() {
    const answer = input.value.trim();
    const chatContainer = document.getElementById("chatContainer");
    const writeContainer = document.querySelector('.write');

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
        redirectURL = "../pages/services.html";
        isValidAnswer = true;
    } else if (numAnswer === 36) {
        level = "Intermedio";
        puntuacion = 75;
        redirectURL = "../pages/services.html";
        isValidAnswer = true;
    } else if (numAnswer === 30 || numAnswer === 40) {
        level = numAnswer === 40 ? "Principiante" : "Novato";
        puntuacion = numAnswer === 40 ? 60 : 40;
        redirectURL = "../pages/services.html";
        isValidAnswer = true;
    } else {
        level = "No identificado";
        puntuacion = 0;
        isValidAnswer = false;
    }

    // Ocultar el área de entrada después de recibir una respuesta
    writeContainer.classList.add('write-hidden');
    
    // Mostrar respuesta según si es válida o no
    setTimeout(() => {
        if (isValidAnswer) {
            chatContainer.innerHTML += `
                <div class="bot-msg">LOXI: Su nivel de lógica es <strong>${level}</strong></div>
            `;
            
            // Guardar progreso en Supabase de forma asíncrona
            guardarProgreso(level, puntuacion, true);
        } else {
            chatContainer.innerHTML += `
                <div class="bot-msg error-msg">LOXI: <strong>Respuesta incorrecta.</strong> Necesita intentarlo de nuevo para obtener un nivel de lógica válido.</div>
            `;
        }
        
        // Hacer scroll hacia abajo automáticamente
        scrollToBottom(result);
    }, 1000);
    
    // Mostrar explicación del ejercicio o instrucciones para volver a intentar
    setTimeout(() => {
        if (isValidAnswer) {
            let explanation = "";
            
            if (numAnswer === 42) {
                explanation = `La secuencia sigue un patrón de diferencias cuadráticas. La diferencia entre cada número aumenta siguiendo n²: 
                <br>2 → +4 → 6 → +6 → 12 → +8 → 20 → +10 → 30 → <strong>+12</strong> → 42
                <br>Las diferencias son: 4, 6, 8, 10, 12 (que corresponden a 2², 2×3, 2×4, 2×5, 2×6)
                <br>¡Has identificado correctamente el patrón avanzado!`;
            } else if (numAnswer === 36) {
                explanation = `Muchas personas identifican un patrón donde cada diferencia aumenta de forma constante:
                <br>2 → +4 → 6 → +6 → 12 → +8 → 20 → +10 → 30 → <strong>+6</strong> → 36
                <br>Este es un patrón intermedio común, aunque la secuencia completa sigue otro patrón.`;
            } else if (numAnswer === 40) {
                explanation = `Has identificado un patrón de suma: 2 + (4+6+8+10+10) = 40
                <br>Este enfoque es creativo, pero la secuencia completa sigue otro patrón.`;
            } else if (numAnswer === 30) {
                explanation = `Has identificado probablemente un patrón repetitivo.
                <br>Este es un error común, ya que busca repetir el último número.`;
            }
            
            chatContainer.innerHTML += `
                <div class="bot-msg">LOXI: <strong>Explicación:</strong><br>${explanation}</div>
            `;
        } else {
            chatContainer.innerHTML += `
                <div class="bot-msg">LOXI: La secuencia 2, 6, 12, 20, 30... sigue un patrón específico. Analice cuidadosamente cómo aumentan los números.</div>
            `;
            // Mostrar de nuevo el área de entrada después de un momento
            setTimeout(() => {
                writeContainer.classList.remove('write-hidden');
                input.focus();
            }, 1500);
        }
        
        // Hacer scroll hacia abajo automáticamente
        scrollToBottom(result);
    }, 2000);

    // Si la respuesta es válida, preguntar si quiere continuar
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
            
            // Hacer scroll hacia abajo automáticamente
            scrollToBottom(result);
            
            // Agregar eventos a los botones
            document.querySelectorAll('.continue-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    if (this.classList.contains('yes')) {
                        // Si es "Sí", redirigir según nivel
                        if (redirectURL) {
                            window.location.href = redirectURL;
                        } else {
                            chatContainer.innerHTML += `
                                <div class="bot-msg">LOXI: Preparando su experiencia personalizada...</div>
                            `;
                            scrollToBottom(result);
                        }
                    } else {
                        // Si es "No", agradecer
                        chatContainer.innerHTML += `
                            <div class="bot-msg">LOXI: Gracias por participar. ¡Vuelva pronto!</div>
                        `;
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
input.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
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
        if (btnSesion) {
            btnSesion.textContent = 'Ver perfil';
            btnSesion.href = '../pages/profile.html';
        }

        if (btnSesionMobile) {
            btnSesionMobile.textContent = 'Ver perfil';
            btnSesionMobile.href = '../pages/profile.html';
        }
    } else {
        if (btnSesion) {
            btnSesion.textContent = 'Iniciar sesión';
            btnSesion.href = '../pages/login.html';
        }

        if (btnSesionMobile) {
            btnSesionMobile.textContent = 'Iniciar sesión';
            btnSesionMobile.href = '../pages/login.html';
        }
    }
});