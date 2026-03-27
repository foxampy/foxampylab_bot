import { InlineKeyboardMarkup, ReplyKeyboardMarkup } from 'node-telegram-bot-api';
import config from '../config';

const { miniApp } = config;

// ============================================
// ГЛАВНОЕ МЕНЮ
// ============================================
export const mainMenuKeyboard: ReplyKeyboardMarkup = {
  resize_keyboard: true,
  one_time_keyboard: false,
  keyboard: [
    [
      { text: '🚀 Собрать бота' },
      { text: '📋 Услуги и цены' },
    ],
    [
      { text: '🎨 Конструктор (App)' },
      { text: '📅 Записаться' },
    ],
    [
      { text: '📖 Портфолио' },
      { text: '👤 Мой аккаунт' },
    ],
  ],
};

// ============================================
// МЕНЮ УСЛУГ
// ============================================
export const servicesKeyboard: InlineKeyboardMarkup = {
  inline_keyboard: [
    [
      { text: '🤖 Telegram бот', callback_data: 'service_telegram_bot' },
    ],
    [
      { text: '📱 Мобильное приложение', callback_data: 'service_mobile_app' },
    ],
    [
      { text: '🌐 Веб-сайт', callback_data: 'service_website' },
    ],
    [
      { text: '⚙️ CRM система', callback_data: 'service_crm' },
    ],
    [
      { text: '🔙 Назад', callback_data: 'main_menu' },
    ],
  ],
};

// ============================================
// КАТАЛОГ УСЛУГ - TELEGRAM БОТ
// ============================================
export const telegramBotServicesKeyboard: InlineKeyboardMarkup = {
  inline_keyboard: [
    [
      { text: '💼 Бот-визитка', callback_data: 'bot_visitka' },
    ],
    [
      { text: '🛒 Интернет-магазин', callback_data: 'bot_shop' },
    ],
    [
      { text: '📅 Бот для записи', callback_data: 'bot_booking' },
    ],
    [
      { text: '🎓 Образовательный бот', callback_data: 'bot_education' },
    ],
    [
      { text: '🏢 Бот для бизнеса', callback_data: 'bot_business' },
    ],
    [
      { text: '🎮 Игра в Telegram', callback_data: 'bot_game' },
    ],
    [
      { text: '🔙 Назад к услугам', callback_data: 'service_catalog' },
    ],
  ],
};

// ============================================
// КАЛЕНДАРЬ ЗАПИСИ
// ============================================
export function createCalendarKeyboard(date: Date): InlineKeyboardMarkup {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay() || 7; // Пн=1, Вс=7
  
  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];
  
  const rows: any[] = [];
  
  // Заголовок с месяцем
  rows.push([
    { 
      text: '◀️', 
      callback_data: `cal_prev_${year}_${month}` 
    },
    { 
      text: `${monthNames[month]} ${year}`, 
      callback_data: 'cal_noop' 
    },
    { 
      text: '▶️', 
      callback_data: `cal_next_${year}_${month}` 
    },
  ]);
  
  // Дни недели
  rows.push([
    { text: 'Пн', callback_data: 'cal_noop' },
    { text: 'Вт', callback_data: 'cal_noop' },
    { text: 'Ср', callback_data: 'cal_noop' },
    { text: 'Чт', callback_data: 'cal_noop' },
    { text: 'Пт', callback_data: 'cal_noop' },
    { text: 'Сб', callback_data: 'cal_noop' },
    { text: 'Вс', callback_data: 'cal_noop' },
  ]);
  
  // Дни месяца
  const dayRows: any[] = [];
  let dayRow: any[] = [];
  
  // Пустые ячейки до первого дня
  for (let i = 1; i < startDay; i++) {
    dayRow.push({ text: ' ', callback_data: 'cal_empty' });
  }
  
  // Дни
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const currentDate = new Date(year, month, day);
    const dayOfWeek = currentDate.getDay();
    const isToday = new Date().toDateString() === currentDate.toDateString();
    const isPast = currentDate < new Date(new Date().setHours(0, 0, 0, 0));
    
    let text = day.toString();
    let callbackData = `cal_select_${year}_${month}_${day}`;
    
    if (isToday) {
      text = `${day}*`;
    }
    
    if (isPast || dayOfWeek === 0) { // Прошедшие дни и воскресенья
      callbackData = 'cal_unavailable';
      text = day.toString();
    }
    
    dayRow.push({ text, callback_data: callbackData });
    
    if (dayRow.length === 7 || day === lastDay.getDate()) {
      dayRows.push(dayRow);
      dayRow = [];
    }
  }
  
  rows.push(...dayRows);
  
  // Кнопки времени и назад
  rows.push([
    { text: '🕐 Выбрать время', callback_data: 'cal_time_select' },
  ]);
  
  rows.push([
    { text: '🔙 Назад', callback_data: 'service_booking' },
  ]);
  
  return { inline_keyboard: rows };
}

