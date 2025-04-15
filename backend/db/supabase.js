import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { supabaseUrl, supabaseKey } from './keys.js';

export const supabase = createClient(supabaseUrl, supabaseKey);