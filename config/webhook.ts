import TelegramBot from 'node-telegram-bot-api';
import config from './config';

const { token } = config.bot;
const { url: serverUrl } = config.server;

async function setupWebhook() {
  const bot = new TelegramBot(token);
  
  const webhookUrl = `${serverUrl}/webhook`;
  
  try {
    console.log('🔗 Настройка webhook...');
    console.log(`URL: ${webhookUrl}`);
    
    // Удаляем polling если есть
    await bot.deleteWebHook();
    
    // Устанавливаем webhook
    const result = await bot.setWebHook(webhookUrl);
    
    if (result) {
      console.log('✅ Webhook успешно настроен!');
      
      // Получаем информацию о webhook
      const info = await bot.getWebHookInfo();
      console.log('📋 Информация о webhook:');
      console.log(`  URL: ${info.url}`);
      console.log(`  Has custom certificate: ${info.has_custom_certificate}`);
      console.log(`  Pending update count: ${info.pending_update_count}`);
    } else {
      console.error('❌ Ошибка настройки webhook');
    }
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

setupWebhook();
