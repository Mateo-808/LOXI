import { supabaseRequest } from './supabaseClient.js';

export async function getUserById(id) {
  return supabaseRequest(`usuarios?id=eq.${id}&select=*`);
}
