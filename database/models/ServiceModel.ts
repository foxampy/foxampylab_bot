import { getSupabaseClient } from '../index';

export interface Service {
  id: number;
  name: string;
  name_en?: string;
  category: string;
  description?: string;
  description_en?: string;
  price_from: number;
  price_to?: number;
  duration_days?: number;
  features: string[];
  image_url?: string;
  is_active: boolean;
  sort_order: number;
}

export interface Order {
  id: number;
  user_id: number;
  service_id?: number;
  service_name: string;
  service_category: string;
  status: string;
  price?: number;
  description?: string;
  requirements: any;
  deadline?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface Appointment {
  id: number;
  user_id: number;
  username?: string;
  first_name?: string;
  phone?: string;
  appointment_date: string;
  appointment_time: string;
  service_type: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const ServiceModel = {
  // Получить все активные услуги
  async findAll(active: boolean = true): Promise<Service[]> {
    const supabase = getSupabaseClient();
    const query = supabase
      .from('services')
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (active) {
      query.eq('is_active', true);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Получить услуги по категории
  async findByCategory(category: string): Promise<Service[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Получить услугу по ID
  async findById(id: number): Promise<Service | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return null;
    return data;
  },
};

export const OrderModel = {
  // Создать заказ
  async create(orderData: Partial<Order>): Promise<Order> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Получить заказы пользователя
  async findByUser(userId: number): Promise<Order[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Обновить статус заказа
  async updateStatus(orderId: number, status: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId);
    
    if (error) throw error;
  },

  // Получить все заказы (для админа)
  async findAll(): Promise<Order[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },
};

export const AppointmentModel = {
  // Создать запись
  async create(appointmentData: Partial<Appointment>): Promise<Appointment> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointmentData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Получить записи пользователя
  async findByUser(userId: number): Promise<Appointment[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', userId)
      .order('appointment_date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Проверить доступность времени
  async isTimeSlotAvailable(date: string, time: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('appointments')
      .select('id')
      .eq('appointment_date', date)
      .eq('appointment_time', time)
      .eq('status', 'scheduled')
      .single();
    
    if (error) return true; // Ошибка значит нет записей
    return !data; // Если есть запись - время занято
  },

  // Получить все записи (для админа)
  async findAll(limit: number = 50): Promise<Appointment[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('appointment_date', { ascending: true })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  },

  // Обновить статус записи
  async updateStatus(appointmentId: number, status: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('appointments')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', appointmentId);
    
    if (error) throw error;
  },
};
