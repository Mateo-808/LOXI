import { supabase } from '../db/supabase.js';
import bcrypt from 'bcryptjs';

// Función mejorada para guardar progreso (actualizar o insertar)
async function guardarProgreso(nivel, puntuacion, completado = true) {
    try {
        console.log('=== INICIANDO GUARDADO DE PROGRESO ===');
        
        // Obtener el ID del usuario desde localStorage
        const usuarioGuardado = localStorage.getItem('usuario');
        let usuarioId = null;
        
        if (usuarioGuardado) {
            try {
                const usuario = JSON.parse(usuarioGuardado);
                usuarioId = usuario.id;
                console.log('Usuario encontrado:', usuario.nombre, 'ID:', usuarioId);
            } catch (e) {
                console.error('Error al parsear usuario guardado:', e);
            }
        } else {
            usuarioId = localStorage.getItem('user_id') || localStorage.getItem('usuario_id');
        }
        
        const ejercicioId = '7c1a8ae1-a72e-4a4f-9efb-5a7be07a8b3a';
        
        if (!usuarioId) {
            console.warn('No se encontró ID de usuario válido.');
            return;
        }

        const serverUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:3000' 
            : 'https://loxi.onrender.com';
        
        const datosAEnviar = {
            usuario_id: usuarioId,
            ejercicio_id: ejercicioId,
            completado: completado,
            puntuacion: puntuacion,
            nivel: nivel,
            intentos: 1,
            upsert: true // ✅ Indicar que queremos actualizar si existe
        };
        
        console.log('Datos a enviar:', datosAEnviar);
        
        // ✅ Usar PUT en lugar de POST para indicar actualización
        const response = await fetch(`${serverUrl}/api/progreso`, {
            method: 'PUT', // Cambiar a PUT para upsert
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosAEnviar)
        });

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

        console.log('Progreso guardado/actualizado exitosamente:', data);
        
        // ✅ Actualizar también el localStorage con los nuevos datos
        const usuarioActual = JSON.parse(localStorage.getItem('usuario'));
        if (usuarioActual) {
            usuarioActual.nivel = nivel;
            usuarioActual.puntos = puntuacion;
            localStorage.setItem('usuario', JSON.stringify(usuarioActual));
        }
        
        return data;
        
    } catch (error) {
        console.error('=== ERROR AL GUARDAR PROGRESO ===');
        console.error('Error completo:', error);
        
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
