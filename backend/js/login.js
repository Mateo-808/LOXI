import { supabase } from '../db/supabase.js';
import bcrypt from 'bcryptjs';

// Función mejorada para guardar progreso (actualizar o insertar)
// Función para guardar progreso en Supabase Y actualizar localStorage
async function guardarProgreso(nivel, puntuacion, completado = true) {
    try {
        console.log('=== INICIANDO GUARDADO DE PROGRESO ===');
        
        // Obtener el ID del usuario desde localStorage
        const usuarioGuardado = localStorage.getItem('usuario');
        let usuarioId = null;
        
        console.log('usuarioGuardado:', usuarioGuardado);
        
        // Extraer el ID del objeto usuario guardado
        if (usuarioGuardado) {
            try {
                const usuario = JSON.parse(usuarioGuardado);
                usuarioId = usuario.id;
                console.log('Usuario encontrado:', usuario.nombre, 'ID:', usuarioId);
            } catch (e) {
                console.error('Error al parsear usuario guardado:', e);
            }
        } else {
            // Fallback: buscar IDs directos en localStorage
            usuarioId = localStorage.getItem('user_id') || localStorage.getItem('usuario_id');
            console.log('ID encontrado en fallback:', usuarioId);
        }
        
        const ejercicioId = '7c1a8ae1-a72e-4a4f-9efb-5a7be07a8b3a'; // UUID del ejercicio de lógica
        
        if (!usuarioId) {
            console.warn('No se encontró ID de usuario válido. El progreso no se guardará.');
            console.log('Estado del localStorage usuario:', usuarioGuardado);
            return;
        }

        // URL de tu servidor 
        const serverUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:3000' 
            : 'https://loxi.onrender.com'; 
        
        console.log('URL del servidor:', serverUrl);
        
        const datosAEnviar = {
            usuario_id: usuarioId,
            ejercicio_id: ejercicioId,
            completado: completado,
            puntuacion: puntuacion,
            nivel: nivel,
            intentos: 1
        };
        
        console.log('Datos a enviar:', datosAEnviar);
        
        const response = await fetch(`${serverUrl}/api/progreso`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosAEnviar)
        });

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        const responseText = await response.text();
        console.log('Response text:', responseText);
        
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error('Error al parsear respuesta JSON:', e);
            throw new Error(`Respuesta no válida del servidor: ${responseText}`);
        }
        
        if (!response.ok) {
            throw new Error(data.error || `Error HTTP: ${response.status}`);
        }

        console.log('Progreso guardado exitosamente:', data);
        
        // ✅ ACTUALIZAR LOCALSTORAGE CON LOS NUEVOS DATOS
        if (usuarioGuardado) {
            try {
                const usuarioActual = JSON.parse(usuarioGuardado);
                
                // Actualizar nivel y puntos
                usuarioActual.nivel = nivel;
                usuarioActual.puntos = puntuacion;
                
                // Guardar de nuevo en localStorage
                localStorage.setItem('usuario', JSON.stringify(usuarioActual));
                
                console.log('✅ localStorage actualizado:', usuarioActual);
                
                // También actualizar la variable individual si existe
                localStorage.setItem('nivel', nivel.toLowerCase());
                
            } catch (e) {
                console.error('Error al actualizar localStorage:', e);
            }
        }
        
        return data;
        
    } catch (error) {
        console.error('=== ERROR AL GUARDAR PROGRESO ===');
        console.error('Error completo:', error);
        console.error('Stack trace:', error.stack);
        
        // Eliminar este mensaje cuando se acaben las pruebas para que el usuario no lo vea
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
