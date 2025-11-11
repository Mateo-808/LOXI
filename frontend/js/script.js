const terminalOutput = document.getElementById("terminal-output");
const terminalInput = document.getElementById("terminal-input");

let commandHistory = [];
let historyIndex = -1;

// Añade una nueva línea de comando al terminal
function addCommandLine(command) {
    const commandLine = document.createElement("div");
    commandLine.className = "command-line";
    commandLine.innerHTML = `
        <span class="command-prompt">loxi@terminal:~$</span>
        <span class="command-text">${command}</span>`;
    terminalOutput.appendChild(commandLine);
}

// Añade una línea de salida al terminal
function addOutputLine(content, className = "") {
    const outputLine = document.createElement("div");
    outputLine.className = `output-line ${className}`;
    outputLine.innerHTML = content;
    terminalOutput.appendChild(outputLine);

    // Scroll automático al final
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

const comandos = {
    // Muestra la lista de comandos disponibles
    help: function () {
        const helpContent = `
            <div class="info-header">Comandos Disponibles:</div>
            <div class="info-section">
                <div>info       - Muestra información del usuario</div>
                <div>clear      - Limpia la pantalla</div>
                <div>help       - Muestra esta lista de comandos</div>
                <div>date       - Muestra la fecha y hora actual</div>
                <div>whoami     - Muestra el nombre de usuario</div>
            </div>`;
        addOutputLine(helpContent);
    },

    info: function () {
        const infoContent = `
            <div class="info-header">Información de Loxi</div>
            <div class="info-section">
                <div><strong>¿Quiénes somos?: </strong>Loxi es una plataforma web inteligente enfocada en evaluar y potenciar las habilidades lógico-matemáticas de estudiantes que desean ingresar o que ya cursan la media técnica. A través de análisis personalizados, retroalimentación precisa y rutas de mejora, Loxi acompaña a cada estudiante en su camino para ingresar con confianza, avanzar con solidez y destacar en su proceso formativo.
                </div>
            </div>`;
        addOutputLine(infoContent, "user-info");
    },

    clear: function () {
        terminalOutput.innerHTML = "";
    },

    date: function () {
        addOutputLine(new Date().toString());
    },

    // RECORDATORIO: cambiar cuando tengamos la base de datos
    whoami: function () {
        addOutputLine("loxi");
    },
};

// Procesa el comando ingresado
function procesarComando(commandLine) {
    const parts = commandLine.trim().split(" ");
    const command = parts[0].toLowerCase();
    const args = parts.slice(1).join(" ");

    if (command && comandos.hasOwnProperty(command)) {
        comandos[command](args);
    } else if (command) {
        addOutputLine(`comando no encontrado: ${command}`, "error-message");
    }
}

terminalInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();

        const command = terminalInput.value;

        if (command.trim()) {
            commandHistory.push(command);
            historyIndex = commandHistory.length;

            addCommandLine(command);
            procesarComando(command);
        }

        terminalInput.value = "";
    } else if (event.key === "ArrowUp") {
        if (historyIndex > 0) {
            historyIndex--;
            terminalInput.value = commandHistory[historyIndex];
        }

        // Mover el cursor al final
        setTimeout(() => {
            terminalInput.selectionStart = terminalInput.value.length;
            terminalInput.selectionEnd = terminalInput.value.length;
        }, 0);
    } else if (event.key === "ArrowDown") {
        if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            terminalInput.value = commandHistory[historyIndex];
        } else if (historyIndex === commandHistory.length - 1) {
            historyIndex++;
            terminalInput.value = "";
        }
    }
});

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