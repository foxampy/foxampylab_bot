import TelegramBot from 'node-telegram-bot-api';
import { UserModel } from '../database/models/UserModel';
import { EventModel } from '../database/models/EventModel';
import { 
  mainMenuKeyboard,
  botBuilderKeyboard,
  pricingKeyboard,
  helpKeyboard,
  profileKeyboard,
  continueBuilderKeyboard,
  userActionsKeyboard,
} from '../keyboards';
import config from '../config';

const { adminId } = config.bot;

// Обработка callback query
export async function handleCallbackQuery(bot: TelegramBot, query: TelegramBot.CallbackQuery) {
  if (!query.data || !query.from || !query.message) return;

  const chatId = query.message.chat.id;
  const userId = query.from.id;
  const data = query.data;

  // Записываем событие
  await EventModel.create(userId, 'callback_query', { data, chat_id: chatId });

  // === ГЛАВНОЕ МЕНЮ ===
  if (data === 'main_menu') {
    await bot.answerCallbackQuery(query.id);
    await bot.editMessageText('🏠 *Главное меню*\n\nВыберите действие:', {
      chat_id: chatId,
      message_id: query.message.message_id,
      parse_mode: 'Markdown',
      reply_markup: mainMenuKeyboard,
    });
    return;
  }

  // === АДМИН ПАНЕЛЬ - ВСЕ ПОЛЬЗОВАТЕЛИ ===
  if (data === 'admin_users_all') {
    await bot.answerCallbackQuery(query.id);
    
    if (userId !== adminId) {
      await bot.answerCallbackQuery(query.id, { text: '❌ Нет доступа', show_alert: true });
      return;
    }

    const users = await UserModel.findAll();
    
    if (users.length === 0) {
      await bot.sendMessage(chatId, '📭 Пользователей пока нет');
      return;
    }

    const usersList = users.map((u, i) => {
      const username = u.username ? `@${u.username}` : 'нет username';
      return `${i + 1}. ${u.first_name || 'User'} (${username}) - ID: \`${u.telegram_id}\``;
    }).join('\n');

    const message = `👥 *Все пользователи (${users.length})*\n\n${usersList}`;
    
    await bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
    });

    // Для каждого пользователя отправляем сообщение с кнопками действий
    for (const user of users.slice(0, 20)) { // Ограничим 20 для производительности
      const userMessage = `👤 *${user.first_name || 'User'}*
Username: ${user.username ? `@${user.username}` : 'нет'}
ID: \`${user.telegram_id}\`
Статус: ${user.state}
Регистрация: ${new Date(user.created_at).toLocaleString('ru-RU')}`;

      await bot.sendMessage(chatId, userMessage, {
        parse_mode: 'Markdown',
        reply_markup: userActionsKeyboard(user.telegram_id),
      });
    }
    return;
  }

  // === АДМИН - НОВЫЕ ПОЛЬЗОВАТЕЛИ ===
  if (data === 'admin_users_new') {
    await bot.answerCallbackQuery(query.id);
    
    if (userId !== adminId) {
      await bot.answerCallbackQuery(query.id, { text: '❌ Нет доступа', show_alert: true });
      return;
    }

    const newUsers = await UserModel.findNewUsers(24);
    
    if (newUsers.length === 0) {
      await bot.sendMessage(chatId, '📭 За последние 24 часа новых пользователей не было');
      return;
    }

    const usersList = newUsers.map((u, i) => {
      const username = u.username ? `@${u.username}` : 'нет username';
      return `${i + 1}. ${u.first_name || 'User'} (${username}) - ID: \`${u.telegram_id}\``;
    }).join('\n');

    const message = `🆕 *Новые пользователи за 24ч (${newUsers.length})*\n\n${usersList}`;
    
    await bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
    });
    return;
  }

  // === АДМИН - ИСТОРИЯ ДЕЙСТВИЙ ПОЛЬЗОВАТЕЛЯ ===
  if (data.startsWith('admin_user_history_')) {
    await bot.answerCallbackQuery(query.id);
    
    if (userId !== adminId) {
      await bot.answerCallbackQuery(query.id, { text: '❌ Нет доступа', show_alert: true });
      return;
    }

    const targetUserId = parseInt(data.replace('admin_user_history_', ''));
    const events = await EventModel.findByUser(targetUserId, 20);

    if (events.length === 0) {
      await bot.sendMessage(chatId, '📭 У пользователя нет истории действий');
      return;
    }

    const eventsList = events.map((e, i) => {
      return `${i + 1}. *${e.event_type}* - ${new Date(e.created_at).toLocaleString('ru-RU')}`;
    }).join('\n');

    const message = `📊 *История действий пользователя*\n\n${eventsList}`;
    
    await bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[{ text: '🔙 Назад', callback_data: 'admin_users_all' }]],
      },
    });
    return;
  }

  // === АДМИН - СТАТИСТИКА ===
  if (data === 'admin_stats') {
    await bot.answerCallbackQuery(query.id);
    
    if (userId !== adminId) {
      await bot.answerCallbackQuery(query.id, { text: '❌ Нет доступа', show_alert: true });
      return;
    }

    const allUsers = await UserModel.findAll();
    const newUsersToday = await UserModel.findNewUsers(24);
    const allEvents = await EventModel.findByType('start_command', 1000);

    const statsMessage = `📊 *Статистика бота*

👥 *Пользователи:*
• Всего: ${allUsers.length}
• За 24ч: ${newUsersToday.length}

📈 *События:*
• Всего событий: ${allEvents.length}
• Команд /start: ${allEvents.length}

⏰ *Время:* ${new Date().toLocaleString('ru-RU')}`;

    await bot.sendMessage(chatId, statsMessage, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[{ text: '🔙 Назад', callback_data: 'main_menu' }]],
      },
    });
    return;
  }

  // === СБОРЩИК БОТОВ ===
  if (data === 'builder_start' || data === 'builder_continue') {
    await bot.answerCallbackQuery(query.id);
    await bot.editMessageText('🛠 *Конструктор ботов*\n\n*Выберите функции для вашего бота:*\n\n💰 *Базовая стоимость:* $0/мес (Free тариф)\n\nДобавляйте функции и стоимость обновится:', {
      chat_id: chatId,
      message_id: query.message.message_id,
      parse_mode: 'Markdown',
      reply_markup: botBuilderKeyboard,
    });
    return;
  }

  // === КАТАЛОГ ФУНКЦИЙ ===
  if (data.startsWith('feature_')) {
    const featureId = data.replace('feature_', '');
    
    const features: Record<string, { name: string; price: number; desc: string }> = {
      lead_capture: { 
        name: '📝 Сбор заявок', 
        price: 5, 
        desc: 'Сбор контактных данных и заявок от клиентов' 
      },
      faq: { 
        name: '💬 Автоответы (FAQ)', 
        price: 5, 
        desc: 'Автоматические ответы на частые вопросы' 
      },
      booking: { 
        name: '📅 Запись клиентов', 
        price: 7, 
        desc: 'Онлайн-запись на услуги и встречи' 
      },
      google_sheets: { 
        name: '📊 Google Sheets', 
        price: 3, 
        desc: 'Сохранение данных в Google Таблицы' 
      },
      notifications: { 
        name: '🔔 Уведомления', 
        price: 3, 
        desc: 'Мгновенные уведомления владельцу' 
      },
      payments: { 
        name: '💳 Приём оплаты', 
        price: 10, 
        desc: 'Приём платежей через Telegram/Stripe' 
      },
    };

    const feature = features[featureId];
    if (!feature) {
      await bot.answerCallbackQuery(query.id, { text: '❌ Функция не найдена', show_alert: true });
      return;
    }

    await bot.answerCallbackQuery(query.id, { 
      text: `✅ ${feature.name} добавлена!`, 
      show_alert: false 
    });

    // Здесь можно сохранить выбранные функции в БД
    return;
  }

  // === ЗАВЕРШИТЬ ВЫБОР ===
  if (data === 'builder_finish') {
    await bot.answerCallbackQuery(query.id);
    await bot.editMessageText('✅ *Выбор функций завершён!*\n\n🎉 *Ваш бот почти готов!*\n\nТеперь выберите тариф для публикации:', {
      chat_id: chatId,
      message_id: query.message.message_id,
      parse_mode: 'Markdown',
      reply_markup: pricingKeyboard,
    });
    return;
  }

  // === ОТМЕНА СБОРКИ ===
  if (data === 'builder_cancel') {
    await bot.answerCallbackQuery(query.id);
    await bot.editMessageText('❌ *Сборка отменена*\n\nВы можете начать заново в любое время!', {
      chat_id: chatId,
      message_id: query.message.message_id,
      parse_mode: 'Markdown',
      reply_markup: mainMenuKeyboard,
    });
    return;
  }

  // === ТАРИФЫ ===
  if (data.startsWith('tier_')) {
    const tier = data.replace('tier_', '');
    const tiers: Record<string, { name: string; price: string; features: string[] }> = {
      free: { 
        name: 'Free', 
        price: '$0/мес', 
        features: ['1 бот', '2 функции', '100 лидов/мес', 'Базовая поддержка'] 
      },
      basic: { 
        name: 'Basic', 
        price: '$10/мес', 
        features: ['3 бота', '5 функций', '1000 лидов/мес', 'Приоритетная поддержка', 'Google Sheets'] 
      },
      pro: { 
        name: 'Pro', 
        price: '$25/мес', 
        features: ['∞ ботов', '∞ функций', '∞ лидов', 'VIP поддержка', 'Все интеграции', 'API доступ'] 
      },
    };

    const selectedTier = tiers[tier];
    if (!selectedTier) return;

    const featuresList = selectedTier.features.map(f => `• ${f}`).join('\n');

    await bot.answerCallbackQuery(query.id);
    await bot.sendMessage(chatId, `⭐ *Тариф ${selectedTier.name}*\n\n💰 *Цена:* ${selectedTier.price}\n\n*Включает:*\n${featuresList}\n\n🚀 *Готовы активировать?*`, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '💳 Оплатить', callback_data: `pay_${tier}` }],
          [{ text: '🔙 Назад', callback_data: 'main_menu' }],
        ],
      },
    });
    return;
  }

  // === ПОМОЩЬ ===
  if (data === 'help') {
    await bot.answerCallbackQuery(query.id);
    await bot.editMessageText('❓ *Помощь*\n\nСвяжитесь с поддержкой: @your_support', {
      chat_id: chatId,
      message_id: query.message.message_id,
      parse_mode: 'Markdown',
      reply_markup: helpKeyboard,
    });
    return;
  }

  // === ПРОФИЛЬ ===
  if (data === 'profile_stats' || data === 'profile_settings') {
    await bot.answerCallbackQuery(query.id, { text: '⏳ В разработке...', show_alert: true });
    return;
  }
}
