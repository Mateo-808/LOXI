// backend/js/supabaseClient.js
import fetch from 'node-fetch';

const SUPABASE_URL = 'https://bllvqufahggmbhhfqidk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsbHZxdWZhaGdnbWJoaGZxaWRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyMTA1NTgsImV4cCI6MjA1OTc4NjU1OH0.Sucy2GME2XYMxW7cVSbqnxG4cmeTkY2IeqSvWUHSxts';

export async function supabaseRequest(endpoint, options = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  const headers = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
    ...options.headers
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase error: ${response.status} - ${errorText}`);
  }

  const data = await response.text();
  return data ? JSON.parse(data) : null;
}
