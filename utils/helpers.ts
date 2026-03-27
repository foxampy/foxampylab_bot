// Дополнительные утилиты для бота

import TelegramBot from 'node-telegram-bot-api';

// Форматирование числа в валюту
export function formatPrice(price: number, currency: string = '$'): string {
  return `${currency}${price}`;
}

// Форматирование даты
export function formatDate(date: Date, locale: string = 'ru-RU'): string {
  return date.toLocaleString(locale);
}

// Генерация уникального ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Проверка валидности Telegram ID
export function isValidTelegramId(id: number): boolean {
  return Number.isInteger(id) && id > 0;
}

// Создание кнопки для Mini App
export function createMiniAppButton(
  text: string,
  url: string
): TelegramBot.InlineKeyboardButton {
  return {
    text,
    web_app: { url },
  };
}

// Разбиение длинного сообщения на части
export function splitMessage(text: string, maxLength: number = 4096): string[] {
  const messages: string[] = [];
  let currentMessage = '';

  const lines = text.split('\n');
  for (const line of lines) {
    if ((currentMessage + line + '\n').length > maxLength) {
      messages.push(currentMessage.trim());
      currentMessage = '';
    }
    currentMessage += line + '\n';
  }

  if (currentMessage.trim()) {
    messages.push(currentMessage.trim());
  }

  return messages;
}

// Экранирование Markdown
export function escapeMarkdown(text: string): string {
  const symbols = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'];
  let result = text;
  for (const symbol of symbols) {
    result = result.replace(new RegExp(`\\${symbol}`, 'g'), `\\${symbol}`);
  }
  return result;
}

// Создание упоминания пользователя
export function createUserMention(user: TelegramBot.User): string {
  const name = user.first_name || '';
  return `[${escapeMarkdown(name)}](tg://user?id=${user.id})`;
}
