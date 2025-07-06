-- Создание полной структуры базы данных для инвестиционной платформы

-- Удаляем существующие таблицы если есть
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS investments CASCADE;
DROP TABLE IF EXISTS investment_plans CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS hero_settings CASCADE;
DROP TABLE IF EXISTS testimonials CASCADE;
DROP TABLE IF EXISTS project_launches CASCADE;
DROP TABLE IF EXISTS payment_settings CASCADE;
DROP TABLE IF EXISTS profit_settings CASCADE;

-- Создание таблицы ролей пользователей
CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Вставляем роли
INSERT INTO user_roles (id, name, description) VALUES 
(1, 'admin', 'Администратор системы'),
(2, 'moderator', 'Модератор'),
(3, 'user', 'Обычный пользователь');

-- Создание таблицы пользователей
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    country VARCHAR(10) DEFAULT 'RU',
    balance DECIMAL(15,2) DEFAULT 0.00,
    total_invested DECIMAL(15,2) DEFAULT 0.00,
    total_earned DECIMAL(15,2) DEFAULT 0.00,
    referral_code VARCHAR(20) UNIQUE,
    referred_by UUID REFERENCES users(id),
    role_id INTEGER DEFAULT 3 REFERENCES user_roles(id),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Создание индексов для пользователей
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Создание таблицы инвестиционных планов
CREATE TABLE investment_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    min_amount DECIMAL(15,2) NOT NULL,
    max_amount DECIMAL(15,2) NOT NULL,
    daily_percent DECIMAL(5,2) NOT NULL,
    duration_days INTEGER NOT NULL,
    total_return DECIMAL(5,2) NOT NULL,
    features JSONB,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Вставляем планы инвестирования
INSERT INTO investment_plans (name, description, min_amount, max_amount, daily_percent, duration_days, total_return, features, sort_order) VALUES 
('Стартовый', 'Идеальный план для начинающих инвесторов', 100.00, 999.99, 1.2, 30, 136.0, '["Ежедневные выплаты", "Минимальный риск", "Поддержка 24/7"]', 1),
('Стандарт', 'Оптимальное соотношение доходности и риска', 1000.00, 4999.99, 1.8, 45, 181.0, '["Ежедневные выплаты", "Персональный менеджер", "Приоритетная поддержка"]', 2),
('Премиум', 'Для опытных инвесторов с высокой доходностью', 5000.00, 19999.99, 2.5, 60, 250.0, '["Максимальная доходность", "VIP поддержка", "Эксклюзивная аналитика"]', 3),
('VIP', 'Элитный план с максимальными возможностями', 20000.00, 100000.00, 3.2, 90, 388.0, '["Высшая доходность", "Персональный консультант", "Приоритетные инвестиции"]', 4);

-- Создание таблицы инвестиций
CREATE TABLE investments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id INTEGER NOT NULL REFERENCES investment_plans(id),
    amount DECIMAL(15,2) NOT NULL,
    daily_profit DECIMAL(15,2) NOT NULL,
    total_profit DECIMAL(15,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    start_date TIMESTAMP DEFAULT NOW(),
    end_date TIMESTAMP NOT NULL,
    last_profit_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Создание индексов для инвестиций
CREATE INDEX idx_investments_user_id ON investments(user_id);
CREATE INDEX idx_investments_status ON investments(status);
CREATE INDEX idx_investments_end_date ON investments(end_date);

-- Создание таблицы транзакций
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    investment_id UUID REFERENCES investments(id),
    plan_id INTEGER REFERENCES investment_plans(id),
    type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'investment', 'profit', 'referral', 'bonus')),
    amount DECIMAL(15,2) NOT NULL,
    fee DECIMAL(15,2) DEFAULT 0.00,
    final_amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    method VARCHAR(50),
    payment_details JSONB,
    description TEXT,
    admin_note TEXT,
    processed_by UUID REFERENCES users(id),
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Создание индексов для транзакций
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- Создание таблицы настроек героя
CREATE TABLE hero_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    enabled BOOLEAN DEFAULT true,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    badge_text VARCHAR(255),
    button1_text VARCHAR(100),
    button1_link VARCHAR(255),
    button2_text VARCHAR(100),
    button2_link VARCHAR(255),
    show_buttons BOOLEAN DEFAULT true,
    background_animation BOOLEAN DEFAULT true,
    show_stats BOOLEAN DEFAULT true,
    stats_users VARCHAR(50),
    stats_users_label VARCHAR(100),
    stats_invested VARCHAR(50),
    stats_invested_label VARCHAR(100),
    stats_return VARCHAR(50),
    stats_return_label VARCHAR(100),
    stats_reliability VARCHAR(50),
    stats_reliability_label VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Вставляем настройки героя по умолчанию
