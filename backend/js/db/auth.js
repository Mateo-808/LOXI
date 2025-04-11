// Funciones de autenticación 
// Para módulos: import supabase from './supabase.js'
// Sin módulos: usar el supabase global
import supabase from './supabase.js';

  // Inicio de sesión con email y contraseña
  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });
    
    return { data, error };
  }
  
  // Cierre de sesión
  async function signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  }
  
  // Obtener usuario actual
  async function getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();
    return { user: data.user, error };
  }
  
  // Reseteo de contraseña
  async function resetPassword(email) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password.html',
    });
    
    return { data, error };
  }
  
  // Actualizar contraseña
  async function updatePassword(newPassword) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    return { data, error };
  }
  
  // Inicio de sesión con proveedores sociales
  async function signInWithProvider(provider) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: window.location.origin
      }
    });
    
    return { data, error };
  }
  
  // Actualizar datos del usuario
  async function updateUserData(userData) {
    const { data, error } = await supabase.auth.updateUser({
      data: userData
    });
    
    return { data, error };
  }
  
  // Exportar para uso global
  window.auth = {
    signUp,
    signIn,
    signOut,
    getCurrentUser,
    resetPassword,
    updatePassword,
    signInWithProvider,
    updateUserData
  };

  // EJEMPLO DE LOGIN
    // import { signIn, signInWithProvider } from './auth.js';
    // import { setupAuthListeners } from './authListeners.js';
    
    // // Configurar los listeners de autenticación
    // document.addEventListener('DOMContentLoaded', setupAuthListeners);
    
    // // Manejar el envío del formulario de login
    // document.getElementById('loginForm').addEventListener('submit', async (e) => {
    //     e.preventDefault();
        
    //     const email = document.getElementById('email').value;
    //     const password = document.getElementById('password').value;
    //     const errorMessage = document.getElementById('error-message');
        
    //     errorMessage.textContent = '';
        
    //     const { data, error } = await signIn(email, password);
        
    //     if (error) {
    //     errorMessage.textContent = error.message;
    //     } else {
    //     // La redirección se maneja en authListeners.js
    //     }
    // });
    
    // // Manejar logins sociales
    // document.getElementById('googleLogin').addEventListener('click', async () => {
    //     await signInWithProvider('google');
    // });
    
    // document.getElementById('githubLogin').addEventListener('click', async () => {
    //     await signInWithProvider('github');
    // });