// ============================================
// ВРЕМЯ ЗАПИСИ (10:00 - 22:00)
// ============================================
export function createTimeSlotsKeyboard(date: Date): InlineKeyboardMarkup {
  const rows: any[] = [];
  const timeSlots: string[] = [];
  
  // Генерируем слоты с 10:00 до 22:00
  for (let hour = 10; hour <= 22; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour !== 22) {
      timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }
  
  // Создаём кнопки по 4 в ряд
  let row: any[] = [];
  for (const time of timeSlots) {
    row.push({ 
      text: time, 
      callback_data: `time_${time.replace(':', '')}` 
    });
    if (row.length === 4) {
      rows.push(row);
      row = [];
    }
  }
  if (row.length > 0) {
    rows.push(row);
  }
  
  rows.push([
    { text: '🔙 Назад к календарю', callback_data: 'cal_back' },
  ]);
  
  return { inline_keyboard: rows };
}

// ============================================
// ПОРТФОЛИО
// ============================================
export const portfolioKeyboard: InlineKeyboardMarkup = {
  inline_keyboard: [
    [
      { text: '🤖 Telegram боты', callback_data: 'portfolio_bots' },
    ],
    [
      { text: '📱 Мобильные приложения', callback_data: 'portfolio_apps' },
    ],
    [
      { text: '🌐 Веб-сайты', callback_data: 'portfolio_websites' },
    ],
    [
      { text: '⚙️ CRM системы', callback_data: 'portfolio_crm' },
    ],
    [
      { text: '🔙 Назад', callback_data: 'main_menu' },
    ],
  ],
};

// ============================================
// АККАУНТ
// ============================================
export const accountKeyboard: InlineKeyboardMarkup = {
  inline_keyboard: [
    [
      { text: '📊 Моя статистика', callback_data: 'account_stats' },
    ],
    [
      { text: '📋 Мои заказы', callback_data: 'account_orders' },
    ],
    [
      { text: '📅 Мои записи', callback_data: 'account_appointments' },
    ],
    [
      { text: '⚙️ Настройки', callback_data: 'account_settings' },
    ],
    [
      { text: '🔙 В главное меню', callback_data: 'main_menu' },
    ],
  ],
};

// ============================================
// АДМИН ПАНЕЛЬ
// ============================================
export const adminKeyboard: InlineKeyboardMarkup = {
  inline_keyboard: [
    [
      { text: '👥 Все пользователи', callback_data: 'admin_users_all' },
    ],
    [
      { text: '🆕 Новые пользователи (24ч)', callback_data: 'admin_users_new' },
    ],
    [
      { text: '📊 Статистика', callback_data: 'admin_stats' },
    ],
    [
      { text: '📋 Заказы', callback_data: 'admin_orders' },
    ],
    [
      { text: '📅 Записи', callback_data: 'admin_appointments' },
    ],
  ],
};

// ============================================
// ПРОЧЕЕ
// ============================================
export const backKeyboard: InlineKeyboardMarkup = {
  inline_keyboard: [
    [
      { text: '🔙 Назад', callback_data: 'main_menu' },
    ],
  ],
};

export const pricingKeyboard: InlineKeyboardMarkup = {
  inline_keyboard: [
    [
      { text: '🆓 Free - $0', callback_data: 'tier_free' },
    ],
    [
      { text: '⭐ Basic - $10/мес', callback_data: 'tier_basic' },
    ],
    [
      { text: '🚀 Pro - $25/мес', callback_data: 'tier_pro' },
    ],
    [
      { text: '💼 Индивидуальный заказ', callback_data: 'custom_order' },
    ],
  ],
};
