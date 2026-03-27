#!/usr/bin/env node

/**
 * Скрипт для быстрой настройки webhook на Vercel
 * Использование: npm run setup:vercel-webhook
 */

const https = require('https');

// Конфигурация
const BOT_TOKEN = process.env.BOT_TOKEN || '8769862933:AAGKIxjwY2ahRSqRol-t8SXZ8Sr5x_X-vgg';
const VERCEL_URL = process.env.VERCEL_URL; // Автоматически из Vercel

if (!VERCEL_URL) {
  console.error('❌ VERCEL_URL не найден!');
  console.log('\n📝 Запустите команду:');
  console.log('   vercel --name');
  console.log('\nИли установите переменную вручную:');
  console.log('   vercel env add VERCEL_URL https://your-project.vercel.app');
  process.exit(1);
}

const webhookUrl = `https://${VERCEL_URL}/webhook`;

console.log('🔗 Настройка Telegram Webhook...');
console.log(`   URL: ${webhookUrl}`);
console.log(`   Token: ${BOT_TOKEN.substring(0, 15)}...`);
console.log('');

const url = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${encodeURIComponent(webhookUrl)}`;

https.get(url, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      if (response.ok) {
        console.log('✅ Webhook успешно настроен!');
        console.log('');
        console.log('📋 Информация:');
        console.log(`   URL: ${response.result.url}`);
        console.log(`   Has custom certificate: ${response.result.has_custom_certificate}`);
        console.log(`   Max connections: ${response.result.max_connections}`);
        console.log('');
        console.log('🎉 Бот готов к работе!');
      } else {
        console.error('❌ Ошибка настройки webhook:');
        console.error(response.description || response);
      }
    } catch (error) {
      console.error('❌ Ошибка парсинга ответа:');
      console.error(error.message);
      console.error('Raw response:', data);
    }
  });
}).on('error', (error) => {
  console.error('❌ Ошибка запроса:');
  console.error(error.message);
});

// Также проверим текущий статус webhook
setTimeout(() => {
  console.log('\n📊 Проверка текущего webhook...');
  
  const infoUrl = `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`;
  
  https.get(infoUrl, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        
        if (response.ok) {
          console.log('');
          console.log('📋 Текущая информация:');
          console.log(`   URL: ${response.result.url || 'не установлен'}`);
          console.log(`   Pending updates: ${response.result.pending_update_count}`);
          console.log(`   Last error: ${response.result.last_error_message || 'нет'}`);
        }
      } catch (e) {
        // Игнорируем ошибки для этой проверки
      }
    });
  }).on('error', () => {
    // Игнорируем ошибки для этой проверки
  });
}, 2000);
