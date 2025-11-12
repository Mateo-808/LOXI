import { supabase } from './supabaseClient.js';

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

function showAccessDeniedAlert(redirectUrl = './login.html') {
    showCustomAlert({
        title: '¡Ops! ',
        message: 'Estás en el lugar equivocado, regresa a la página de inicio o inicia sesión',
        type: 'error',
        icon: 'fa-lock',
        confirmText: 'Ir a inicio',
        cancelText: 'Iniciar sesión',
        onConfirm: () => (window.location.href = '../../'),
        onCancel: () => (window.location.href = './login.html')
    });
}

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
        const usuarioGuardado = localStorage.getItem('usuario');
        
        if (!usuarioGuardado) {
            console.log('No hay usuario en localStorage');
            showAccessDeniedAlert('./login.html');
            return false;
        }

        const usuario = JSON.parse(usuarioGuardado);
        console.log('Usuario desde localStorage:', usuario);

        if (!usuario.es_admin || usuario.es_admin !== true) {
            console.log('Usuario no es administrador:', usuario.es_admin);
            showAccessDeniedAlert('../../index.html');
            return false;
        }

        const { data: userData, error: userError } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', usuario.id)
            .single();

        if (userError || !userData) {
            console.error('Error al verificar usuario en BD:', userError);
            showAccessDeniedAlert('./login.html');
            return false;
        }

        if (!userData.es_admin) {
            console.log('Usuario no es admin según BD');
            showAccessDeniedAlert('../../index.html');
            return false;
        }

        currentUser = userData;
        document.getElementById('adminName').textContent = userData.nombre || 'Administrador';
        console.log('Acceso concedido a:', userData.nombre);
        return true;

    } catch (error) {
        console.error('Error en verificación de acceso:', error);
        showAccessDeniedAlert('./login.html');
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
        ejercicios: 'Gestión de Ejercicios',
        progreso: 'Progreso de Estudiantes',
        comentarios: 'Gestión de Comentarios'
    };
    document.getElementById('sectionTitle').textContent = titles[sectionName];

    if (sectionName === 'dashboard') loadDashboardStats();
    else if (sectionName === 'usuarios') loadUsers();
    else if (sectionName === 'ejercicios') loadExercises();
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
        tbody.innerHTML = '<tr><td colspan="5">Error al cargar usuarios</td></tr>';
        return;
    }

    if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">Aún no hay usuarios</td></tr>';
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
                    ${isCurrentUser ? '<span class="badge badge-info">Tú</span>' : `<button class="action-btn btn-delete" onclick="deleteUser('${user.id}')">Eliminar</button>`}
                </td>
            </tr>
        `;
    }).join('');
}

window.deleteUser = async function(userId) {
    showConfirmAlert('¿Estás seguro de eliminar este usuario? Esto también eliminará todo su progreso y comentarios. Esta acción no se puede deshacer.', async () => {
        try {
            const { error: progresoError } = await supabase
                .from('progreso')
                .delete()
                .eq('usuario_id', userId);

            if (progresoError) {
                console.error('Error al eliminar progreso:', progresoError);
                showErrorAlert('Error al eliminar el progreso del usuario: ' + progresoError.message);
                return;
            }

            const { error: comentariosError } = await supabase
                .from('comentarios')
                .delete()
                .eq('usuario_id', userId);

            if (comentariosError) {
                console.error('Error al eliminar comentarios:', comentariosError);
                showErrorAlert('Error al eliminar los comentarios del usuario: ' + comentariosError.message);
                return;
            }

            const { error: usuarioError } = await supabase
                .from('usuarios')
                .delete()
                .eq('id', userId);

            if (usuarioError) {
                console.error('Error al eliminar usuario:', usuarioError);
                showErrorAlert('Error al eliminar usuario: ' + usuarioError.message);
                return;
            }

            showSuccessAlert('Usuario y todos sus datos eliminados correctamente');
            await loadUsers();
        } catch (error) {
            console.error('Error inesperado:', error);
            showErrorAlert('Error inesperado al eliminar usuario');
        }
    });
};

async function loadExercises() {
    const tbody = document.getElementById('exercisesTableBody');
    tbody.innerHTML = '<tr><td colspan="4">Cargando...</td></tr>';

    const { data: exercises, error } = await supabase
        .from('ejercicios')
        .select('*')
        .order('titulo');

    if (error) {
        tbody.innerHTML = '<tr><td colspan="4">Error al cargar ejercicios</td></tr>';
        return;
    }

    if (!exercises || exercises.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">No hay ejercicios</td></tr>';
        return;
    }

    tbody.innerHTML = exercises.map(exercise => `
        <tr>
            <td>${exercise.titulo}</td>
            <td><span class="badge badge-info">${exercise.nivel}</span></td>
            <td><span class="badge badge-warning">${exercise.tipo}</span></td>
            <td>
                <button class="action-btn btn-edit" onclick="editExercise('${exercise.id}')">Editar</button>
                <button class="action-btn btn-delete" onclick="deleteExercise('${exercise.id}')">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

