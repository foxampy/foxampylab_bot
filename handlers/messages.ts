import TelegramBot from 'node-telegram-bot-api';
import { UserModel } from '../database/models/UserModel';
import { EventModel } from '../database/models/EventModel';
import { ServiceModel, OrderModel, AppointmentModel } from '../database/models/ServiceModel';
import config from '../config';
import {
  mainMenuKeyboard,
  servicesKeyboard,
  telegramBotServicesKeyboard,
  portfolioKeyboard,
  accountKeyboard,
  createCalendarKeyboard,
  createTimeSlotsKeyboard,
} from '../keyboards';

// Обработка текстовых сообщений
export async function handleTextMessage(bot: TelegramBot, msg: TelegramBot.Message) {
  const chatId = msg.chat.id;
  const user = msg.from;
  const text = msg.text || '';

  if (!user) return;

  // Записываем событие
  await EventModel.create(user.id, 'text_message', { text, chat_id: chatId });

  // Обработка команд меню
  switch (text) {
    case '📋 Услуги и цены':
      const servicesMessage = `📋 *Наши услуги и цены*

Выберите категорию для подробностей:

🤖 *Telegram боты* - от $100 до $1500
📱 *Мобильные приложения* - от $2000 до $10000
🌐 *Веб-сайты* - от $300 до $5000
⚙️ *CRM системы* - от $1500 до $8000

💼 *Также доступны:*
• Консультация - $100/час
• Техническая поддержка - от $50/мес`;

      await bot.sendMessage(chatId, servicesMessage, {
        parse_mode: 'Markdown',
        reply_markup: servicesKeyboard,
      });
      break;

    case '🚀 Собрать бота':
      const botServicesMessage = `🤖 *Telegram боты - каталог услуг*

Выберите тип бота:

💼 *Бот-визитка* - $100-300
Простой бот для презентации бизнеса
Срок: 3 дня

🛒 *Интернет-магазин* - $500-1500
Каталог, корзина, оплата
Срок: 14 дней

📅 *Бот для записи* - $300-800
Календарь, напоминания, CRM
Срок: 7 дней

🎓 *Образовательный бот* - $400-1000
Курсы, тесты, сертификаты
Срок: 10 дней

🏢 *Бот для бизнеса* - $600-2000
Интеграции, аналитика, отчёты
Срок: 14 дней

🎮 *Игра в Telegram* - $800-3000
Интерактивная игра с механикой
Срок: 21 день`;

      await bot.sendMessage(chatId, botServicesMessage, {
        parse_mode: 'Markdown',
        reply_markup: telegramBotServicesKeyboard,
      });
      break;

    case '📅 Записаться':
      const calendarMessage = `📅 *Запись на консультацию*

Выберите дату для записи:

🕐 *Время работы:* ежедневно с 10:00 до 22:00
💰 *Стоимость консультации:* $100/час

*Что вы получите:*
• Анализ вашего проекта
• Рекомендации по реализации
• План работ и смета
• Ответы на все вопросы`;

      const calendarKeyboard = createCalendarKeyboard(new Date());

      await bot.sendMessage(chatId, calendarMessage, {
        parse_mode: 'Markdown',
        reply_markup: calendarKeyboard,
      });
      break;

    case '📖 Портфолио':
      const portfolioMessage = `📖 *Наше портфолио*

Выберите категорию работ:

🤖 *Telegram боты*
• Foxampy Bot Builder
• Civilization Protocol Bot
• Shop Assistant Bot

📱 *Мобильные приложения*
• Dogymorbios (iOS/Android)
• Fitness Tracker App

🌐 *Веб-сайты*
• Foxampy Portfolio
• Civilization Protocol
• EthoLife Platform

⚙️ *CRM системы*
• Sales CRM
• Project Management System`;

      await bot.sendMessage(chatId, portfolioMessage, {
        parse_mode: 'Markdown',
        reply_markup: portfolioKeyboard,
      });
      break;

    case '👤 Мой аккаунт':
      const dbUser = await UserModel.findById(user.id);
      if (dbUser) {
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

📅 *Дата регистрации:* ${new Date(dbUser.created_at).toLocaleDateString('ru-RU')}`;

        await bot.sendMessage(chatId, accountMessage, {
          parse_mode: 'Markdown',
          reply_markup: accountKeyboard,
        });
      }
      break;

    case '🎨 Конструктор (App)':
      const { miniApp } = config;
      await bot.sendMessage(chatId, '🎨 *Открываем конструктор...*\n\nЗагрузка Mini App с воронкой продаж...', {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[
            { text: '🚀 Открыть конструктор', web_app: { url: miniApp.url } }
          ]]
        },
      });
      break;

    default:
      // Неизвестная команда - показываем главное меню
      await bot.sendMessage(chatId, '🏠 *Главное меню*\n\nВыберите действие:', {
        parse_mode: 'Markdown',
        reply_markup: mainMenuKeyboard,
      });
  }
}
