import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bllvqufahggmbhhfqidk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsbHZxdWZhaGdnbWJoaGZxaWRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyMTA1NTgsImV4cCI6MjA1OTc4NjU1OH0.Sucy2GME2XYMxW7cVSbqnxG4cmeTkY2IeqSvWUHSxts';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);