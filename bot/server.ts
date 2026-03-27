import express from 'express';
import TelegramBot from 'node-telegram-bot-api';
import config from './config';
import { handleStart, handleAdmin, handleHelp, handleProfile } from './handlers/commands';
import { handleCallbackQuery } from './handlers/callbacks';
import { handleTextMessage } from './handlers/messages';

const { token } = config.bot;
const { port } = config.server;

// Создаем бота без polling (для webhook режима)
const bot = new TelegramBot(token, { polling: false });

const app = express();

// Middleware для парсинга JSON
app.use(express.json());

// Webhook endpoint
app.post('/webhook', async (req, res) => {
  try {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  } catch (error) {
    console.error('Ошибка обработки webhook:', error);
    res.sendStatus(500);
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Обработчики команд (те же самые)
bot.onText(/\/start/, async (msg) => {
  try {
    await handleStart(bot, msg);
  } catch (error) {
    console.error('Ошибка в /start:', error);
  }
});

bot.onText(/\/admin/, async (msg) => {
  try {
    await handleAdmin(bot, msg);
  } catch (error) {
    console.error('Ошибка в /admin:', error);
  }
});

bot.onText(/\/help/, async (msg) => {
  try {
    await handleHelp(bot, msg);
  } catch (error) {
    console.error('Ошибка в /help:', error);
  }
});

bot.onText(/\/profile/, async (msg) => {
  try {
    await handleProfile(bot, msg);
  } catch (error) {
    console.error('Ошибка в /profile:', error);
  }
});

bot.on('callback_query', async (query) => {
  try {
    await handleCallbackQuery(bot, query);
  } catch (error) {
    console.error('Ошибка в callback query:', error);
  }
});

bot.on('message', async (msg) => {
  try {
    if (msg.text && (msg.text.startsWith('/start') || msg.text.startsWith('/admin') || 
        msg.text.startsWith('/help') || msg.text.startsWith('/profile'))) {
      return;
    }
    if (!msg.text) return;
    await handleTextMessage(bot, msg);
  } catch (error) {
    console.error('Ошибка в текстовом сообщении:', error);
  }
});

// Запуск сервера
app.listen(port, () => {
  console.log(`🚀 Сервер запущен на порту ${port}`);
  console.log(`📡 Webhook endpoint: /webhook`);
  console.log(`❤️ Health check: /health`);
});

export default app;
