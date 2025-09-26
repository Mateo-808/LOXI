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

const ejerciciosPorNivel = {
    principiante: [
        {
            nombre: "La caja misteriosa",
            descripcion:
                "Dentro de la caja, cada número entra y sale transformado.",
        },
        {
            nombre: "Comparador de caminos",
            descripcion: "Dos niños corren por caminos distintos.",
        },
        {
            nombre: "Bloques equivalentes",
            descripcion: "Dos torres deben tener el mismo peso.",
        },
        {
            nombre: "Telaraña de sumas",
            descripcion: "Cada hilo conecta dos números que deben sumar 10.",
        },
        {
            nombre: "Torres y pesos",
            descripcion: "Una torre de cubos pesa lo mismo que otra.",
        },
        {
            nombre: "Comida del dragón",
            descripcion: "El dragón solo come pares.",
        },
        {
            nombre: "Círculo numérico",
            descripcion:
                "Cada número en el círculo es la suma de los dos anteriores.",
        },
        {
            nombre: "Puerta lógica simple",
            descripcion:
                "Para abrir la puerta, el número debe ser mayor a 5 y menor que 10.",
        },
        {
            nombre: "Caminos con condición",
            descripcion:
                "Si el número es múltiplo de 3, vas a la izquierda; si no, a la derecha.",
        },
        {
            nombre: "Casa de acertijos",
            descripcion: "Cada puerta tiene una suma oculta.",
        },
    ],
    novato: [
        {
            nombre: "Secuencia de piedras",
            descripcion:
                "Identificar y continuar patrones aritméticos lineales (progresiones).",
        },
        {
            nombre: "Diana numérica",
            descripcion:
                "Sumar puntuaciones de lanzamientos; practicar suma rápida y verificación.",
        },
        {
            nombre: "Figura siguiente",
            descripcion:
                "Patrón alternante de figuras; detectar repetición periódica.",
        },
        {
            nombre: "Camino del conejo",
            descripcion:
                "Trayectoria con movimientos alternados; traducir la secuencia a desplazamiento final.",
        },
        {
            nombre: "Cuenta y compara",
            descripcion:
                "Comparación directa de cantidades; refuerza ‘mayor/menor/igual’.",
        },
        {
            nombre: "El nido lógico",
            descripcion:
                "Valor por unidad y multiplicación simple en contexto (cada huevo tiene valor).",
        },
        {
            nombre: "Búsqueda del número perdido",
            descripcion:
                "Completar secuencias impares/pares; deducción del término que falta.",
        },
        {
            nombre: "Monstruo come-pares",
            descripcion:
                "Clasificar números como pares o impares mediante preguntas sencillas.",
        },
        {
            nombre: "La puerta mágica",
            descripcion:
                "Resolver una operación simple para abrir una puerta (verificación de suma).",
        },
        {
            nombre: "Puzzle de frutas",
            descripcion:
                "Sistema simple de ecuaciones con símbolos (una fruta representa un número).",
        },
    ],
    intermedio: [
        {
            nombre: "Laberinto numérico",
            descripcion:
                "Camino con operaciones distintas según dirección (practica orden de operaciones aplicadas a pasos).",
        },
        {
            nombre: "Puente de múltiplos",
            descripcion:
                "Buscar el siguiente múltiplo de un número dado (práctica de múltiplos y divisibilidad).",
        },
        {
            nombre: "Juego de deducción",
            descripcion:
                "Usar pistas encadenadas para acotar posibilidades numéricas (razonamiento por eliminación).",
        },
        {
            nombre: "Caja con condiciones",
            descripcion:
                "Aplicar regla condicional simple: si es par → operar de una forma; si impar → otra.",
        },
        {
            nombre: "Rompecabezas inverso",
            descripcion:
                "Dado un resultado, deducir el número inicial resolviendo una ecuación simple.",
        },
        {
            nombre: "Fábrica de patrones",
            descripcion:
                "Reconocer patrones exponenciales (multiplicativos) y predecir el siguiente término.",
        },
        {
            nombre: "Nave del algoritmo",
            descripcion:
                "Aplicar una secuencia de operaciones (pequeño algoritmo) paso a paso a un número inicial.",
        },
        {
            nombre: "Ecuaciones básicas",
            descripcion:
                "Resolver ecuaciones lineales sencillas para encontrar la incógnita.",
        },
        {
            nombre: "El circuito lógico",
            descripcion:
                "Introducción a lógica booleana básica (AND, OR) con valores verdadero/falso.",
        },
        {
            nombre: "Caja de números mágicos",
            descripcion:
                "Aplicar una regla que combina operaciones sobre el número y sus dígitos (práctica de suma de dígitos).",
        },
    ],
    avanzado: [
        {
            nombre: "Bloques de programación",
            descripcion:
                "Pensamiento secuencial: repetir bloques de instrucciones y calcular efecto total (introducción a bucles).",
        },
        {
            nombre: "Puertas de lógica avanzada",
            descripcion:
                "Componer operadores booleanos (AND, OR, NOT) y evaluar expresiones más complejas.",
        },
        {
            nombre: "Rompecódigos",
            descripcion:
                "Resolver constraints sobre dígitos: suma total, inclusión de un dígito dado y no repetición.",
        },
        {
            nombre: "Ruta condicional",
            descripcion:
                "Decidir entre varias ramas según condiciones (simula estructuras if/else anidadas).",
        },
        {
            nombre: "Sistemas simbólicos",
            descripcion:
                "Interpretar fórmulas lógicas con símbolos (¬, ∨, ∧) en lenguaje natural.",
        },
        {
            nombre: "El hacker lógico",
            descripcion:
                "Intersecar varias afirmaciones para encontrar números que satisfacen todas las condiciones (razonamiento conjunctivo).",
        },
        {
            nombre: "Programando la torre (aclaración + cálculo)",
            descripcion:
                "Aplicar un bloque de operaciones repetido: definimos el bloque como (duplicar → luego sumar 1) y se repite 2 veces. Objetivo: reforzar cómo la repetición de un bloque transforma el valor.",
        },
        {
            nombre: "Ecuaciones encadenadas",
            descripcion:
                "Resolver sistemas lineales simples de dos ecuaciones con dos incógnitas.",
        },
        {
            nombre: "Construye el algoritmo",
            descripcion:
                "Diseñar la lógica (pseudocódigo mental) que convierte un número en “su doble más 1” y aplicarlo a un caso concreto.",
        },
        {
            nombre: "Simulación matemática",
            descripcion:
                "Crecimiento exponencial: entender duplicación periódica y calcular resultados tras varias iteraciones.",
        },
    ],
};