window.deleteExercise = async function(exerciseId) {
    showConfirmAlert('¿Eliminar este ejercicio?', async () => {
        const { error } = await supabase
            .from('ejercicios')
            .delete()
            .eq('id', exerciseId);

        if (error) {
            showErrorAlert('Error al eliminar ejercicio');
            return;
        }

        showSuccessAlert('Ejercicio eliminado correctamente');
        loadExercises();
    });
};

async function loadProgress() {
    const tbody = document.getElementById('progressTableBody');
    tbody.innerHTML = '<tr><td colspan="6">Cargando...</td></tr>';

    const { data: progress, error } = await supabase
        .from('progreso')
        .select(`*, usuarios(nombre), ejercicios(titulo)`)
        .order('fecha', { ascending: false });

    if (error) {
        tbody.innerHTML = '<tr><td colspan="6">Error al cargar progreso</td></tr>';
        return;
    }

    if (!progress || progress.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">No hay datos de progreso</td></tr>';
        return;
    }

    tbody.innerHTML = progress.map(p => `
        <tr>
            <td>${p.usuarios?.nombre || 'N/A'}</td>
            <td>${p.ejercicios?.titulo || 'N/A'}</td>
            <td>${p.puntuacion || 0}</td>
            <td>${p.intentos || 0}</td>
            <td><span class="badge ${p.completado ? 'badge-success' : 'badge-warning'}">${p.completado ? 'Sí' : 'No'}</span></td>
            <td>${new Date(p.fecha).toLocaleDateString()}</td>
        </tr>
    `).join('');
}

async function loadComments() {
    const tbody = document.getElementById('commentsTableBody');
    tbody.innerHTML = '<tr><td colspan="4">Cargando...</td></tr>';

    const { data: comments, error } = await supabase
        .from('comentarios')
        .select(`*, usuarios!comentarios_usuario_id_fkey(nombre)`)
        .order('fecha', { ascending: false });

    if (error) {
        tbody.innerHTML = '<tr><td colspan="4">Error al cargar comentarios</td></tr>';
        return;
    }

    if (!comments || comments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">Aún no hay comentarios</td></tr>';
        return;
    }

    tbody.innerHTML = comments.map(comment => `
        <tr>
            <td>${comment.usuarios?.nombre || 'N/A'}</td>
            <td>${comment.mensaje}</td>
            <td>${new Date(comment.fecha).toLocaleDateString()}</td>
            <td><button class="action-btn btn-delete" onclick="deleteComment('${comment.id}')">Eliminar</button></td>
        </tr>
    `).join('');
}

window.deleteComment = async function(commentId) {
    showConfirmAlert('¿Eliminar este comentario?', async () => {
        const { error } = await supabase
            .from('comentarios')
            .delete()
            .eq('id', commentId);

        if (error) {
            showErrorAlert('Error al eliminar comentario');
            return;
        }

        showSuccessAlert('Comentario eliminado correctamente');
        loadComments();
    });
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

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("usuario");
    showSuccessAlert('Sesión cerrada correctamente', () => {
        window.location.href = "../../index.html";
    })
  });
}

// AGREGAR ESTAS FUNCIONES AL FINAL DE TU admin.js (antes de checkAdminAccess)

