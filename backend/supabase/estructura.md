# 📄 Descripción de Tablas – Base de Datos del Proyecto **Loxi**

---

## 🧍‍♂️ Tabla: `usuarios`

**Descripción:**  
Contiene la información de los estudiantes registrados en la plataforma.

**Campos:**
- `id` (UUID, PRIMARY KEY): Identificador único del usuario.
- `nombre` (TEXT): Nombre del estudiante.
- `correo` (TEXT): Correo electrónico del usuario.
- `fecha_registro` (TIMESTAMP): Fecha de registro en la plataforma.
- `contrasena` (TEXT): Contraseña del estudiante.

**Relaciones:**  
Relacionada con:
- `progreso` (1:N)
- `comentarios` (1:N)

---

## 🧠 Tabla: `ejercicios`

**Descripción:**  
Almacena todos los ejercicios de lógica disponibles para los estudiantes.

**Campos:**
- `id` (UUID, PRIMARY KEY): Identificador del ejercicio.
- `titulo` (TEXT): Título del ejercicio.
- `descripcion` (TEXT): Descripción del ejercicio.
- `nivel` (TEXT): Dificultad (Ej: básico, intermedio, avanzado).
- `tipo` (TEXT): Tipo de ejercicio (Ej: opción múltiple, verdadero/falso).

**Relaciones:**  
Relacionada con:
- `progreso` (1:N)

---

## 📈 Tabla: `progreso`

**Descripción:**  
Registra el avance del estudiante en cada ejercicio realizado.

**Campos:**
- `id` (UUID, PRIMARY KEY): Identificador del registro de progreso.
- `usuario_id` (UUID, FOREIGN KEY → usuarios.id): Usuario que hizo el ejercicio.
- `ejercicio_id` (UUID, FOREIGN KEY → ejercicios.id): Ejercicio realizado.
- `puntuacion` (INTEGER): Puntaje obtenido.
- `intentos` (INTEGER): Número de intentos.
- `completado` (BOOLEAN): Indica si se completó el ejercicio.
- `fecha` (TIMESTAMP): Fecha del registro.

**Relaciones:**  
Relacionada con:
- `usuarios` (N:1)
- `ejercicios` (N:1)

---

## 💬 Tabla: `comentarios`

**Descripción:**  
Comentarios realizados por los estudiantes (preguntas, sugerencias, etc.).

**Campos:**
- `id` (UUID, PRIMARY KEY): Identificador del comentario.
- `usuario_id` (UUID, FOREIGN KEY → usuarios.id): Usuario que comentó.
- `mensaje` (TEXT): Contenido del comentario.
- `fecha` (TIMESTAMP): Fecha del comentario.

**Relaciones:**  
Relacionada con:
- `usuarios` (N:1)

---