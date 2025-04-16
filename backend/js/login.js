import { supabase } from "../db/supabase.js";

export async function loginUsers(correo, contrasena) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: correo,
            password: contrasena,
        });

        if (error) {
            console.error('Error al iniciar sesión:', error.message);
            return { success: false, error: error.message };
        }

        console.log('Sesión iniciada correctamente:', data);
        return { success: true, data: data }; // Corregido: true en lugar de false
    } catch(error) {
        console.error('Error inesperado:', error.message);
        return { success: false, error: error.message };
    }
}

export async function singWithProvider(provider) {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: window.location.origin
            }
        });

        if (error) {
            console.error('Error al iniciar sesión con su cuenta:', error.message);
            return { success: false, error: error.message };
        }

        console.log('Sesión iniciada correctamente:', data);
        return { success: true, data: data }; 
    } catch(error) {
        console.error('Sucedió un error al iniciar sesión con sus proveedores:', error.message);
        return { success: false, error: error.message };
    }
}

export async function logOut() {
    try {
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('Error al cerrar la sesión:', error.message);
            return { success: false, error: error.message };
        }

        console.log('Sesión cerrada correctamente');
        return { success: true };
    } catch (error) {
        console.error('Error inesperado:', error.message);
        return { success: false, error: error.message };
    }
}