import { supabase } from './src/lib/supabase.ts';
async function test() {
  const { error } = await supabase.from('situations').select('*').limit(1);
  if (error) console.error("Error situations:", error);
  const { error: e2 } = await supabase.from('app_users').select('*').limit(1);
  if (e2) console.error("Error app_users:", e2);
}
test();
