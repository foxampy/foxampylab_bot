import TelegramBot from 'node-telegram-bot-api';
import config from './config';
import { testConnection } from './database';
import { handleStart, handleAdmin, handleHelp, handleProfile } from './handlers/commands';
import { handleCallbackQuery } from './handlers/callbacks';
import { handleTextMessage } from './handlers/messages';

const { token } = config.bot;

// Инициализация бота
const bot = new TelegramBot(token, { polling: true });

console.log('🤖 Telegram Bot запускается...');

// Обработчик команды /start
bot.onText(/\/start/, async (msg) => {
  try {
    await handleStart(bot, msg);
  } catch (error) {
    console.error('Ошибка в /start:', error);
  }
});

// Обработчик команды /admin
bot.onText(/\/admin/, async (msg) => {
  try {
    await handleAdmin(bot, msg);
  } catch (error) {
    console.error('Ошибка в /admin:', error);
  }
});

// Обработчик команды /help
bot.onText(/\/help/, async (msg) => {
  try {
    await handleHelp(bot, msg);
  } catch (error) {
    console.error('Ошибка в /help:', error);
  }
});

// Обработчик команды /profile
bot.onText(/\/profile/, async (msg) => {
  try {
    await handleProfile(bot, msg);
  } catch (error) {
    console.error('Ошибка в /profile:', error);
  }
});

// Обработчик callback query (кнопки)
bot.on('callback_query', async (query) => {
  try {
    await handleCallbackQuery(bot, query);
  } catch (error) {
    console.error('Ошибка в callback query:', error);
  }
});

// Обработчик текстовых сообщений
bot.on('message', async (msg) => {
  try {
    // Игнорируем команды (они уже обработаны выше)
    if (msg.text && (msg.text.startsWith('/start') || msg.text.startsWith('/admin') || 
        msg.text.startsWith('/help') || msg.text.startsWith('/profile'))) {
      return;
    }

    // Игнорируем системные сообщения
    if (!msg.text) return;

    await handleTextMessage(bot, msg);
  } catch (error) {
    console.error('Ошибка в текстовом сообщении:', error);
  }
});

// Обработчик новых участников
bot.on('new_chat_members', async (msg) => {
  console.log('Новые участники:', msg.new_chat_members);
});

// Обработчик ухода участников
bot.on('left_chat_member', async (msg) => {
  console.log('Участник ушел:', msg.left_chat_member);
});

// Глобальная обработка ошибок
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Запуск бота
async function startBot() {
  try {
    // Проверка подключения к базе данных
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.warn('⚠️ База данных не подключена. Бот запущен в ограниченном режиме.');
    }

    // Получение информации о боте
    const botInfo = await bot.getMe();
    console.log(`✅ Бот запущен: @${botInfo.username}`);
    console.log(`👑 Admin ID: ${config.bot.adminId}`);
    console.log(`🌍 Environment: ${config.env}`);
    console.log('─────────────────────────');
    console.log('📡 Бот готов к работе!');
    
  } catch (error) {
    console.error('❌ Ошибка запуска бота:', error);
    process.exit(1);
  }
}

// Запуск
startBot();

export default bot;
