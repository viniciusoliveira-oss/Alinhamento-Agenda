import re

with open('src/context/AppContext.tsx', 'r') as f:
    content = f.read()

new_sync = """  // Helper function to sync with Supabase async
  const syncToSupabase = async (table: string, action: 'insert' | 'update' | 'delete', data: any, id?: string) => {
    if (!state.isSupabaseConnected) {
      console.warn("Supabase not connected. Skipping sync.");
      return;
    }
    try {
      let result;
      if (action === 'insert') {
        result = await supabase.from(table).insert([data]);
      } else if (action === 'update' && id) {
        result = await supabase.from(table).update(data).eq('id', id);
      } else if (action === 'delete' && id) {
        result = await supabase.from(table).delete().eq('id', id);
      }
      if (result && result.error) {
        console.error(`Supabase sync error on ${table} (${action}):`, result.error);
        alert(`Erro ao sincronizar com banco de dados (${table}): ${result.error.message}`);
      }
    } catch(err) {
      console.error(`Supabase sync catch error on ${table}:`, err);
    }
  };"""

content = re.sub(r'  // Helper function to sync with Supabase async.*?  \};', new_sync, content, flags=re.DOTALL)

with open('src/context/AppContext.tsx', 'w') as f:
    f.write(content)

