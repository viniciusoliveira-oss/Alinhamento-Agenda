import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

const rawUrl = process.env.VITE_SUPABASE_URL || '';
const url = rawUrl.replace(/\/rest\/v1\/?$/, '');
console.log("Using URL:", url);
const supabase = createClient(url, process.env.VITE_SUPABASE_ANON_KEY || '');
async function test() {
  const usersRes = await supabase.from('app_users').select('*');
  const teamsRes = await supabase.from('teams').select('*');
  const situationsRes = await supabase.from('situations').select('*');
  console.log("users error:", usersRes.error);
  console.log("teams error:", teamsRes.error);
  console.log("situations error:", situationsRes.error);
  console.log("situations data length:", situationsRes.data?.length);
}
test();
