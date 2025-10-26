import { supabase } from './supabaseClient.js';

let currentUser = null;

async function checkAdminAccess() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        window.location.href = './login.html';
        return false;
    }

    const { data: usuario, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id_auth', user.id)
        .maybeSingle();

    if (error || !usuario || !usuario.es_admin) {
        alert('No tienes permisos de administrador');
        window.location.href = './interface.html';
        return false;
    }

    currentUser = usuario;
    document.getElementById('adminName').textContent = usuario.nombre;
    return true;
}

function switchSection(sectionName) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    document.getElementById(sectionName).classList.add('active');
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

    const titles = {
        dashboard: 'Dashboard',
        usuarios: 'Gestión de Usuarios',
        ejercicios: 'Gestión de Ejercicios',
        juegos: 'Gestión de Juegos',
        progreso: 'Progreso de Estudiantes',
        comentarios: 'Gestión de Comentarios'
    };
    document.getElementById('sectionTitle').textContent = titles[sectionName];

    if (sectionName === 'dashboard') loadDashboardStats();
    else if (sectionName === 'usuarios') loadUsers();
    else if (sectionName === 'ejercicios') loadExercises();
    else if (sectionName === 'juegos') loadGames();
    else if (sectionName === 'progreso') loadProgress();
    else if (sectionName === 'comentarios') loadComments();
}

async function loadDashboardStats() {
    const { count: usersCount } = await supabase
        .from('usuarios')
        .select('*', { count: 'exact', head: true });

    const { count: exercisesCount } = await supabase
        .from('ejercicios')
        .select('*', { count: 'exact', head: true });

    const { count: gamesCount } = await supabase
        .from('juegos')
        .select('*', { count: 'exact', head: true });

    const { count: commentsCount } = await supabase
        .from('comentarios')
        .select('*', { count: 'exact', head: true });

    document.getElementById('totalUsers').textContent = usersCount || 0;
    document.getElementById('totalExercises').textContent = exercisesCount || 0;
    document.getElementById('totalGames').textContent = gamesCount || 0;
    document.getElementById('totalComments').textContent = commentsCount || 0;
}

