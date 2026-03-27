import { VercelRequest, VercelResponse } from '@vercel/node';
import TelegramBot from 'node-telegram-bot-api';
import config from './config';
import { handleStart, handleAdmin, handleHelp, handleProfile } from './handlers/commands';
import { handleCallbackQuery } from './handlers/callbacks';
import { handleTextMessage } from './handlers/messages';
import { getSupabaseClient } from './database';
import { UserModel } from './database/models/UserModel';
import { EventModel } from './database/models/EventModel';

const { token } = config.bot;
const bot = new TelegramBot(token, { polling: false });

// Webhook handler для Telegram
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, url } = req;

  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Telegram Webhook
    if (url === '/webhook' && method === 'POST') {
      bot.processUpdate(req.body);
      return res.status(200).json({ received: true });
    }

    // Health check
    if (url === '/health' && method === 'GET') {
      return res.status(200).json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      });
    }

    // API: Получить всех пользователей (для админа)
    if (url === '/api/users' && method === 'GET') {
      const { telegramId } = req.query;
      
      // Проверка админа
      if (Number(telegramId) !== config.bot.adminId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const users = await UserModel.findAll();
      return res.status(200).json({ users });
    }

    // API: Получить новых пользователей
    if (url === '/api/users/new' && method === 'GET') {
      const { telegramId, hours } = req.query;
      
      if (Number(telegramId) !== config.bot.adminId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const users = await UserModel.findNewUsers(Number(hours) || 24);
      return res.status(200).json({ users });
    }

    // API: Получить статистику
    if (url === '/api/stats' && method === 'GET') {
      const { telegramId } = req.query;
      
      if (Number(telegramId) !== config.bot.adminId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const allUsers = await UserModel.findAll();
      const newUsers = await UserModel.findNewUsers(24);
      const events = await EventModel.findByType('start_command', 1000);

      return res.status(200).json({
        totalUsers: allUsers.length,
        newUsers24h: newUsers.length,
        totalEvents: events.length,
        timestamp: new Date().toISOString()
      });
    }

    // API: Получить события пользователя
    if (url?.startsWith('/api/events/') && method === 'GET') {
      const { telegramId } = req.query;
      const userId = url.split('/').pop();
      
      if (Number(telegramId) !== config.bot.adminId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const events = await EventModel.findByUser(Number(userId), 50);
      return res.status(200).json({ events });
    }

    // API: Mini App - сохранить выбранные функции
    if (url === '/api/bot-project' && method === 'POST') {
      const { userId, features, tier } = req.body;
      
      // Здесь логика сохранения проекта
      console.log('New bot project:', { userId, features, tier });
      
      return res.status(200).json({ success: true });
    }

    // 404 для остальных путей
    return res.status(404).json({ error: 'Not found' });

  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
