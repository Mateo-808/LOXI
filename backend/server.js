import { supabase } from '../db/supabase.js';

// Obtener progreso completo de un usuario (todos los ejercicios)
export async function getUserProgress(userId) {
    const { data, error } = await supabase
        .from('progreso')
        .select(`
            *,
            ejercicios:ejercicio_id (
                id,
                titulo,
                descripcion,
                nivel,
                tipo
            )
        `)
        .eq('usuario_id', userId)
        .order('fecha', { ascending: false });

    if (error) throw error;
    return data;
}

// Obtener progreso de un usuario en un ejercicio específico
export async function getUserExerciseProgress(userId, exerciseId) {
    const { data, error } = await supabase
        .from('progreso')
        .select(`
            *,
            ejercicios:ejercicio_id (
                titulo,
                descripcion,
                nivel,
                tipo
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
export async function recordExerciseAttempt(userId, exerciseId, attemptData) {
    const { completado, puntuacion } = attemptData;
    
    // Obtener el progreso actual del ejercicio
    const currentProgress = await getUserExerciseProgress(userId, exerciseId);
    const nuevosIntentos = (currentProgress?.intentos || 0) + 1;
    
    // Solo actualizar la puntuación si es mejor que la anterior
    const mejorPuntuacion = currentProgress?.puntuacion 
        ? Math.max(currentProgress.puntuacion, puntuacion || 0)
        : (puntuacion || 0);
    
    const { data, error } = await supabase
        .from('progreso')
        .upsert({
            usuario_id: userId,
            ejercicio_id: exerciseId,
            completado: completado || false,
            puntuacion: mejorPuntuacion,
            intentos: nuevosIntentos,
            fecha: new Date().toISOString()
        }, {
            onConflict: 'usuario_id,ejercicio_id'
        })
        .select();

    if (error) throw error;
    return data[0];
}

// Obtener estadísticas generales del usuario
export async function getUserStats(userId) {
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
            ? parseFloat((data.reduce((sum, p) => sum + (p.intentos || 0), 0) / data.length).toFixed(2))
            : 0,
        porcentajeCompletado: data.length > 0 
            ? parseFloat(((data.filter(p => p.completado).length / data.length) * 100).toFixed(2))
            : 0
    };
    
    return stats;
}

// Obtener ranking de usuarios por puntuación total
export async function getUserRanking(limit = 10) {
    // Como no tenemos la función SQL creada, haremos el cálculo con JavaScript
    const { data, error } = await supabase
        .from('progreso')
        .select(`
            usuario_id,
            puntuacion,
            completado,
            usuarios:usuario_id (
                nombre
            )
        `);

    if (error) throw error;
    
    // Agrupar por usuario y calcular estadísticas
    const userStats = {};
    data.forEach(item => {
        const userId = item.usuario_id;
        if (!userStats[userId]) {
            userStats[userId] = {
                usuario_id: userId,
                nombre: item.usuarios?.nombre || 'Usuario',
                puntuacion_total: 0,
                ejercicios_completados: 0,
                ejercicios_intentados: 0
            };
        }
        
        userStats[userId].puntuacion_total += item.puntuacion || 0;
        userStats[userId].ejercicios_intentados += 1;
        if (item.completado) {
            userStats[userId].ejercicios_completados += 1;
        }
    });
    
    // Convertir a array y ordenar
    const ranking = Object.values(userStats)
        .sort((a, b) => {
            if (b.puntuacion_total !== a.puntuacion_total) {
                return b.puntuacion_total - a.puntuacion_total;
            }
            return b.ejercicios_completados - a.ejercicios_completados;
        })
        .slice(0, limit);
    
    return ranking;
}

// Obtener progreso por nivel de ejercicios
export async function getUserProgressByLevel(userId) {
    const { data, error } = await supabase
        .from('progreso')
        .select(`
            completado,
            puntuacion,
            ejercicios:ejercicio_id (
                nivel
            )
        `)
        .eq('usuario_id', userId);

    if (error) throw error;
    
    // Agrupar por nivel
    const progressByLevel = {};
    data.forEach(item => {
        const nivel = item.ejercicios?.nivel || 'Sin nivel';
        if (!progressByLevel[nivel]) {
            progressByLevel[nivel] = {
                completados: 0,
                total: 0,
                puntuacionTotal: 0,
                porcentaje: 0
            };
        }
        progressByLevel[nivel].total++;
        if (item.completado) {
            progressByLevel[nivel].completados++;
        }
        progressByLevel[nivel].puntuacionTotal += item.puntuacion || 0;
    });
    
    // Calcular porcentajes
    Object.keys(progressByLevel).forEach(nivel => {
        const nivel_data = progressByLevel[nivel];
        nivel_data.porcentaje = nivel_data.total > 0 
            ? parseFloat(((nivel_data.completados / nivel_data.total) * 100).toFixed(2))
            : 0;
    });
    
    return progressByLevel;
}

// Obtener progreso por categoría de ejercicios (usando el tipo como categoría)
export async function getUserProgressByCategory(userId) {
    const { data, error } = await supabase
        .from('progreso')
        .select(`
            completado,
            puntuacion,
            ejercicios:ejercicio_id (
                tipo
            )
        `)
        .eq('usuario_id', userId);

    if (error) throw error;
    
    // Agrupar por categoría (tipo)
    const progressByCategory = {};
    data.forEach(item => {
        const categoria = item.ejercicios?.tipo || 'Sin categoría';
        if (!progressByCategory[categoria]) {
            progressByCategory[categoria] = {
                completados: 0,
                total: 0,
                puntuacionTotal: 0,
                porcentaje: 0
            };
        }
        progressByCategory[categoria].total++;
        if (item.completado) {
            progressByCategory[categoria].completados++;
        }
        progressByCategory[categoria].puntuacionTotal += item.puntuacion || 0;
    });
    
    // Calcular porcentajes
    Object.keys(progressByCategory).forEach(categoria => {
        const cat_data = progressByCategory[categoria];
        cat_data.porcentaje = cat_data.total > 0 
            ? parseFloat(((cat_data.completados / cat_data.total) * 100).toFixed(2))
            : 0;
    });
    
    return progressByCategory;
}

// Marcar ejercicio como completado
export async function markExerciseCompleted(userId, exerciseId, finalScore) {
    const currentProgress = await getUserExerciseProgress(userId, exerciseId);
    
    const { data, error } = await supabase
        .from('progreso')
        .upsert({
            usuario_id: userId,
            ejercicio_id: exerciseId,
            completado: true,
            puntuacion: finalScore || 0,
            intentos: currentProgress?.intentos || 1,
            fecha: new Date().toISOString()
        }, {
            onConflict: 'usuario_id,ejercicio_id'
        })
        .select();

    if (error) throw error;
    return data[0];
}

// Obtener últimos ejercicios realizados por el usuario
export async function getRecentUserProgress(userId, limit = 5) {
    const { data, error } = await supabase
        .from('progreso')
        .select(`
            *,
            ejercicios:ejercicio_id (
                titulo,
                nivel,
                tipo
            )
        `)
        .eq('usuario_id', userId)
        .order('fecha', { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data;
}