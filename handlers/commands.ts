import TelegramBot from 'node-telegram-bot-api';
import { UserModel } from '../database/models/UserModel';
import { EventModel } from '../database/models/EventModel';
import { ServiceModel, OrderModel, AppointmentModel } from '../database/models/ServiceModel';
import config from '../config';
import {
  mainMenuKeyboard,
  adminKeyboard,
  servicesKeyboard,
  portfolioKeyboard,
  accountKeyboard,
  createCalendarKeyboard,
  createTimeSlotsKeyboard,
} from '../keyboards';

const { adminId } = config.bot;

// Обработка команды /start
export async function handleStart(bot: TelegramBot, msg: TelegramBot.Message) {
  const chatId = msg.chat.id;
  const user = msg.from;

  if (!user) return;

  // Сохраняем пользователя в БД
  const dbUser = await UserModel.upsert({
    telegram_id: user.id,
    username: user.username,
    first_name: user.first_name,
    last_name: user.last_name,
    language_code: user.language_code,
    is_bot: user.is_bot,
  });

  // Записываем событие входа
  await EventModel.create(user.id, 'start_command', {
    username: user.username,
    chat_id: chatId
  });

  // Проверяем, новый ли это пользователь
  const isNewUser = new Date(dbUser.created_at).getTime() > Date.now() - 5 * 60 * 1000;

  // Если новый пользователь - уведомляем админа
  if (isNewUser && user.id !== adminId) {
    await notifyAdminAboutNewUser(bot, user);
  }

  // Приветственное сообщение
  const welcomeMessage = isNewUser
    ? `👋 *Привет, ${user.first_name || 'друг'}!*

🎉 *Добро пожаловать в Foxampy Bot Builder!*

✨ *Создаем цифровые решения для бизнеса:*
🤖 Telegram боты
📱 Мобильные приложения
🌐 Веб-сайты
⚙️ CRM системы

🚀 *Выберите услугу в меню или запишитесь на консультацию!*`
    : `👋 *С возвращением, ${user.first_name || 'друг'}!*

🎯 *Чем могу помочь сегодня?*`;

  // Если это админ - показываем админ меню
  if (user.id === adminId) {
    await bot.sendMessage(chatId, '👑 *Панель администратора*\n\nУ вас есть доступ ко всем функциям управления.', {
      parse_mode: 'Markdown',
      reply_markup: adminKeyboard,
    });
    return;
  }

  await bot.sendMessage(chatId, welcomeMessage, {
    parse_mode: 'Markdown',
    reply_markup: mainMenuKeyboard,
  });
}

// Уведомление админа о новом пользователе
async function notifyAdminAboutNewUser(bot: TelegramBot, user: TelegramBot.User) {
  const notifyMessage = `🔔 *Новый пользователь в боте!*

👤 *Информация:*
• ID: \`${user.id}\`
• Username: ${user.username ? `@${user.username}` : 'нет'}
• Имя: ${user.first_name || ''} ${user.last_name || ''}
• Язык: ${user.language_code || 'ru'}

⏰ *Время:* ${new Date().toLocaleString('ru-RU')}`;

  try {
    await bot.sendMessage(adminId, notifyMessage, {
      parse_mode: 'Markdown',
    });
  } catch (error) {
    console.error('Ошибка отправки уведомления админу:', error);
  }
}

// Обработка команды /admin
export async function handleAdmin(bot: TelegramBot, msg: TelegramBot.Message) {
  const chatId = msg.chat.id;
  const user = msg.from;

  if (!user) return;

  // Проверка прав администратора
  if (user.id !== adminId) {
    await bot.sendMessage(chatId, '❌ *У вас нет доступа к этой команде*', {
      parse_mode: 'Markdown',
    });
    return;
  }

  // Записываем событие
  await EventModel.create(user.id, 'admin_command', {});

  const adminMessage = `👑 *Панель администратора*

📊 *Доступные действия:*
• Просмотр всех пользователей
• Просмотр новых пользователей
• Статистика бота
• Управление заказами
• Просмотр записей

Выберите действие:`;

  await bot.sendMessage(chatId, adminMessage, {
    parse_mode: 'Markdown',
    reply_markup: adminKeyboard,
  });
}