INSERT INTO hero_settings (
    title, subtitle, badge_text, button1_text, button1_link, button2_text, button2_link,
    stats_users, stats_users_label, stats_invested, stats_invested_label,
    stats_return, stats_return_label, stats_reliability, stats_reliability_label
) VALUES (
    'Инвестируйте с умом, получайте стабильный доход',
    'Профессиональная инвестиционная платформа с ежедневными выплатами, высокой доходностью и гарантированной безопасностью',
    'Платформа работает с 2025 года',
    'Начать инвестировать',
    '/register',
    'Войти в систему',
    '/login',
    '15K+',
    'Активных инвесторов',
    '$2.8M',
    'Общие инвестиции',
    '24.8%',
    'Средняя доходность',
    '99.9%',
    'Надежность'
);

-- Создание таблицы отзывов
CREATE TABLE testimonials (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    avatar VARCHAR(500),
    rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    text TEXT NOT NULL,
    position VARCHAR(255),
    company VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Вставляем отзывы
INSERT INTO testimonials (name, rating, text, position, company, sort_order) VALUES 
('Александр Петров', 5, 'Отличная платформа! Инвестирую уже полгода, выплаты приходят точно в срок. Доходность соответствует заявленной.', 'Предприниматель', 'ООО "ТехИнвест"', 1),
('Мария Иванова', 5, 'Очень довольна сервисом. Удобный интерфейс, быстрая поддержка. Рекомендую всем своим знакомым.', 'Финансовый консультант', 'Банк "Развитие"', 2),
('Дмитрий Сидоров', 4, 'Стабильная платформа с хорошей доходностью. Единственное - хотелось бы больше аналитических инструментов.', 'Инвестор', 'Частное лицо', 3);

-- Создание таблицы запусков проектов
CREATE TABLE project_launches (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    target_amount DECIMAL(15,2) NOT NULL,
    current_amount DECIMAL(15,2) DEFAULT 0.00,
    min_investment DECIMAL(15,2) NOT NULL,
    expected_return DECIMAL(5,2) NOT NULL,
    duration_months INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    image_url VARCHAR(500),
    features JSONB,
    risk_level VARCHAR(20) DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high')),
    category VARCHAR(100),
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Вставляем проекты
INSERT INTO project_launches (title, description, target_amount, min_investment, expected_return, duration_months, start_date, end_date, risk_level, category, is_featured, sort_order) VALUES 
('Зеленая энергетика', 'Инвестиции в солнечные электростанции и ветряные парки', 500000.00, 1000.00, 18.5, 24, NOW(), NOW() + INTERVAL '30 days', 'medium', 'Энергетика', true, 1),
('Технологический стартап', 'Разработка инновационного ПО для финтех индустрии', 250000.00, 500.00, 25.0, 18, NOW(), NOW() + INTERVAL '45 days', 'high', 'Технологии', true, 2),
('Недвижимость Москвы', 'Строительство жилого комплекса в центре Москвы', 1000000.00, 5000.00, 15.2, 36, NOW(), NOW() + INTERVAL '60 days', 'low', 'Недвижимость', false, 3);

-- Создание таблицы настроек платежей
CREATE TABLE payment_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    min_deposit DECIMAL(15,2) DEFAULT 10.00,
    max_deposit DECIMAL(15,2) DEFAULT 100000.00,
    min_withdrawal DECIMAL(15,2) DEFAULT 10.00,
    max_withdrawal DECIMAL(15,2) DEFAULT 50000.00,
    withdrawal_fee_percent DECIMAL(5,2) DEFAULT 2.00,
    withdrawal_fee_fixed DECIMAL(15,2) DEFAULT 0.00,
    auto_withdrawal BOOLEAN DEFAULT false,
    payment_methods JSONB DEFAULT '["bank_card", "crypto", "bank_transfer", "e_wallet"]',
    processing_time_hours INTEGER DEFAULT 24,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Вставляем настройки платежей
INSERT INTO payment_settings DEFAULT VALUES;

-- Создание таблицы настроек прибыли
CREATE TABLE profit_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    auto_reinvest BOOLEAN DEFAULT false,
    profit_calculation_time TIME DEFAULT '00:00:00',
    weekend_payments BOOLEAN DEFAULT true,
    holiday_payments BOOLEAN DEFAULT true,
    compound_interest BOOLEAN DEFAULT false,
    max_daily_profit DECIMAL(15,2) DEFAULT 10000.00,
    profit_distribution_method VARCHAR(20) DEFAULT 'daily' CHECK (profit_distribution_method IN ('daily', 'weekly', 'monthly')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Вставляем настройки прибыли
INSERT INTO profit_settings DEFAULT VALUES;

-- Создание демо пользователей
INSERT INTO users (email, password_hash, full_name, phone, country, balance, total_invested, total_earned, role_id) VALUES 
('admin@invest2025.com', '$2b$10$rQZ8kHWKz5.lQjWJW5.lQjWJW5.lQjWJW5.lQjWJW5.lQjWJW5.lQj', 'Администратор', '+7 (999) 123-45-67', 'RU', 0.00, 0.00, 0.00, 1),
('user@example.com', '$2b$10$rQZ8kHWKz5.lQjWJW5.lQjWJW5.lQjWJW5.lQjWJW5.lQjWJW5.lQj', 'Тестовый Пользователь', '+7 (999) 987-65-43', 'RU', 1500.00, 5000.00, 750.00, 3),
('investor@example.com', '$2b$10$rQZ8kHWKz5.lQjWJW5.lQjWJW5.lQjWJW5.lQjWJW5.lQjWJW5.lQj', 'Активный Инвестор', '+7 (999) 555-12-34', 'RU', 2500.00, 15000.00, 2250.00, 3);

-- Создание демо инвестиций
INSERT INTO investments (user_id, plan_id, amount, daily_profit, end_date) 
SELECT 
    u.id, 
    2, 
    2000.00, 
    36.00, 
    NOW() + INTERVAL '45 days'
FROM users u WHERE u.email = 'user@example.com';

INSERT INTO investments (user_id, plan_id, amount, daily_profit, end_date) 
SELECT 
    u.id, 
    3, 
    8000.00, 
    200.00, 
    NOW() + INTERVAL '60 days'
FROM users u WHERE u.email = 'investor@example.com';

-- Создание демо транзакций
INSERT INTO transactions (user_id, type, amount, final_amount, status, method, description) 
SELECT 
    u.id, 
    'deposit', 
    1000.00, 
    1000.00, 
    'completed', 
    'bank_card', 
    'Пополнение баланса'
FROM users u WHERE u.email = 'user@example.com';

INSERT INTO transactions (user_id, type, amount, final_amount, status, method, description) 
SELECT 
    u.id, 
    'investment', 
    2000.00, 
    2000.00, 
    'completed', 
    'balance', 
    'Инвестиция в план "Стандарт"'
FROM users u WHERE u.email = 'user@example.com';

INSERT INTO transactions (user_id, type, amount, final_amount, status, method, description) 
SELECT 
    u.id, 
    'profit', 
    36.00, 
    36.00, 
    'completed', 
    'auto', 
    'Ежедневная прибыль'
FROM users u WHERE u.email = 'user@example.com';

-- Создание функции для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Создание триггеров для автоматического обновления updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON investments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_investment_plans_updated_at BEFORE UPDATE ON investment_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hero_settings_updated_at BEFORE UPDATE ON hero_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON testimonials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_launches_updated_at BEFORE UPDATE ON project_launches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Создание представлений для удобства
CREATE VIEW user_stats AS
SELECT 
    u.id,
    u.full_name,
    u.email,
    u.balance,
    u.total_invested,
    u.total_earned,
    COUNT(i.id) as active_investments,
    COUNT(t.id) as total_transactions,
    u.created_at as registration_date
FROM users u
LEFT JOIN investments i ON u.id = i.user_id AND i.status = 'active'
LEFT JOIN transactions t ON u.id = t.user_id
WHERE u.is_active = true
GROUP BY u.id, u.full_name, u.email, u.balance, u.total_invested, u.total_earned, u.created_at;

-- Создание представления для статистики платформы
CREATE VIEW platform_stats AS
SELECT 
    (SELECT COUNT(*) FROM users WHERE is_active = true) as total_users,
    (SELECT COUNT(*) FROM users WHERE created_at >= CURRENT_DATE) as new_users_today,
    (SELECT COUNT(*) FROM investments WHERE status = 'active') as active_investments,
    (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'investment' AND status = 'completed') as total_invested,
    (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'withdrawal' AND status = 'completed') as total_withdrawn,
    (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'profit' AND status = 'completed') as total_profit_paid,
    (SELECT COUNT(*) FROM transactions WHERE status = 'pending') as pending_transactions;

-- Создание индексов для производительности
CREATE INDEX idx_transactions_user_type_status ON transactions(user_id, type, status);
CREATE INDEX idx_investments_user_status ON investments(user_id, status);
CREATE INDEX idx_users_active_created ON users(is_active, created_at);

COMMIT;
