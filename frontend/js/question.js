const result = document.getElementById("result");
const sendBtn = document.getElementById("send");
const input = document.getElementById("write");
const title = document.querySelector(".description h2");
const question = document.querySelector(".text");
const description = document.querySelector(".description");

// Crear un contenedor de chat desde el inicio
function initializeChatContainer() {
    // No modificamos la estructura original, solo preparamos para añadir el chat
    const chatContainer = document.createElement('div');
    chatContainer.className = 'chat-container';
    chatContainer.id = 'chatContainer';
    
    // Añadir el contenedor de chat después de la pregunta, sin reemplazar nada
    description.appendChild(chatContainer);
}

// Inicializar al cargar la página
window.addEventListener('DOMContentLoaded', function() {
    initializeChatContainer();
});

sendBtn.addEventListener("click", () => {
    const answer = input.value.trim();
    const chatContainer = document.getElementById("chatContainer");

    if (answer === "") return;
    
    // Agregar mensaje del usuario
    chatContainer.innerHTML += `
        <div class="user-msg">Tú: ${answer}</div>
    `;
    
    // Limpiar el campo de entrada
    input.value = "";
    
    const numAnswer = parseInt(answer);
    let level = "";
    let redirectURL = "";

    if (numAnswer === 42) {
        level = "Avanzado";
        redirectURL = "../pages/nivel-avanzado.html";
    } else if (numAnswer === 36) {
        level = "Intermedio";
        redirectURL = "../pages/nivel-intermedio.html";
    } else if (numAnswer === 30 || numAnswer === 40) {
        level = "Básico";
        redirectURL = "../pages/nivel-basico.html";
    } else {
        level = "Sin clasificar";
        redirectURL = "../pages/intentalo-nuevamente.html";
    }

    // Mostrar nivel dentro del mismo bloque
    setTimeout(() => {
        chatContainer.innerHTML += `
            <div class="bot-msg">LOXI: Su nivel de lógica es <strong>${level}</strong></div>
        `;
        
        // Hacer scroll hacia abajo automáticamente
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 1000);
    
    // Mostrar explicación del ejercicio
    setTimeout(() => {
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
        } else {
            explanation = `La secuencia 2, 6, 12, 20, 30... sigue un patrón donde las diferencias entre números consecutivos aumentan en 2.
            <br>Las diferencias son: +4, +6, +8, +10, y luego +12, lo que nos lleva a 42 como siguiente número.`;
        }
        
        chatContainer.innerHTML += `
            <div class="bot-msg">LOXI: <strong>Explicación:</strong><br>${explanation}</div>
        `;
        
        // Hacer scroll hacia abajo automáticamente para mostrar la explicación
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 2000);

    // Preguntar si quiere continuar
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
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
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
                        chatContainer.scrollTop = chatContainer.scrollHeight;
                    }
                } else {
                    // Si es "No", agradecer
                    chatContainer.innerHTML += `
                        <div class="bot-msg">LOXI: Gracias por participar. ¡Vuelva pronto!</div>
                    `;
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                }
            });
        });
    }, 3000);
});