// Обработка команды /help
export async function handleHelp(bot: TelegramBot, msg: TelegramBot.Message) {
  const chatId = msg.chat.id;
  const user = msg.from;

  if (!user) return;

  await EventModel.create(user.id, 'help_command', {});

  const helpMessage = `❓ *Помощь и поддержка*

📚 *Как это работает:*

1️⃣ *Выберите услугу в меню*
2️⃣ *Ознакомьтесь с условиями*
3️⃣ *Оставьте заявку или запишитесь на консультацию*
4️⃣ *Мы свяжемся с вами для обсуждения деталей*

🛠 *Наши услуги:*
• Telegram боты - от $100
• Мобильные приложения - от $2000
• Веб-сайты - от $300
• CRM системы - от $1500
• Консультация - $100/час

💬 *Нужна помощь?*
Напишите в поддержку: @foxampy_support`;

  await bot.sendMessage(chatId, helpMessage, {
    parse_mode: 'Markdown',
  });
}

// Обработка команды /services
export async function handleServices(bot: TelegramBot, msg: TelegramBot.Message) {
  const chatId = msg.chat.id;
  const user = msg.from;

  if (!user) return;

  await EventModel.create(user.id, 'services_command', {});

  const servicesMessage = `📋 *Наши услуги*

Выберите категорию для просмотра деталей:

🤖 *Telegram боты*
От $100 до $1500
Срок: 3-14 дней

📱 *Мобильные приложения*
От $2000 до $10000
Срок: 30-60 дней

🌐 *Веб-сайты*
От $300 до $5000
Срок: 5-30 дней

⚙️ *CRM системы*
От $1500 до $8000
Срок: 30-45 дней`;

  await bot.sendMessage(chatId, servicesMessage, {
    parse_mode: 'Markdown',
    reply_markup: servicesKeyboard,
  });
}

// Обработка команды /portfolio
export async function handlePortfolio(bot: TelegramBot, msg: TelegramBot.Message) {
  const chatId = msg.chat.id;
  const user = msg.from;

  if (!user) return;

  await EventModel.create(user.id, 'portfolio_command', {});

  const portfolioMessage = `📖 *Наше портфолио*

Выберите категорию для просмотра работ:

⭐ *Реализованные проекты:*
• Civilization Protocol - блокчейн платформа
• Dogymorbios - социальная сеть для собак
• TradePlus - торговая платформа
• EthoLife - экосистема здоровья

И многие другие!`;

  await bot.sendMessage(chatId, portfolioMessage, {
    parse_mode: 'Markdown',
    reply_markup: portfolioKeyboard,
  });
}

// Обработка команды /account
export async function handleAccount(bot: TelegramBot, msg: TelegramBot.Message) {
  const chatId = msg.chat.id;
  const user = msg.from;

  if (!user) return;

  const dbUser = await UserModel.findById(user.id);

  if (!dbUser) {
    await bot.sendMessage(chatId, '❌ Пользователь не найден');
    return;
  }

  // Получаем статистику
  const orders = await OrderModel.findByUser(user.id);
  const appointments = await AppointmentModel.findByUser(user.id);

  const accountMessage = `👤 *Ваш аккаунт*

📋 *Информация:*
• ID: \`${user.id}\`
• Username: ${user.username ? `@${user.username}` : 'нет'}
• Имя: ${user.first_name || ''}

📊 *Статистика:*
• Заказов: ${orders.length}
• Записей: ${appointments.length}

📅 *Дата регистрации:* ${new Date(dbUser.created_at).toLocaleDateString('ru-RU')}
🕐 *Последний вход:* ${new Date(dbUser.last_seen).toLocaleString('ru-RU')}`;

  await bot.sendMessage(chatId, accountMessage, {
    parse_mode: 'Markdown',
    reply_markup: accountKeyboard,
  });
}