function getNivel() {
    const params = new URLSearchParams(window.location.search);
    return params.get("nivel") || "principiante";
}

function generarEjercicios(nivel) {
    const container = document.getElementById("ejercicios-container");
    const ejercicios =
        ejerciciosPorNivel[nivel] || ejerciciosPorNivel.principiante;

    container.innerHTML = "";

    ejercicios.forEach((ejercicio, index) => {
        const detailsElement = document.createElement("details");
        detailsElement.setAttribute("name", "ejercicios");

        detailsElement.innerHTML = `
            <summary>
                <div class="summary-text">
                    Ejercicio ${index + 1}: ${ejercicio.nombre}
                </div>
                <span class="chevron">
                    <img
                        width="24"
                        height="24"
                        src="https://img.icons8.com/material-rounded/24/FFFFFF/chevron-down.png"
                        alt="chevron-down"
                    />
                </span>
            </summary>
            <p>${ejercicio.descripcion}</p>
            <button class="button_two">
                <a href="interface.html?nivel=${nivel}&ejercicio=${
            index + 1
        }">Iniciar ahora</a>
            </button>
        `;

        container.appendChild(detailsElement);
    });
}

function inicializarPagina() {
    const nivel = getNivel();
    const titulo = document.getElementById("titulo");
    const contenido = document.getElementById("contenido");

    switch (nivel) {
        case "principiante":
            titulo.textContent = "Prácticas para Principiantes";
            contenido.textContent =
                "Aquí encontrarás ejercicios básicos para empezar desde cero.";
            break;
        case "novato":
            titulo.textContent = "Prácticas para Novatos";
            contenido.textContent =
                "Tienes algo de experiencia, vamos a subir el nivel.";
            break;
        case "intermedio":
            titulo.textContent = "Prácticas Intermedias";
            contenido.textContent =
                "Estas prácticas te ayudarán a consolidar tus conocimientos.";
            break;
        case "avanzado":
            titulo.textContent = "Prácticas Avanzadas";
            contenido.textContent =
                "Retos de alto nivel para que pongas a prueba tus habilidades.";
            break;
        default:
            titulo.textContent = "Nivel no reconocido";
            contenido.textContent =
                "Por favor selecciona un nivel válido desde la página de niveles.";
    }

    generarEjercicios(nivel);
}

document.addEventListener("DOMContentLoaded", inicializarPagina);
