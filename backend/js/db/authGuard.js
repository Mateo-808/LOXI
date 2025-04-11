import { getCurrentUser } from './auth.js';

export async function requireAuth() {
  const { user, error } = await getCurrentUser();
  //RECORDAR INGRESAR LA URL DEL ARCHIVO DE LOGIN CORRECTO
  if (!user && !window.location.pathname.includes('login.html')) {
    window.location.href = '/login.html';
  }
  
  return user;
}