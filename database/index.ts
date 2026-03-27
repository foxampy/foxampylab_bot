import { createClient, SupabaseClient } from '@supabase/supabase-js';
import config from './config';

let supabase: SupabaseClient;

export function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(
      config.supabase.url,
      config.supabase.serviceRoleKey, // Используем service role для сервера
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }
  return supabase;
}

// Проверка подключения
export async function testConnection(): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    
    if (error) {
      if (error.code === '42P01') {
        // Таблица не существует - это ок, миграции ещё не применены
        console.log('⚠️ Таблицы ещё не созданы (примените миграции)');
        return true;
      }
      throw error;
    }
    
    console.log('✅ Supabase подключена');
    return true;
  } catch (error: any) {
    console.error('❌ Ошибка подключения к Supabase:', error.message);
    return false;
  }
}
