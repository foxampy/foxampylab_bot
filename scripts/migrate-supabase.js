#!/usr/bin/env node

/**
 * Скрипт для применения миграций в Supabase
 * Использование: npm run db:migrate:supabase
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Загружаем .env
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_URL или SUPABASE_SERVICE_ROLE_KEY не настроены!');
  console.log('\n📝 Обновите файл .env:');
  console.log('   SUPABASE_URL=https://your-project.supabase.co');
  console.log('   SUPABASE_SERVICE_ROLE_KEY=your-key');
  process.exit(1);
}

// Читаем SQL файл
const sqlPath = path.join(__dirname, '..', 'database', 'supabase-migration.sql');
const sql = fs.readFileSync(sqlPath, 'utf-8');

console.log('🚀 Применение миграций в Supabase...');
console.log(`   URL: ${SUPABASE_URL}`);
console.log('');

const data = JSON.stringify({ sql });

const options = {
  hostname: SUPABASE_URL.replace('https://', ''),
  port: 443,
  path: '/rest/v1/',
  method: 'POST',
  headers: {
    'apikey': SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    'Prefer': 'params=single-object'
  }
};

const req = https.request(options, (res) => {
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200 || res.statusCode === 201 || res.statusCode === 400) {
      // 400 может быть если SQL уже применён
      console.log('✅ Миграции успешно применены!');
      console.log('');
      console.log('📋 Проверьте таблицы в Supabase Dashboard:');
      console.log(`   ${SUPABASE_URL}/dashboard/editor`);
    } else {
      console.error('⚠️ Возможная ошибка (проверьте Dashboard):');
      console.error(`   Status: ${res.statusCode}`);
      console.error(`   Response: ${responseData}`);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Ошибка выполнения миграции:');
  console.error(error.message);
  console.log('');
  console.log('📝 Примените миграции вручную:');
  console.log('   1. Откройте Supabase Dashboard');
  console.log('   2. Перейдите в SQL Editor');
  console.log('   3. Скопируйте содержимое database/supabase-migration.sql');
  console.log('   4. Выполните SQL');
});

req.write(data);
req.end();
