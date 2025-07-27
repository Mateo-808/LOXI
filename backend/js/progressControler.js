const { supabase } = require('../db/supabase.js');

// Obtener progreso completo de un usuario (todos los ejercicios)
async function getUserProgress(userId) {
    const { data, error } = await supabase
        .from('progreso')
        .select(`
            *,
            ejercicios:ejercicio_id (
                id,
                nombre,
                descripcion,
                categoria
            )
        `)
        .eq('usuario_id', userId)
        .order('fecha', { ascending: false });

    if (error) throw error;
    return data;
}

// Obtener progreso de un usuario en un ejercicio específico
async function getUserExerciseProgress(userId, exerciseId) {
    const { data, error } = await supabase
        .from('progreso')
        .select(`
            *,
            ejercicios:ejercicio_id (
                nombre,
                descripcion
            )
        `)
        .eq('usuario_id', userId)
        .eq('ejercicio_id', exerciseId)
        .order('fecha', { ascending: false })
        .limit(1);

    if (error) throw error;
    return data[0] || null;
}

// Registrar nuevo intento de ejercicio
async function recordExerciseAttempt(userId, exerciseId, attemptData) {
    const { completado, puntuacion } = attemptData;
    
    // Obtener el progreso actual del ejercicio
    const currentProgress = await getUserExerciseProgress(userId, exerciseId);
    const nuevosIntentos = (currentProgress?.intentos || 0) + 1;
    
    // Solo actualizar la puntuación si es mejor que la anterior
    const mejorPuntuacion = currentProgress?.puntuacion 
        ? Math.max(currentProgress.puntuacion, puntuacion)
        : puntuacion;
    
    const { data, error } = await supabase
        .from('progreso')
        .upsert({
            usuario_id: userId,
            ejercicio_id: exerciseId,
            completado,
            puntuacion: mejorPuntuacion,
            intentos: nuevosIntentos,
            fecha: new Date()
        }, {
            onConflict: 'usuario_id,ejercicio_id'
        })
        .select();

    if (error) throw error;
    return data[0];
}

// Obtener estadísticas generales del usuario
async function getUserStats(userId) {
    const { data, error } = await supabase
        .from('progreso')
        .select('completado, puntuacion, intentos')
        .eq('usuario_id', userId);

    if (error) throw error;
    
    const stats = {
        ejerciciosCompletados: data.filter(p => p.completado).length,
        ejerciciosIntentados: data.length,
        puntuacionTotal: data.reduce((sum, p) => sum + (p.puntuacion || 0), 0),
        intentosTotal: data.reduce((sum, p) => sum + (p.intentos || 0), 0),
        promedioIntentos: data.length > 0 
            ? (data.reduce((sum, p) => sum + (p.intentos || 0), 0) / data.length).toFixed(2)
            : 0
    };
    
    return stats;
}

// Obtener ranking de usuarios por puntuación total
async function getUserRanking(limit = 10) {
    const { data, error } = await supabase
        .rpc('get_user_ranking', { limit_count: limit });

    if (error) throw error;
    return data;
}

// Obtener progreso por categoría de ejercicios
async function getUserProgressByCategory(userId) {
    const { data, error } = await supabase
        .from('progreso')
        .select(`
            completado,
            puntuacion,
            ejercicios:ejercicio_id (
                categoria
            )
        `)
        .eq('usuario_id', userId);

    if (error) throw error;
    
    // Agrupar por categoría
    const progressByCategory = {};
    data.forEach(item => {
        const categoria = item.ejercicios?.categoria || 'Sin categoría';
        if (!progressByCategory[categoria]) {
            progressByCategory[categoria] = {
                completados: 0,
                total: 0,
                puntuacionTotal: 0
            };
        }
        progressByCategory[categoria].total++;
        if (item.completado) {
            progressByCategory[categoria].completados++;
        }
        progressByCategory[categoria].puntuacionTotal += item.puntuacion || 0;
    });
    
    return progressByCategory;
}

// Marcar ejercicio como completado
async function markExerciseCompleted(userId, exerciseId, finalScore) {
    const { data, error } = await supabase
        .from('progreso')
        .upsert({
            usuario_id: userId,
            ejercicio_id: exerciseId,
            completado: true,
            puntuacion: finalScore,
            fecha: new Date()
        }, {
            onConflict: 'usuario_id,ejercicio_id'
        })
        .select();

    if (error) throw error;
    return data[0];
}

module.exports = {
    getUserProgress,
    getUserExerciseProgress,
    recordExerciseAttempt,
    getUserStats,
    getUserRanking,
    getUserProgressByCategory,
    markExerciseCompleted
};