// Agregar nuevo ejercicio
document.getElementById('addExerciseBtn')?.addEventListener('click', () => {
    showModal('Nuevo Ejercicio', `
        <div class="form-group">
            <label>Título *</label>
            <input type="text" id="exerciseTitle" required>
        </div>
        <div class="form-group">
            <label>Descripción *</label>
            <textarea id="exerciseDescription" rows="3" required></textarea>
        </div>
        <div class="form-group">
            <label>Nivel *</label>
            <select id="exerciseLevel" required>
                <option value="">Seleccionar...</option>
                <option value="Novato">Novato</option>
                <option value="Principiante">Principiante</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzado">Avanzado</option>
            </select>
        </div>
        <div class="form-group">
            <label>Tipo *</label>
            <select id="exerciseType" required>
                <option value="">Seleccionar...</option>
                <option value="texto">Texto</option>
                <option value="codigo">Código</option>
                <option value="opcion_multiple">Opción Múltiple</option>
            </select>
        </div>
        <div class="form-group">
            <label>Descripción del Ejercicio *</label>
            <textarea id="exerciseDescripcion" rows="4" required></textarea>
        </div>
        <div class="form-group">
            <label>Ejercicio (Enunciado) *</label>
            <textarea id="exerciseEjercicio" rows="3" required></textarea>
        </div>
        <div class="form-group">
            <label>Respuesta Correcta *</label>
            <input type="text" id="exerciseRespuesta" required>
        </div>
        <div class="form-group">
            <label>Puntos *</label>
            <input type="number" id="exercisePuntos" value="100" required>
        </div>
        <div class="form-group">
            <label>Pista (Opcional)</label>
            <input type="text" id="exercisePista">
        </div>
        <div class="form-actions">
            <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
            <button type="button" class="btn-primary" onclick="saveNewExercise()">Guardar</button>
        </div>
    `);
});

// Guardar nuevo ejercicio
window.saveNewExercise = async function() {
    const titulo = document.getElementById('exerciseTitle').value.trim();
    const descripcion = document.getElementById('exerciseDescription').value.trim();
    const nivel = document.getElementById('exerciseLevel').value;
    const tipo = document.getElementById('exerciseType').value;
    const descripcion_ejercicio = document.getElementById('exerciseDescripcion').value.trim();
    const ejercicio = document.getElementById('exerciseEjercicio').value.trim();
    const respuesta = document.getElementById('exerciseRespuesta').value.trim();
    const puntos = parseInt(document.getElementById('exercisePuntos').value);
    const pista = document.getElementById('exercisePista').value.trim();

    // Validación
    if (!titulo || !descripcion || !nivel || !tipo || !descripcion_ejercicio || !ejercicio || !respuesta || !puntos) {
        showErrorAlert('Por favor completa todos los campos obligatorios');
        return;
    }

    try {
        const { data, error } = await supabase
            .from('ejercicios')
            .insert([{
                titulo,
                descripcion,
                nivel,
                tipo,
                descripción_ejercicio: descripcion_ejercicio,
                ejercicio,
                respuesta,
                puntos,
                pista: pista || null
            }]);

        if (error) {
            console.error('Error al crear ejercicio:', error);
            showErrorAlert('Error al crear el ejercicio: ' + error.message);
            return;
        }

        closeModal();
        showSuccessAlert('Ejercicio creado correctamente');
        loadExercises();
    } catch (error) {
        console.error('Error inesperado:', error);
        showErrorAlert('Error inesperado al crear ejercicio');
    }
};

