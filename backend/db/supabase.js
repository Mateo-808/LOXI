import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ytkiehqbsojjwnxltnne.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0a2llaHFic29qandueGx0bm5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2ODY1MjEsImV4cCI6MjA2MDI2MjUyMX0.D24UX-L6d0woheBtKpauamnScCm3BlSeAnCwaOixOik';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);