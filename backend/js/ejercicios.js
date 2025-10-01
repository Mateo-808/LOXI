// Solo se ejercuta cuando se van a insertar nuevos ejercicios en la base de datos

import fetch from "node-fetch";

const SUPABASE_URL = "https://bllvqufahggmbhhfqidk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsbHZxdWZhaGdnbWJoaGZxaWRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyMTA1NTgsImV4cCI6MjA1OTc4NjU1OH0.Sucy2GME2XYMxW7cVSbqnxG4cmeTkY2IeqSvWUHSxts";

const ejerciciosPorNivel = {
  principiante: [
    { nombre: "La caja misteriosa", descripcion: "Dentro de la caja, cada número entra y sale transformado." },
    { nombre: "Comparador de caminos", descripcion: "Dos niños corren por caminos distintos." },
    { nombre: "Bloques equivalentes", descripcion: "Dos torres deben tener el mismo peso." },
    { nombre: "Telaraña de sumas", descripcion: "Cada hilo conecta dos números que deben sumar 10." },
    { nombre: "Torres y pesos", descripcion: "Una torre de cubos pesa lo mismo que otra." },
    { nombre: "Comida del dragón", descripcion: "El dragón solo come pares." },
    { nombre: "Círculo numérico", descripcion: "Cada número en el círculo es la suma de los dos anteriores." },
    { nombre: "Puerta lógica simple", descripcion: "Para abrir la puerta, el número debe ser mayor a 5 y menor que 10." },
    { nombre: "Caminos con condición", descripcion: "Si el número es múltiplo de 3, vas a la izquierda; si no, a la derecha." },
    { nombre: "Casa de acertijos", descripcion: "Cada puerta tiene una suma oculta." },
  ],
  novato: [
    { nombre: "Secuencia de piedras", descripcion: "Identificar y continuar patrones aritméticos lineales (progresiones)." },
    { nombre: "Diana numérica", descripcion: "Sumar puntuaciones de lanzamientos; practicar suma rápida y verificación." },
    { nombre: "Figura siguiente", descripcion: "Patrón alternante de figuras; detectar repetición periódica." },
    { nombre: "Camino del conejo", descripcion: "Trayectoria con movimientos alternados; traducir la secuencia a desplazamiento final." },
    { nombre: "Cuenta y compara", descripcion: "Comparación directa de cantidades; refuerza ‘mayor/menor/igual’." },
    { nombre: "El nido lógico", descripcion: "Valor por unidad y multiplicación simple en contexto (cada huevo tiene valor)." },
    { nombre: "Búsqueda del número perdido", descripcion: "Completar secuencias impares/pares; deducción del término que falta." },
    { nombre: "Monstruo come-pares", descripcion: "Clasificar números como pares o impares mediante preguntas sencillas." },
    { nombre: "La puerta mágica", descripcion: "Resolver una operación simple para abrir una puerta (verificación de suma)." },
    { nombre: "Puzzle de frutas", descripcion: "Sistema simple de ecuaciones con símbolos (una fruta representa un número)." },
  ],
  intermedio: [
    { nombre: "Laberinto numérico", descripcion: "Camino con operaciones distintas según dirección (practica orden de operaciones aplicadas a pasos)." },
    { nombre: "Puente de múltiplos", descripcion: "Buscar el siguiente múltiplo de un número dado (práctica de múltiplos y divisibilidad)." },
    { nombre: "Juego de deducción", descripcion: "Usar pistas encadenadas para acotar posibilidades numéricas (razonamiento por eliminación)." },
    { nombre: "Caja con condiciones", descripcion: "Aplicar regla condicional simple: si es par → operar de una forma; si impar → otra." },
    { nombre: "Rompecabezas inverso", descripcion: "Dado un resultado, deducir el número inicial resolviendo una ecuación simple." },
    { nombre: "Fábrica de patrones", descripcion: "Reconocer patrones exponenciales (multiplicativos) y predecir el siguiente término." },
    { nombre: "Nave del algoritmo", descripcion: "Aplicar una secuencia de operaciones (pequeño algoritmo) paso a paso a un número inicial." },
    { nombre: "Ecuaciones básicas", descripcion: "Resolver ecuaciones lineales sencillas para encontrar la incógnita." },
    { nombre: "El circuito lógico", descripcion: "Introducción a lógica booleana básica (AND, OR) con valores verdadero/falso." },
    { nombre: "Caja de números mágicos", descripcion: "Aplicar una regla que combina operaciones sobre el número y sus dígitos (práctica de suma de dígitos)." },
  ],
  avanzado: [
    { nombre: "Bloques de programación", descripcion: "Pensamiento secuencial: repetir bloques de instrucciones y calcular efecto total (introducción a bucles)." },
    { nombre: "Puertas de lógica avanzada", descripcion: "Componer operadores booleanos (AND, OR, NOT) y evaluar expresiones más complejas." },
    { nombre: "Rompecódigos", descripcion: "Resolver constraints sobre dígitos: suma total, inclusión de un dígito dado y no repetición." },
    { nombre: "Ruta condicional", descripcion: "Decidir entre varias ramas según condiciones (simula estructuras if/else anidadas)." },
    { nombre: "Sistemas simbólicos", descripcion: "Interpretar fórmulas lógicas con símbolos (¬, ∨, ∧) en lenguaje natural." },
    { nombre: "El hacker lógico", descripcion: "Intersecar varias afirmaciones para encontrar números que satisfacen todas las condiciones (razonamiento conjunctivo)." },
    { nombre: "Programando la torre", descripcion: "Aplicar un bloque de operaciones repetido: definimos el bloque como (duplicar → luego sumar 1) y se repite 2 veces." },
    { nombre: "Ecuaciones encadenadas", descripcion: "Resolver sistemas lineales simples de dos ecuaciones con dos incógnitas." },
    { nombre: "Construye el algoritmo", descripcion: "Diseñar la lógica (pseudocódigo mental) que convierte un número en “su doble más 1” y aplicarlo a un caso concreto." },
    { nombre: "Simulación matemática", descripcion: "Crecimiento exponencial: entender duplicación periódica y calcular resultados tras varias iteraciones." },
  ],
};

const niveles = {
  principiante: "Principiante",
  novato: "Novato",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
};

async function insertarEjercicios() {
  for (const [nivelKey, ejercicios] of Object.entries(ejerciciosPorNivel)) {
    for (const ejercicio of ejercicios) {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/ejercicios`, {
        method: "POST",
        headers: {
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "return=minimal",
        },
        body: JSON.stringify({
          titulo: ejercicio.nombre,
          descripcion: ejercicio.descripcion,
          nivel: niveles[nivelKey],
          tipo: "texto", 
          archivo: null,
        }),
      });

      if (!res.ok) {
        console.error(`Error insertando ${ejercicio.nombre}:`, await res.text());
      } else {
        console.log(`Insertado: ${ejercicio.nombre} (${niveles[nivelKey]})`);
      }
    }
  }
}

insertarEjercicios();
