// Importación del cliente de Supabase para la conexión con la base de datos
import { supabase } from "./db/supabase";   

/**
 * Función asíncrona para registrar nuevos usuarios en el sistema
 * @param {string} nombre - Nombre del usuario
 * @param {string} correo - Correo electrónico del usuario
 * @param {string} contrasena - Contraseña del usuario
 * @param {Object} datesAditional - Datos adicionales opcionales del usuario
 * @returns {Object}
 */

//INICIO DE LA FUNCIÓN
async function registerUser(nombre, correo, contrasena, datesAditional= {}) {
    try{
        const { data: authData, error: authError} = await supabase.auth.signUp({
            name: nombre,
            email: correo,
            password: contrasena,
        });

        if (authError) throw authError; 

        if(authData && authData.user){
            const userId = authData.user.id;

            // Inserta los datos del usuario en la tabla 'usuarios'
            const {data: userDate, error: userError} = await supabase
            .from('usuarios')
            .insert([
                {
                    id: userId,
                    email,
                    ...datesAditional,
                    created_at: new Date()
                }
            ])

            if (userError) throw userError

            return {success: true, user: authData.user, userDate };
        }
    } catch (error) {
        console.log('Error al registrar el usuario')
        return {success: false, error: error.mesage}
    }
}

// FIN DE LA FUNCIÓN