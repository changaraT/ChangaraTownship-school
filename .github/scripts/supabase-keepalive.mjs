import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in GitHub Actions secrets.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const { data, error } = await supabase
    .from('students')
    .select('id')
    .limit(1);

if (error) {
    throw new Error(`Supabase keep-alive failed: ${error.message}`);
}

console.log(`Supabase keep-alive success. Retrieved ${data?.length ?? 0} rows from students.`);
