/* ======================================================
   SKYNOVA · Configuration Supabase
   Credentials du projet (anon key = publique par design,
   protégée par les Row Level Security policies).
   ====================================================== */

const SUPABASE_URL      = 'https://bmduqmrlvidwqawurzim.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtZHVxbXJsdmlkd3Fhd3VyemltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0Nzc2MDAsImV4cCI6MjA5NDA1MzYwMH0.5YLqpvZBMzMco6NyegbV6CGyR1xVUkPUmwSLhxSwyHY';

window.SKYNOVA_CONFIG = { SUPABASE_URL, SUPABASE_ANON_KEY };
