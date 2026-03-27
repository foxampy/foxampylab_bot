import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Rocket, BarChart3, Settings, User, Briefcase, Calendar, CheckCircle } from 'lucide-react';
import './styles/global.css';

// ============================================
// ТИПЫ ДАННЫХ
// ============================================
interface Service {
  id: string;
  name: string;
  nameEn: string;
  category: 'bot' | 'app' | 'website' | 'crm';
  priceFrom: number;
  priceTo: number;
  durationDays: number;
  description: string;
  descriptionEn: string;
  icon: string;
  features: string[];
}

interface Feature {
  id: string;
  name: string;
  nameEn: string;
  price: number;
  description: string;
  descriptionEn: string;
  icon: string;
}

// ============================================
// ДАННЫЕ - УСЛУГИ
// ============================================
const services: Service[] = [
  {
    id: 'telegram_bot',
    name: 'Telegram бот',
    nameEn: 'Telegram Bot',
    category: 'bot',
    priceFrom: 100,
    priceTo: 1500,
    durationDays: 7,
    description: 'Бот для бизнеса, продаж или автоматизации',
    descriptionEn: 'Bot for business, sales or automation',
    icon: '🤖',
    features: ['Автоматизация', '24/7 работа', 'Интеграции', 'Админ-панель'],
  },
  {
    id: 'mobile_app',
    name: 'Мобильное приложение',
    nameEn: 'Mobile App',
    category: 'app',
    priceFrom: 2000,
    priceTo: 10000,
    durationDays: 45,
    description: 'iOS и Android приложение для вашего бизнеса',
    descriptionEn: 'iOS and Android app for your business',
    icon: '📱',
    features: ['iOS + Android', 'Дизайн', 'Backend', 'Публикация'],
  },
  {
    id: 'website',
    name: 'Веб-сайт',
    nameEn: 'Website',
    category: 'website',
    priceFrom: 300,
    priceTo: 5000,
    durationDays: 14,
    description: 'Лендинг или корпоративный сайт',
    descriptionEn: 'Landing page or corporate website',
    icon: '🌐',
    features: ['Адаптивный дизайн', 'SEO', 'CMS', 'Формы заявок'],
  },
  {
    id: 'crm',
    name: 'CRM система',
    nameEn: 'CRM System',
    category: 'crm',
    priceFrom: 1500,
    priceTo: 8000,
    durationDays: 30,
    description: 'Система управления клиентами и продажами',
    descriptionEn: 'Customer and sales management system',
    icon: '⚙️',
    features: ['Учёт клиентов', 'Воронки', 'Отчёты', 'Интеграции'],
  },
];

// ============================================
// ДАННЫЕ - ФУНКЦИИ ДЛЯ БОТОВ
// ============================================
const features: Feature[] = [
  { id: 'lead_capture', name: 'Сбор заявок', nameEn: 'Lead Capture', price: 5, description: 'Сбор заявок 24/7', descriptionEn: 'Collect leads 24/7', icon: '📝' },
  { id: 'faq', name: 'Автоответы', nameEn: 'Auto Answers', price: 5, description: 'Ответы на вопросы', descriptionEn: 'FAQ answers', icon: '💬' },
  { id: 'booking', name: 'Запись клиентов', nameEn: 'Booking', price: 7, description: 'Онлайн-запись', descriptionEn: 'Online booking', icon: '📅' },
  { id: 'google_sheets', name: 'Google Sheets', nameEn: 'Google Sheets', price: 3, description: 'Сохранение в таблицы', descriptionEn: 'Save to sheets', icon: '📊' },
  { id: 'notifications', name: 'Уведомления', nameEn: 'Notifications', price: 3, description: 'Мгновенные уведомления', descriptionEn: 'Instant notifications', icon: '🔔' },
  { id: 'payments', name: 'Приём оплаты', nameEn: 'Payments', price: 10, description: 'Платежи в Telegram', descriptionEn: 'Telegram payments', icon: '💳' },
];

// ============================================
// КОМПОНЕНТЫ
// ============================================

// Карточка услуги
function ServiceCard({ service, onSelect }: { service: Service; onSelect: (s: Service) => void }) {
  const isRussian = true;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      onClick={() => onSelect(service)}
      className="card cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-4xl">{service.icon}</span>
        <div className="badge badge-accent">
          ${service.priceFrom}-${service.priceTo}
        </div>
      </div>
      
      <h3 className="text-lg font-mono text-white mb-2">
        {isRussian ? service.name : service.nameEn}
      </h3>
      <p className="text-sm text-secondary mb-3">
        {isRussian ? service.description : service.descriptionEn}
      </p>
      
      <div className="flex flex-wrap gap-2 mb-3">
        {service.features.slice(0, 3).map((f, i) => (
          <span key={i} className="text-[10px] font-mono text-accent border border-accent/30 px-2 py-1 rounded">
            {f}
          </span>
        ))}
      </div>
      
      <div className="text-xs text-muted font-mono">
        ⏱️ {service.durationDays} {isRussian ? 'дней' : 'days'}
      </div>
    </motion.div>
  );
}

