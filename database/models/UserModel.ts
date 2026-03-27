import { getSupabaseClient } from '../index';

export interface User {
  id: number;
  telegram_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  language_code: string;
  is_bot: boolean;
  created_at: string;
  updated_at: string;
  last_seen: string;
  state: string;
  bot_project_id?: number;
}

export interface UserCreate {
  telegram_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  language_code?: string;
  is_bot?: boolean;
}

export const UserModel = {
  // Создание или обновление пользователя
  async upsert(userData: UserCreate): Promise<User> {
    const supabase = getSupabaseClient();
    
    // Проверяем существующего пользователя
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', userData.telegram_id)
      .single();

    if (existingUser) {
      // Обновляем
      const { data, error } = await supabase
        .from('users')
        .update({
          username: userData.username || null,
          first_name: userData.first_name || null,
          last_name: userData.last_name || null,
          language_code: userData.language_code || 'ru',
          last_seen: new Date().toISOString(),
        })
        .eq('telegram_id', userData.telegram_id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Создаём
      const { data, error } = await supabase
        .from('users')
        .insert([{
          telegram_id: userData.telegram_id,
          username: userData.username || null,
          first_name: userData.first_name || null,
          last_name: userData.last_name || null,
          language_code: userData.language_code || 'ru',
          is_bot: userData.is_bot || false,
          state: 'start',
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  },

  // Получить пользователя по Telegram ID
  async findById(telegramId: number): Promise<User | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegramId)
      .single();

    if (error || !data) return null;
    return data;
  },

  // Получить всех пользователей
  async findAll(): Promise<User[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Обновить состояние пользователя
  async updateState(telegramId: number, state: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('users')
      .update({ state, updated_at: new Date().toISOString() })
      .eq('telegram_id', telegramId);

    if (error) throw error;
  },

  // Обновить проект пользователя
  async updateProject(telegramId: number, projectId: number): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('users')
      .update({ bot_project_id: projectId, updated_at: new Date().toISOString() })
      .eq('telegram_id', telegramId);

    if (error) throw error;
  },

  // Получить новых пользователей (за последние N часов)
  async findNewUsers(hours: number = 24): Promise<User[]> {
    const supabase = getSupabaseClient();
    const hoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .gte('created_at', hoursAgo)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Удалить пользователя
  async delete(telegramId: number): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('telegram_id', telegramId);

    if (error) throw error;
  },
};