// Editar ejercicio
window.editExercise = async function(exerciseId) {
    try {
        // Obtener los datos del ejercicio
        const { data: exercise, error } = await supabase
            .from('ejercicios')
            .select('*')
            .eq('id', exerciseId)
            .single();

        if (error || !exercise) {
            showErrorAlert('Error al cargar el ejercicio');
            return;
        }

        showModal('Editar Ejercicio', `
            <div class="form-group">
                <label>Título *</label>
                <input type="text" id="editExerciseTitle" value="${exercise.titulo || ''}" required>
            </div>
            <div class="form-group">
                <label>Descripción *</label>
                <textarea id="editExerciseDescription" rows="3" required>${exercise.descripcion || ''}</textarea>
            </div>
            <div class="form-group">
                <label>Nivel *</label>
                <select id="editExerciseLevel" required>
                    <option value="Novato" ${exercise.nivel === 'Novato' ? 'selected' : ''}>Novato</option>
                    <option value="Principiante" ${exercise.nivel === 'Principiante' ? 'selected' : ''}>Principiante</option>
                    <option value="Intermedio" ${exercise.nivel === 'Intermedio' ? 'selected' : ''}>Intermedio</option>
                    <option value="Avanzado" ${exercise.nivel === 'Avanzado' ? 'selected' : ''}>Avanzado</option>
                </select>
            </div>
            <div class="form-group">
                <label>Tipo *</label>
                <select id="editExerciseType" required>
                    <option value="texto" ${exercise.tipo === 'texto' ? 'selected' : ''}>Texto</option>
                    <option value="codigo" ${exercise.tipo === 'codigo' ? 'selected' : ''}>Código</option>
                    <option value="opcion_multiple" ${exercise.tipo === 'opcion_multiple' ? 'selected' : ''}>Opción Múltiple</option>
                </select>
            </div>
            <div class="form-group">
                <label>Descripción del Ejercicio *</label>
                <textarea id="editExerciseDescripcion" rows="4" required>${exercise.descripción_ejercicio || ''}</textarea>
            </div>
            <div class="form-group">
                <label>Ejercicio (Enunciado) *</label>
                <textarea id="editExerciseEjercicio" rows="3" required>${exercise.ejercicio || ''}</textarea>
            </div>
            <div class="form-group">
                <label>Respuesta Correcta *</label>
                <input type="text" id="editExerciseRespuesta" value="${exercise.respuesta || ''}" required>
            </div>
            <div class="form-group">
                <label>Puntos *</label>
                <input type="number" id="editExercisePuntos" value="${exercise.puntos || 100}" required>
            </div>
            <div class="form-group">
                <label>Pista (Opcional)</label>
                <input type="text" id="editExercisePista" value="${exercise.pista || ''}">
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
                <button type="button" class="btn-primary" onclick="updateExercise('${exerciseId}')">Actualizar</button>
            </div>
        `);
    } catch (error) {
        console.error('Error:', error);
        showErrorAlert('Error al cargar el ejercicio');
    }
};

// Actualizar ejercicio
window.updateExercise = async function(exerciseId) {
    const titulo = document.getElementById('editExerciseTitle').value.trim();
    const descripcion = document.getElementById('editExerciseDescription').value.trim();
    const nivel = document.getElementById('editExerciseLevel').value;
    const tipo = document.getElementById('editExerciseType').value;
    const descripcion_ejercicio = document.getElementById('editExerciseDescripcion').value.trim();
    const ejercicio = document.getElementById('editExerciseEjercicio').value.trim();
    const respuesta = document.getElementById('editExerciseRespuesta').value.trim();
    const puntos = parseInt(document.getElementById('editExercisePuntos').value);
    const pista = document.getElementById('editExercisePista').value.trim();

    // Validación
    if (!titulo || !descripcion || !nivel || !tipo || !descripcion_ejercicio || !ejercicio || !respuesta || !puntos) {
        showErrorAlert('Por favor completa todos los campos obligatorios');
        return;
    }

    try {
        const { data, error } = await supabase
            .from('ejercicios')
            .update({
                titulo,
                descripcion,
                nivel,
                tipo,
                descripción_ejercicio: descripcion_ejercicio,
                ejercicio,
                respuesta,
                puntos,
                pista: pista || null
            })
            .eq('id', exerciseId);

        if (error) {
            console.error('Error al actualizar ejercicio:', error);
            showErrorAlert('Error al actualizar el ejercicio: ' + error.message);
            return;
        }

        closeModal();
        showSuccessAlert('Ejercicio actualizado correctamente');
        loadExercises();
    } catch (error) {
        console.error('Error inesperado:', error);
        showErrorAlert('Error inesperado al actualizar ejercicio');
    }
};

checkAdminAccess().then(hasAccess => {
    if (hasAccess) {
        loadDashboardStats();
    }
});