// Карточка функции
function FeatureCard({ 
  feature, 
  selected, 
  onToggle 
}: { 
  feature: Feature; 
  selected: boolean; 
  onToggle: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onToggle(feature.id)}
      className={`card cursor-pointer ${selected ? 'border-accent' : ''}`}
      style={{
        borderColor: selected ? 'var(--color-accent)' : undefined,
        boxShadow: selected ? 'var(--shadow-glow)' : undefined,
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl">{feature.icon}</span>
        <div className={`badge ${selected ? 'badge-accent' : ''}`}>
          ${feature.price}/мес
        </div>
      </div>
      
      <h3 className="text-lg font-mono text-white mb-2">{feature.name}</h3>
      <p className="text-sm text-secondary">{feature.description}</p>
      
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-3 right-3 w-6 h-6 bg-accent rounded-full flex items-center justify-center text-black font-bold"
        >
          ✓
        </motion.div>
      )}
    </motion.div>
  );
}

// Экран онбординга (воронка)
function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  
  const steps = [
    {
      title: '👋 Привет!',
      subtitle: 'Добро пожаловать в Foxampy',
      description: 'Создаем цифровые решения для бизнеса с 2020 года',
      icon: '🚀',
    },
    {
      title: '🎯 Что мы предлагаем?',
      subtitle: 'Полный цикл разработки',
      description: 'От идеи до запуска и поддержки',
      icon: '💼',
    },
    {
      title: '📊 Наш опыт',
      subtitle: '50+ успешных проектов',
      description: 'Боты, приложения, сайты, CRM для бизнеса',
      icon: '⭐',
    },
    {
      title: '🎉 Готовы начать?',
      subtitle: 'Выберите услугу',
      description: 'Или запишитесь на бесплатную консультацию',
      icon: '✅',
    },
  ];
  
  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="text-center py-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-8xl mb-6"
        >
          {steps[step].icon}
        </motion.div>
        
        <h2 className="text-2xl font-mono text-white mb-2">
          {steps[step].title}
        </h2>
        <h3 className="text-lg text-accent mb-4">
          {steps[step].subtitle}
        </h3>
        <p className="text-secondary">
          {steps[step].description}
        </p>
      </div>
      
      {/* Прогресс */}
      <div className="progress-bar mb-6">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${((step + 1) / steps.length) * 100}%` }}
        />
      </div>
      
      {/* Кнопки */}
      <div className="space-y-3">
        <button onClick={handleNext} className="btn btn-primary btn-block">
          {step < steps.length - 1 ? 'Далее →' : 'Начать →'}
        </button>
        
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="btn btn-block">
            ← Назад
          </button>
        )}
      </div>
    </motion.div>
  );
}

// Экран услуг
function ServicesScreen({ onSelectService }: { onSelectService: (s: Service) => void }) {
  const [filter, setFilter] = useState<'all' | 'bot' | 'app' | 'website' | 'crm'>('all');
  
  const filteredServices = filter === 'all' 
    ? services 
    : services.filter(s => s.category === filter);
  
  return (
    <div className="space-y-6">
      {/* Фильтры */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'all', label: 'Все', icon: '📋' },
          { id: 'bot', label: 'Боты', icon: '🤖' },
          { id: 'app', label: 'Приложения', icon: '📱' },
          { id: 'website', label: 'Сайты', icon: '🌐' },
          { id: 'crm', label: 'CRM', icon: '⚙️' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id as any)}
            className={`btn whitespace-nowrap ${filter === item.id ? 'btn-primary' : ''}`}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </div>
      
      {/* Сетка услуг */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredServices.map(service => (
          <ServiceCard
            key={service.id}
            service={service}
            onSelect={onSelectService}
          />
        ))}
      </div>
    </div>
  );
}

// Экран конструктора ботов
function BotBuilderScreen() {
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  
  const toggleFeature = (id: string) => {
    setSelectedFeatures(prev =>
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };
  
  const totalPrice = selectedFeatures.reduce((sum, id) => {
    const f = features.find(feat => feat.id === id);
    return sum + (f?.price || 0);
  }, 0);
  
  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-mono text-white mb-4">🛠 Конструктор бота</h3>
        <p className="text-sm text-secondary mb-4">
          Выберите функции для вашего бота. Базовая версия бесплатна!
        </p>
        
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {features.map(feature => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              selected={selectedFeatures.includes(feature.id)}
              onToggle={toggleFeature}
            />
          ))}
        </div>
        
        <div className="flex justify-between items-center pt-4 border-t border-white/10">
          <span className="text-mono text-muted">Итого:</span>
          <span className="text-2xl font-mono text-accent">${totalPrice}/мес</span>
        </div>
      </div>
      
      <button className="btn btn-primary btn-block">
        <CheckCircle size={18} />
        Оформить заказ
      </button>
    </div>
  );
}

// Экран аккаунта
function AccountScreen() {
  const tg = (window as any).TelegramWebApp;
  const user = tg?.initDataUnsafe?.user;
  
  return (
    <div className="space-y-6">
      {/* Профиль */}
      <div className="card text-center">
        <div className="w-20 h-20 rounded-full bg-accent/20 mx-auto mb-4 flex items-center justify-center text-3xl">
          {user?.first_name?.[0] || '👤'}
        </div>
        
        <h3 className="text-xl font-mono text-white mb-1">
          {user ? `${user.first_name || ''} ${user.last_name || ''}` : 'Гость'}
        </h3>
        <p className="text-secondary text-sm mb-4">
          {user?.username ? `@${user.username}` : 'Нет username'}
        </p>
        
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
          <div>
            <div className="text-2xl font-mono text-accent">0</div>
            <div className="text-[10px] text-muted">Заказов</div>
          </div>
          <div>
            <div className="text-2xl font-mono text-accent">0</div>
            <div className="text-[10px] text-muted">Записей</div>
          </div>
          <div>
            <div className="text-2xl font-mono text-accent">$0</div>
            <div className="text-[10px] text-muted">Потрачено</div>
          </div>
        </div>
      </div>
      
      {/* Меню аккаунта */}
      <div className="space-y-2">
        <button className="btn btn-block justify-start">
          <BarChart3 size={18} />
          Моя статистика
        </button>
        <button className="btn btn-block justify-start">
          <Briefcase size={18} />
          Мои заказы
        </button>
        <button className="btn btn-block justify-start">
          <Calendar size={18} />
          Мои записи
        </button>
        <button className="btn btn-block justify-start">
          <Settings size={18} />
          Настройки
        </button>
      </div>
    </div>
  );
}

// ============================================
// ГЛАВНЫЙ КОМПОНЕНТ
// ============================================
function App() {
  const [currentScreen, setCurrentScreen] = useState<'onboarding' | 'services' | 'builder' | 'account' | 'booking'>('onboarding');
  const [language, setLanguage] = useState<'ru' | 'en'>('ru');
  
  // Telegram WebApp инициализация
  useEffect(() => {
    const tg = (window as any).TelegramWebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      
      if (tg.colorScheme === 'light') {
        document.documentElement.classList.add('theme-light');
      }
      
      const user = tg.initDataUnsafe?.user;
      console.log('Telegram user:', user);
    }
  }, []);
  
  const handleSelectService = (service: Service) => {
    // Можно открыть детали услуги или форму заказа
    alert(`Выбрана услуга: ${service.name}\nЦена: $${service.priceFrom}-${service.priceTo}\nСрок: ${service.durationDays} дней`);
  };
  
  const isRussian = language !== 'en';
  
  // Навигация
  const navItems = [
    { id: 'services', label: isRussian ? 'Услуги' : 'Services', icon: Briefcase },
    { id: 'builder', label: isRussian ? 'Конструктор' : 'Builder', icon: Rocket },
    { id: 'booking', label: isRussian ? 'Запись' : 'Booking', icon: Calendar },
    { id: 'account', label: isRussian ? 'Аккаунт' : 'Account', icon: User },
  ];
  
  return (
    <div className="relative min-h-screen">
      {/* Фон */}
      <div className="app-background" />
      
      {/* Контент */}
      <main className="relative z-10 px-4 py-8 pb-24">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-mono text-white">
              🚀 Foxampy
            </h1>
            <p className="text-sm text-secondary">
              {isRussian ? 'Цифровые решения' : 'Digital Solutions'}
            </p>
          </div>
          
          <button
            onClick={() => setLanguage(isRussian ? 'en' : 'ru')}
            className="btn"
          >
            {isRussian ? 'EN' : 'RU'}
          </button>
        </motion.header>
        
        {/* Экраны */}
        {currentScreen === 'onboarding' && (
          <OnboardingScreen onComplete={() => setCurrentScreen('services')} />
        )}
        
        {currentScreen === 'services' && (
          <ServicesScreen onSelectService={handleSelectService} />
        )}
        
        {currentScreen === 'builder' && <BotBuilderScreen />}
        
        {currentScreen === 'account' && <AccountScreen />}
        
        {currentScreen === 'booking' && (
          <div className="text-center py-12">
            <Calendar size={48} className="mx-auto mb-4 text-accent" />
            <h2 className="text-xl font-mono text-white mb-2">📅 Запись на консультацию</h2>
            <p className="text-secondary mb-6">
              Выберите дату и время для бесплатной консультации
            </p>
            <button className="btn btn-primary">
              Открыть календарь
            </button>
          </div>
        )}
      </main>
      
      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-white/10 bg-black/80 backdrop-blur-md">
        <div className="flex items-center justify-around py-3">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentScreen(item.id as any)}
              className={`flex flex-col items-center gap-1 ${
                currentScreen === item.id ? 'text-accent' : 'text-muted'
              }`}
            >
              <item.icon size={20} />
              <span className="text-[10px] font-mono">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default App;
