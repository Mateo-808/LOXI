// INICIO DE LA FUNCIÓN
import { supabase } from "./db/supabase";

async function updateUsers(correo, nombre, fecha_registro) {
    try{
        const {data, error} = await supabase
        .from('users')
        .update({
            email: correo,
            name: nombre,
            date_register: fecha_registro,
        });

        if (error) throw error;
        return {success: true, users: data};
    } catch (error) {
        console.error("Error al cargar al usuario:", error);
        return {success: false, error: error.message};
    }
}
// FIN DE LA FUNCIÓN