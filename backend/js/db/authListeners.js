import supabase from './supabase.js';
import { getCurrentUser } from './auth.js';

// Configurar escucha de cambios en el estado de autenticación
function setupAuthListeners() {
    supabase.getCurrentUser.onAuthStateChange((event, session) => {
      console.log('Auth event:', event);
      
      // Actualizar UI según el evento
      if (event === 'SIGNED_IN') {
        // Usuario ha iniciado sesión
        updateUIForSignedIn(session.user);
      } else if (event === 'SIGNED_OUT') {
        // Usuario ha cerrado sesión
        updateUIForSignedOut();
      } else if (event === 'USER_UPDATED') {
        // Datos del usuario actualizados
        updateUIForUserUpdated(session.user);
      }
    });
    
    // Verificar estado inicial
    checkCurrentAuthState();
  }
  
  // Verificar el estado de autenticación actual al cargar la página
  async function checkCurrentAuthState() {
    const { user, error } = await getCurrentUser.getCurrentUser();
    
    if (user) {
      updateUIForSignedIn(user);
    } else {
      updateUIForSignedOut();
    }
  }
  
  // Actualizar UI para usuario autenticado
  function updateUIForSignedIn(user) {
    // Ejemplos de cambios en la UI:
    document.querySelectorAll('.auth-only').forEach(el => el.style.display = 'block');
    document.querySelectorAll('.guest-only').forEach(el => el.style.display = 'none');
    
    // Si hay un elemento para mostrar el email del usuario
    const userEmailElements = document.querySelectorAll('.user-email');
    if (userEmailElements.length > 0) {
      userEmailElements.forEach(el => el.textContent = user.email);
    }
    
    // Eventos post-login personalizados
    // Redirigir a dashboard o página principal si es necesario
    if (window.location.pathname.includes('login.html') || 
        window.location.pathname.includes('signup.html')) {
      window.location.href = '/index.html';
    }
  }
  
  // Actualizar UI para usuario no autenticado
  function updateUIForSignedOut() {
    document.querySelectorAll('.auth-only').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.guest-only').forEach(el => el.style.display = 'block');
    
    // Redirigir al login si se requiere autenticación en esta página
    const requiresAuth = document.body.hasAttribute('data-requires-auth');
    if (requiresAuth && 
        !window.location.pathname.includes('login.html') && 
        !window.location.pathname.includes('signup.html')) {
      window.location.href = '/login.html';
    }
  }
  
  // Actualizar UI cuando cambian datos del usuario
  function updateUIForUserUpdated(user) {
    // Actualizar elementos específicos con los datos actualizados
    console.log('Usuario actualizado:', user);
  }
  
  // Iniciar los listeners al cargar
  document.addEventListener('DOMContentLoaded', setupAuthListeners);
  
  // Exponer funciones globalmente
  window.authListeners = {
    setupAuthListeners,
    checkCurrentAuthState
  };