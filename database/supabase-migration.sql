-- Миграция для Supabase PostgreSQL - Foxampy Bot
-- Выполните этот SQL в Supabase Dashboard → SQL Editor

-- Включите Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE selected_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- СУЩЕСТВУЮЩИЕ ТАБЛИЦЫ
-- ============================================

-- Пользователи
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  username VARCHAR(255),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  language_code VARCHAR(10) DEFAULT 'ru',
  is_bot BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  state VARCHAR(50) DEFAULT 'start',
  bot_project_id INTEGER,
  phone VARCHAR(20),
  email VARCHAR(255)
);

-- Проекты ботов
CREATE TABLE IF NOT EXISTS bot_projects (
  id SERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(telegram_id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Выбранные функции
CREATE TABLE IF NOT EXISTS selected_features (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES bot_projects(id) ON DELETE CASCADE,
  feature_id VARCHAR(50) NOT NULL,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Подписки
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(telegram_id) ON DELETE CASCADE,
  tier VARCHAR(50) DEFAULT 'free',
  status VARCHAR(50) DEFAULT 'inactive',
  started_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Лиды (заявки от ботов)
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  bot_project_id INTEGER REFERENCES bot_projects(id) ON DELETE CASCADE,
  user_telegram_id BIGINT,
  username VARCHAR(255),
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- События аналитики
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(telegram_id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- НОВЫЕ ТАБЛИЦЫ - УСЛУГИ И ЗАКАЗЫ
-- ============================================

-- Услуги
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  category VARCHAR(50) NOT NULL, -- 'telegram_bot', 'mobile_app', 'website', 'crm'
  description TEXT,
  description_en TEXT,
  price_from INTEGER NOT NULL, -- цена в долларах
  price_to INTEGER,
  duration_days INTEGER, -- срок выполнения в днях
  features JSONB DEFAULT '[]', -- список возможностей
  image_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Заказы
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(telegram_id) ON DELETE CASCADE,
  service_id INTEGER REFERENCES services(id),
  service_name VARCHAR(255) NOT NULL,
  service_category VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'new', -- new, in_progress, done, cancelled
  price INTEGER,
  description TEXT,
  requirements JSONB DEFAULT '{}',
  deadline DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Записи на консультацию
CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(telegram_id) ON DELETE CASCADE,
  username VARCHAR(255),
  first_name VARCHAR(255),
  phone VARCHAR(20),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  service_type VARCHAR(50), -- telegram_bot, mobile_app, website, crm, consultation
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, completed, cancelled, no_show
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Портфолио
CREATE TABLE IF NOT EXISTS portfolio (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  title_en VARCHAR(255),
  category VARCHAR(50) NOT NULL,
  description TEXT,
  description_en TEXT,
  image_urls JSONB DEFAULT '[]',
  project_url VARCHAR(500),
  github_url VARCHAR(500),
  technologies JSONB DEFAULT '[]',
  is_featured BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ИНДЕКСЫ
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_state ON users(state);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_bot_projects_user_id ON bot_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_selected_features_project_id ON selected_features(project_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_portfolio_category ON portfolio(category);
CREATE INDEX IF NOT EXISTS idx_portfolio_featured ON portfolio(is_featured);

-- ============================================
-- RLS Policies
-- ============================================
CREATE POLICY "Allow all operations for service role" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations for service role" ON bot_projects FOR ALL USING (true);
CREATE POLICY "Allow all operations for service role" ON selected_features FOR ALL USING (true);
CREATE POLICY "Allow all operations for service role" ON subscriptions FOR ALL USING (true);
CREATE POLICY "Allow all operations for service role" ON leads FOR ALL USING (true);
CREATE POLICY "Allow all operations for service role" ON events FOR ALL USING (true);
CREATE POLICY "Allow all operations for service role" ON services FOR ALL USING (true);
CREATE POLICY "Allow all operations for service role" ON orders FOR ALL USING (true);
CREATE POLICY "Allow all operations for service role" ON appointments FOR ALL USING (true);
CREATE POLICY "Allow all operations for service role" ON portfolio FOR ALL USING (true);

-- ============================================
-- ФУНКЦИИ
-- ============================================

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bot_projects_updated_at BEFORE UPDATE ON bot_projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ПРИМЕРЫ ДАННЫХ (можно удалить после создания)
-- ============================================

-- Услуги
INSERT INTO services (name, category, description, price_from, price_to, duration_days, features, sort_order) VALUES
('Бот-визитка', 'telegram_bot', 'Простой бот для презентации бизнеса', 100, 300, 3, '["Информация о компании", "Контакты", "FAQ"]', 1),
('Интернет-магазин в Telegram', 'telegram_bot', 'Полноценный магазин с каталогом и корзиной', 500, 1500, 14, '["Каталог товаров", "Корзина", "Оплата", "Админ-панель"]', 2),
('Бот для записи клиентов', 'telegram_bot', 'Автоматическая запись и напоминания', 300, 800, 7, '["Календарь", "Напоминания", "CRM интеграция"]', 3),
('Мобильное приложение iOS/Android', 'mobile_app', 'Нативное или кроссплатформенное приложение', 2000, 10000, 60, '["iOS и Android", "Дизайн", "Backend", "Публикация"]', 4),
('Лендинг / Сайт-визитка', 'website', 'Одностраничный сайт для презентации', 300, 800, 5, '["Адаптивный дизайн", "Формы заявок", "SEO"]', 5),
('Корпоративный сайт', 'website', 'Многостраничный сайт компании', 1000, 5000, 30, '["CMS", "Каталог", "Блог", "Интеграции"]', 6),
('CRM система', 'crm', 'Система управления клиентами', 1500, 8000, 45, '["Учёт клиентов", "Воронки", "Отчёты", "Интеграции"]', 7),
('Консультация', 'consultation', 'Часовая консультация по вашему проекту', 100, 100, 1, '["Анализ проекта", "Рекомендации", "План работ"]', 8);
