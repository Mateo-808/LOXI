import { supabase } from './supabaseClient.js';

/* ============================================================
   🧩 SISTEMA DE ALERTAS PERSONALIZADAS
============================================================ */
function showCustomAlert(options) {
    const {
        title = '¡Atención!',
        message = '',
        type = 'error',
        icon = 'fa-exclamation-triangle',
        confirmText = 'Entendido',
        cancelText = null,
        onConfirm = null,
        onCancel = null
    } = options;

    const overlay = document.createElement('div');
    overlay.className = 'custom-alert-overlay';

    const alertBox = document.createElement('div');
    alertBox.className = `custom-alert alert-${type}`;

    const iconDiv = document.createElement('div');
    iconDiv.className = 'alert-icon';
    iconDiv.innerHTML = `<i class="fas ${icon}"></i>`;

    const content = document.createElement('div');
    content.className = 'alert-content';

    const titleElement = document.createElement('h3');
    titleElement.className = 'alert-title';
    titleElement.textContent = title;

    const messageElement = document.createElement('p');
    messageElement.className = 'alert-message';
    messageElement.textContent = message;

    const actions = document.createElement('div');
    actions.className = 'alert-actions';

    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'alert-btn alert-btn-primary';
    confirmBtn.textContent = confirmText;
    confirmBtn.onclick = () => {
        removeAlert();
        if (onConfirm) onConfirm();
    };
    actions.appendChild(confirmBtn);

    if (cancelText) {
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'alert-btn alert-btn-secondary';
        cancelBtn.textContent = cancelText;
        cancelBtn.onclick = () => {
            removeAlert();
            if (onCancel) onCancel();
        };
        actions.appendChild(cancelBtn);
    }

    content.appendChild(titleElement);
    content.appendChild(messageElement);
    content.appendChild(actions);
    alertBox.appendChild(iconDiv);
    alertBox.appendChild(content);
    overlay.appendChild(alertBox);
    document.body.appendChild(overlay);

    function removeAlert() {
        overlay.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => overlay.remove(), 300);
    }

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            removeAlert();
            if (onCancel) onCancel();
        }
    });

    return { close: removeAlert };
}

if (!document.getElementById('custom-alert-animations')) {
    const style = document.createElement('style');
    style.id = 'custom-alert-animations';
    style.textContent = `
        @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
    `;
    document.head.appendChild(style);
}

// 🚫 Acceso denegado
function showAccessDeniedAlert(redirectUrl = './login.html') {
    showCustomAlert({
        title: '¡Ops! 🚫',
        message: 'Estás en el lugar equivocado, regresa a la página de inicio o inicia sesión',
        type: 'error',
        icon: 'fa-lock',
        confirmText: 'Ir a inicio',
        cancelText: 'Iniciar sesión',
        onConfirm: () => (window.location.href = './index.html'),
        onCancel: () => (window.location.href = redirectUrl)
    });
}

// ✅ Éxito
function showSuccessAlert(message, onConfirm = null) {
    showCustomAlert({
        title: '¡Éxito!',
        message,
        type: 'success',
        icon: 'fa-check-circle',
        confirmText: 'Aceptar',
        onConfirm
    });
}

// ❌ Error
function showErrorAlert(message, onConfirm = null) {
    showCustomAlert({
        title: 'Error',
        message,
        type: 'error',
        icon: 'fa-times-circle',
        confirmText: 'Aceptar',
        onConfirm
    });
}

// ⚠️ Confirmación
function showConfirmAlert(message, onConfirm, onCancel = null) {
    showCustomAlert({
        title: '¿Estás seguro?',
        message,
        type: 'warning',
        icon: 'fa-question-circle',
        confirmText: 'Confirmar',
        cancelText: 'Cancelar',
        onConfirm,
        onCancel
    });
}

let currentUser = null;

async function checkAdminAccess() {
    try {
        // Verificar si hay una sesión activa
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
            alert('¡Ops! Estás en el lugar equivocado, regresa a la página de inicio o inicia sesión');
            window.location.href = './login';
            return false;
        }

        // Obtener información del usuario desde la base de datos
        const { data: userData, error: userError } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', session.user.id)
            .single();

        if (userError || !userData) {
            alert('¡Ops! Estás en el lugar equivocado, regresa a la página de inicio o inicia sesión');
            window.location.href = './login.html';
            return false;
        }

        // Verificar si es_admin es true
        if (!userData.es_admin) {
            alert('¡Ops! Estás en el lugar equivocado, regresa a la página de inicio o inicia sesión');
            window.location.href = '../../index';
            return false;
        }

        // Usuario válido y es administrador
        currentUser = userData;
        document.getElementById('adminName').textContent = userData.nombre;
        return true;

    } catch (error) {
        console.error('Error en verificación de acceso:', error);
        alert('¡Ops! Estás en el lugar equivocado, regresa a la página de inicio o inicia sesión');
        window.location.href = './login.html';
        return false;
    }
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

    const { count: commentsCount } = await supabase
        .from('comentarios')
        .select('*', { count: 'exact', head: true });

    document.getElementById('totalUsers').textContent = usersCount || 0;
    document.getElementById('totalExercises').textContent = exercisesCount || 0;
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
        tbody.innerHTML = '<tr><td colspan="5" class="loading">Aún no hay usuarios</td></tr>';
        return;
    }

    tbody.innerHTML = users.map(user => {
        const isCurrentUser = currentUser && currentUser.id === user.id;

        return `
            <tr>
                <td>${user.nombre}</td>
                <td>${user.correo}</td>
                <td>${new Date(user.fecha_registro).toLocaleDateString()}</td>
                <td>
                    ${isCurrentUser ? '' : `<button class="action-btn btn-delete" onclick="deleteUser('${user.id}')">Eliminar</button>`}
                </td>
            </tr>
        `;
    }).join('');
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
        tbody.innerHTML = '<tr><td colspan="4" class="loading">Aún no hay comentarios</td></tr>';
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

// Ejecutar verificación al cargar la página
checkAdminAccess().then(hasAccess => {
    if (hasAccess) {
        loadDashboardStats();
    }
});