async function loadUsers() {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '<tr><td colspan="5" class="loading">Cargando...</td></tr>';

    const { data: users, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('fecha_registro', { ascending: false });

    if (error) {
        tbody.innerHTML = '<tr><td colspan="5" class="loading">Error al cargar usuarios</td></tr>';
        return;
    }

    if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="loading">No hay usuarios</td></tr>';
        return;
    }

    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.nombre}</td>
            <td>${user.correo}</td>
            <td>${new Date(user.fecha_registro).toLocaleDateString()}</td>
            <td>
                <span class="badge ${user.es_admin ? 'badge-success' : 'badge-info'}">
                    ${user.es_admin ? 'Sí' : 'No'}
                </span>
            </td>
            <td>
                <button class="action-btn btn-toggle" onclick="toggleAdmin('${user.id}', ${!user.es_admin})">
                    ${user.es_admin ? 'Quitar Admin' : 'Hacer Admin'}
                </button>
                ${user.id !== currentUser.id ? `
                    <button class="action-btn btn-delete" onclick="deleteUser('${user.id}')">
                        Eliminar
                    </button>
                ` : ''}
            </td>
        </tr>
    `).join('');
}

window.toggleAdmin = async function(userId, makeAdmin) {
    if (!confirm(`¿Estás seguro de ${makeAdmin ? 'dar' : 'quitar'} permisos de administrador?`)) {
        return;
    }

    const { error } = await supabase
        .from('usuarios')
        .update({ es_admin: makeAdmin })
        .eq('id', userId);

    if (error) {
        alert('Error al actualizar usuario');
        return;
    }

    loadUsers();
};

window.deleteUser = async function(userId) {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) {
        return;
    }

    const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', userId);

    if (error) {
        alert('Error al eliminar usuario');
        return;
    }

    loadUsers();
};

async function loadExercises() {
    const tbody = document.getElementById('exercisesTableBody');
    tbody.innerHTML = '<tr><td colspan="4" class="loading">Cargando...</td></tr>';

    const { data: exercises, error } = await supabase
        .from('ejercicios')
        .select('*')
        .order('titulo');

    if (error) {
        tbody.innerHTML = '<tr><td colspan="4" class="loading">Error al cargar ejercicios</td></tr>';
        return;
    }

    if (!exercises || exercises.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="loading">No hay ejercicios</td></tr>';
        return;
    }

    tbody.innerHTML = exercises.map(exercise => `
        <tr>
            <td>${exercise.titulo}</td>
            <td><span class="badge badge-info">${exercise.nivel}</span></td>
            <td><span class="badge badge-warning">${exercise.tipo}</span></td>
            <td>
                <button class="action-btn btn-edit" onclick="editExercise('${exercise.id}')">
                    Editar
                </button>
                <button class="action-btn btn-delete" onclick="deleteExercise('${exercise.id}')">
                    Eliminar
                </button>
            </td>
        </tr>
    `).join('');
}

window.editExercise = async function(exerciseId) {
    const { data: exercise } = await supabase
        .from('ejercicios')
        .select('*')
        .eq('id', exerciseId)
        .single();

    if (!exercise) return;

    showModal('Editar Ejercicio', `
        <div class="form-group">
            <label>Título</label>
            <input type="text" id="exerciseTitle" value="${exercise.titulo}" required>
        </div>
        <div class="form-group">
            <label>Descripción</label>
            <textarea id="exerciseDescription">${exercise.descripcion || ''}</textarea>
        </div>
        <div class="form-group">
            <label>Nivel</label>
            <select id="exerciseLevel">
                <option value="Principiante" ${exercise.nivel === 'Principiante' ? 'selected' : ''}>Principiante</option>
                <option value="Novato" ${exercise.nivel === 'Novato' ? 'selected' : ''}>Novato</option>
                <option value="Intermedio" ${exercise.nivel === 'Intermedio' ? 'selected' : ''}>Intermedio</option>
                <option value="Avanzado" ${exercise.nivel === 'Avanzado' ? 'selected' : ''}>Avanzado</option>
            </select>
        </div>
        <div class="form-group">
            <label>Tipo</label>
            <select id="exerciseType">
                <option value="texto" ${exercise.tipo === 'texto' ? 'selected' : ''}>Texto</option>
                <option value="opcion_multiple" ${exercise.tipo === 'opcion_multiple' ? 'selected' : ''}>Opción Múltiple</option>
                <option value="juego" ${exercise.tipo === 'juego' ? 'selected' : ''}>Juego</option>
            </select>
        </div>
        <div class="form-group">
            <label>Archivo</label>
            <input type="text" id="exerciseFile" value="${exercise.archivo || ''}">
        </div>
        <div class="form-actions">
            <button class="btn-primary" onclick="saveExercise('${exercise.id}')">Guardar</button>
            <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
        </div>
    `);
};

window.saveExercise = async function(exerciseId) {
    const data = {
        titulo: document.getElementById('exerciseTitle').value,
        descripcion: document.getElementById('exerciseDescription').value,
        nivel: document.getElementById('exerciseLevel').value,
        tipo: document.getElementById('exerciseType').value,
        archivo: document.getElementById('exerciseFile').value
    };

    const { error } = await supabase
        .from('ejercicios')
        .update(data)
        .eq('id', exerciseId);

    if (error) {
        alert('Error al guardar ejercicio');
        return;
    }

    closeModal();
    loadExercises();
};

window.deleteExercise = async function(exerciseId) {
    if (!confirm('¿Estás seguro de eliminar este ejercicio?')) {
        return;
    }

    const { error } = await supabase
        .from('ejercicios')
        .delete()
        .eq('id', exerciseId);

    if (error) {
        alert('Error al eliminar ejercicio');
        return;
    }

    loadExercises();
};

document.getElementById('addExerciseBtn')?.addEventListener('click', () => {
    showModal('Nuevo Ejercicio', `
        <div class="form-group">
            <label>Título</label>
            <input type="text" id="exerciseTitle" required>
        </div>
        <div class="form-group">
            <label>Descripción</label>
            <textarea id="exerciseDescription"></textarea>
        </div>
        <div class="form-group">
            <label>Nivel</label>
            <select id="exerciseLevel">
                <option value="Principiante">Principiante</option>
                <option value="Novato">Novato</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzado">Avanzado</option>
            </select>
        </div>
        <div class="form-group">
            <label>Tipo</label>
            <select id="exerciseType">
                <option value="texto">Texto</option>
                <option value="opcion_multiple">Opción Múltiple</option>
                <option value="juego">Juego</option>
            </select>
        </div>
        <div class="form-group">
            <label>Archivo</label>
            <input type="text" id="exerciseFile">
        </div>
        <div class="form-actions">
            <button class="btn-primary" onclick="createExercise()">Crear</button>
            <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
        </div>
    `);
});

window.createExercise = async function() {
    const data = {
        titulo: document.getElementById('exerciseTitle').value,
        descripcion: document.getElementById('exerciseDescription').value,
        nivel: document.getElementById('exerciseLevel').value,
        tipo: document.getElementById('exerciseType').value,
        archivo: document.getElementById('exerciseFile').value
    };

    const { error } = await supabase
        .from('ejercicios')
        .insert([data]);

    if (error) {
        alert('Error al crear ejercicio');
        return;
    }

    closeModal();
    loadExercises();
};

async function loadGames() {
    const tbody = document.getElementById('gamesTableBody');
    tbody.innerHTML = '<tr><td colspan="3" class="loading">Cargando...</td></tr>';

    const { data: games, error } = await supabase
        .from('juegos')
        .select('*')
        .order('nombre');

    if (error) {
        tbody.innerHTML = '<tr><td colspan="3" class="loading">Error al cargar juegos</td></tr>';
        return;
    }

    if (!games || games.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="loading">No hay juegos</td></tr>';
        return;
    }

    tbody.innerHTML = games.map(game => `
        <tr>
            <td>${game.nombre}</td>
            <td><span class="badge badge-info">${game.nivel}</span></td>
            <td>
                <button class="action-btn btn-edit" onclick="editGame('${game.id}')">
                    Editar
                </button>
                <button class="action-btn btn-delete" onclick="deleteGame('${game.id}')">
                    Eliminar
                </button>
            </td>
        </tr>
    `).join('');
}

window.editGame = async function(gameId) {
    const { data: game } = await supabase
        .from('juegos')
        .select('*')
        .eq('id', gameId)
        .single();

    if (!game) return;

    showModal('Editar Juego', `
        <div class="form-group">
            <label>Nombre</label>
            <input type="text" id="gameName" value="${game.nombre}" required>
        </div>
        <div class="form-group">
            <label>Descripción</label>
            <textarea id="gameDescription">${game.descripcion || ''}</textarea>
        </div>
        <div class="form-group">
            <label>Nivel</label>
            <select id="gameLevel">
                <option value="fácil" ${game.nivel === 'fácil' ? 'selected' : ''}>Fácil</option>
                <option value="medio" ${game.nivel === 'medio' ? 'selected' : ''}>Medio</option>
                <option value="difícil" ${game.nivel === 'difícil' ? 'selected' : ''}>Difícil</option>
            </select>
        </div>
        <div class="form-group">
            <label>Archivo</label>
            <input type="text" id="gameFile" value="${game.archivo || ''}">
        </div>
        <div class="form-actions">
            <button class="btn-primary" onclick="saveGame('${game.id}')">Guardar</button>
            <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
        </div>
    `);
};

window.saveGame = async function(gameId) {
    const data = {
        nombre: document.getElementById('gameName').value,
        descripcion: document.getElementById('gameDescription').value,
        nivel: document.getElementById('gameLevel').value,
        archivo: document.getElementById('gameFile').value
    };

    const { error } = await supabase
        .from('juegos')
        .update(data)
        .eq('id', gameId);

    if (error) {
        alert('Error al guardar juego');
        return;
    }

    closeModal();
    loadGames();
};

window.deleteGame = async function(gameId) {
    if (!confirm('¿Estás seguro de eliminar este juego?')) {
        return;
    }

    const { error } = await supabase
        .from('juegos')
        .delete()
        .eq('id', gameId);

    if (error) {
        alert('Error al eliminar juego');
        return;
    }

    loadGames();
};

document.getElementById('addGameBtn')?.addEventListener('click', () => {
    showModal('Nuevo Juego', `
        <div class="form-group">
            <label>Nombre</label>
            <input type="text" id="gameName" required>
        </div>
        <div class="form-group">
            <label>Descripción</label>
            <textarea id="gameDescription"></textarea>
        </div>
        <div class="form-group">
            <label>Nivel</label>
            <select id="gameLevel">
                <option value="fácil">Fácil</option>
                <option value="medio">Medio</option>
                <option value="difícil">Difícil</option>
            </select>
        </div>
        <div class="form-group">
            <label>Archivo</label>
            <input type="text" id="gameFile">
        </div>
        <div class="form-actions">
            <button class="btn-primary" onclick="createGame()">Crear</button>
            <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
        </div>
    `);
});

window.createGame = async function() {
    const data = {
        nombre: document.getElementById('gameName').value,
        descripcion: document.getElementById('gameDescription').value,
        nivel: document.getElementById('gameLevel').value,
        archivo: document.getElementById('gameFile').value
    };

    const { error } = await supabase
        .from('juegos')
        .insert([data]);

    if (error) {
        alert('Error al crear juego');
        return;
    }

    closeModal();
    loadGames();
};

async function loadProgress() {
    const tbody = document.getElementById('progressTableBody');
    tbody.innerHTML = '<tr><td colspan="6" class="loading">Cargando...</td></tr>';

    const { data: progress, error } = await supabase
        .from('progreso')
        .select(`
            *,
            usuarios!progreso_usuario_id_fkey(nombre),
            ejercicios(titulo)
        `)
        .order('fecha', { ascending: false });

    if (error) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading">Error al cargar progreso</td></tr>';
        return;
    }

    if (!progress || progress.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading">No hay registros de progreso</td></tr>';
        return;
    }

    tbody.innerHTML = progress.map(p => `
        <tr>
            <td>${p.usuarios?.nombre || 'N/A'}</td>
            <td>${p.ejercicios?.titulo || 'N/A'}</td>
            <td>${p.puntuacion || 0}</td>
            <td>${p.intentos || 0}</td>
            <td>
                <span class="badge ${p.completado ? 'badge-success' : 'badge-warning'}">
                    ${p.completado ? 'Completado' : 'En progreso'}
                </span>
            </td>
            <td>${new Date(p.fecha).toLocaleDateString()}</td>
        </tr>
    `).join('');
}

async function loadComments() {
    const tbody = document.getElementById('commentsTableBody');
    tbody.innerHTML = '<tr><td colspan="4" class="loading">Cargando...</td></tr>';

    const { data: comments, error } = await supabase
        .from('comentarios')
        .select(`
            *,
            usuarios!comentarios_usuario_id_fkey(nombre)
        `)
        .order('fecha', { ascending: false });

    if (error) {
        tbody.innerHTML = '<tr><td colspan="4" class="loading">Error al cargar comentarios</td></tr>';
        return;
    }

    if (!comments || comments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="loading">No hay comentarios</td></tr>';
        return;
    }

    tbody.innerHTML = comments.map(comment => `
        <tr>
            <td>${comment.usuarios?.nombre || 'N/A'}</td>
            <td>${comment.mensaje}</td>
            <td>${new Date(comment.fecha).toLocaleDateString()}</td>
            <td>
                <button class="action-btn btn-delete" onclick="deleteComment('${comment.id}')">
                    Eliminar
                </button>
            </td>
        </tr>
    `).join('');
}

window.deleteComment = async function(commentId) {
    if (!confirm('¿Estás seguro de eliminar este comentario?')) {
        return;
    }

    const { error } = await supabase
        .from('comentarios')
        .delete()
        .eq('id', commentId);

    if (error) {
        alert('Error al eliminar comentario');
        return;
    }

    loadComments();
};

function showModal(title, content) {
    const modal = document.getElementById('modal');
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalForm').innerHTML = content;
    modal.classList.add('show');
}

window.closeModal = function() {
    const modal = document.getElementById('modal');
    modal.classList.remove('show');
};

document.querySelector('.close').addEventListener('click', closeModal);

window.addEventListener('click', (e) => {
    const modal = document.getElementById('modal');
    if (e.target === modal) {
        closeModal();
    }
});

document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        const section = item.getAttribute('data-section');
        switchSection(section);
    });
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = './login.html';
});

checkAdminAccess().then(hasAccess => {
    if (hasAccess) {
        loadDashboardStats();
    }
});
