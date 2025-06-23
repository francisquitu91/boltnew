import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://okfoftilcshsumnqlech.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rZm9mdGlsY3Noc3VtbnFsZWNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMDkwMDQsImV4cCI6MjA2NTU4NTAwNH0.SSJp88hddccuC2EH-ZqOhJhpNbBMwLWmdkhyv_H1vdw';

export const supabase = createClient(supabaseUrl, supabaseKey);
