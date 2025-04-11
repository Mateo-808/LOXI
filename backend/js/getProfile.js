import { supabase } from "./db/supabase"

async function getProfile() {
    try {
        const {data: {session}, error: sessionError } = await supabase.auth.getSession

        if (session || !session){
            console.error('Error al obtener el perfil del usuario:', sessionError?.message)
            return {success: false, error: 'no hay sesión activa'}
        }

        const userId = session.user.id

        const {data: perfil, error: perfilError} = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .single()

        if (perfilError){
            console.error('Error al obtener el perfil:', perfilError.message)
            return { success: false, error: perfilError.message}
        }

        const datesComplets = {
            ...session.user,
            perfil: perfil
        }

        console.log('Perfil del usuario:', datesComplets)
        return { success: true, data: datesComplets}
    } catch (error){
        console.log('Error al obtener el perfil:', error)
        return { success: false, error: 'Error al obtener el perfil'}
    }
}