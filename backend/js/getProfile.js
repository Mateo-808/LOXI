import { supabase } from "../db/supabase.js";

export async function createUserProfile(userId, nombre, correo) {
    try {
        const { data, error } = await supabase
            .from('usuarios')
            .insert([
                { 
                    id: userId,
                    nombre: nombre,
                    correo: correo,
                    // La contraseña no se incluye aquí porque ya está gestionada por Supabase Auth
                    // fecha_registro se establece automáticamente
                }
            ]);

        if (error) {
            console.error('Error al crear perfil de usuario:', error.message);
            return { success: false, error: error.message };
        }

        return { success: true, data: data };
    } catch (error) {
        console.error('Error inesperado:', error.message);
        return { success: false, error: error.message };
    }
}

export async function getUserProfile(userId) {
    try {
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error al obtener perfil de usuario:', error.message);
            return { success: false, error: error.message };
        }

        return { success: true, data: data };
    } catch (error) {
        console.error('Error inesperado:', error.message);
        return { success: false, error: error.message };
    }
}

export async function updateUserProfile(userId, updateData) {
    try {
        const { data, error } = await supabase
            .from('usuarios')
            .update(updateData)
            .eq('id', userId);

        if (error) {
            console.error('Error al actualizar perfil de usuario:', error.message);
            return { success: false, error: error.message };
        }

        return { success: true, data: data };
    } catch (error) {
        console.error('Error inesperado:', error.message);
        return { success: false, error: error.message };
    }
}