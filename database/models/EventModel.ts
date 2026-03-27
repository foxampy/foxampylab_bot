import { getSupabaseClient } from '../index';

export interface Event {
  id: number;
  user_id: number;
  event_type: string;
  event_data: any;
  created_at: string;
}

export const EventModel = {
  // Создать событие
  async create(userId: number, eventType: string, eventData?: any): Promise<Event> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('events')
      .insert([{
        user_id: userId,
        event_type: eventType,
        event_data: eventData || {},
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Получить события пользователя
  async findByUser(userId: number, limit: number = 50): Promise<Event[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  // Получить события по типу
  async findByType(eventType: string, limit: number = 100): Promise<Event[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('event_type', eventType)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  // Получить статистику событий за период
  async getStats(days: number = 7): Promise<any[]> {
    const supabase = getSupabaseClient();
    const daysAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('events')
      .select('event_type, created_at')
      .gte('created_at', daysAgo);

    if (error) throw error;

    // Агрегируем данные
    const stats: Record<string, Record<string, number>> = {};
    data?.forEach((event: any) => {
      const date = new Date(event.created_at).toISOString().split('T')[0];
      if (!stats[event.event_type]) stats[event.event_type] = {};
      if (!stats[event.event_type][date]) stats[event.event_type][date] = 0;
      stats[event.event_type][date]++;
    });

    return Object.entries(stats).map(([eventType, dates]) => ({
      event_type: eventType,
      dates: Object.entries(dates).map(([date, count]) => ({ date, count })),
    }));
  },
};
