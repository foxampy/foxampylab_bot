import dotenv from 'dotenv';

dotenv.config();

export const config = {
  bot: {
    token: process.env.BOT_TOKEN || '',
    adminId: Number(process.env.ADMIN_ID) || 0,
  },
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  server: {
    port: Number(process.env.SERVER_PORT) || 3000,
    url: process.env.SERVER_URL || 'http://localhost:3000',
  },
  miniApp: {
    url: process.env.MINI_APP_URL || 'http://localhost:5173',
  },
  env: process.env.NODE_ENV || 'development',
};

// Проверка наличия обязательных переменных
if (!config.bot.token) {
  console.error('❌ BOT_TOKEN не найден в .env файле');
  process.exit(1);
}

if (!config.bot.adminId) {
  console.error('❌ ADMIN_ID не найден в .env файле');
  process.exit(1);
}

if (!config.supabase.url || !config.supabase.anonKey) {
  console.error('❌ SUPABASE_URL или SUPABASE_ANON_KEY не найдены в .env файле');
  process.exit(1);
}

export default config;
