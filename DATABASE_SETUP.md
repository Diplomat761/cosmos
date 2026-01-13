# Инструкция по настройке базы данных для сайта ЖСК "Космос"

## Шаг 1: Создание базы данных

1. Откройте phpMyAdmin или другой инструмент для работы с MySQL/MariaDB
2. Создайте новую базу данных с именем `jsk_kosmos`
3. Импортируйте SQL-файл `jsk_kosmos.sql` в созданную базу данных

```sql
-- Или выполните в командной строке:
mysql -u root -p jsk_kosmos < jsk_kosmos.sql
```

## Шаг 2: Настройка подключения к БД

Откройте файл `php/config.php` и измените настройки подключения:

```php
define('DB_HOST', '127.0.0.1');      // Хост БД
define('DB_NAME', 'jsk_kosmos');     // Имя базы данных
define('DB_USER', 'root');            // Имя пользователя БД
define('DB_PASS', '');                // Пароль БД
```

## Шаг 3: Создание директорий для загрузок

Создайте директории для загрузки файлов:

```bash
mkdir -p uploads/requests
chmod 755 uploads/requests
```

Или в Windows:
```
mkdir uploads\requests
```

## Шаг 4: Проверка работы

1. Убедитесь, что веб-сервер (Apache/Nginx) запущен
2. Убедитесь, что PHP включен и работает
3. Откройте сайт в браузере
4. Проверьте, что новости загружаются на главной странице

## Структура базы данных

### Таблицы:

- **users** - Пользователи (жильцы)
  - `id` - ID пользователя
  - `apartment_number` - Номер квартиры (уникальный)
  - `phone` - Телефон
  - `password` - Хеш пароля
  - `fio` - ФИО
  - `email` - Email
  - `status` - Статус (pending/active/blocked)
  - `role` - Роль (user/admin)

- **meter_readings** - Показания счетчиков
  - `id` - ID записи
  - `apartment_id` - ID квартиры (FK к users)
  - `date` - Дата показаний
  - `cold_water` - Холодная вода
  - `hot_water` - Горячая вода
  - `electricity` - Электричество
  - `status` - Статус (pending/accepted/rejected)

- **requests** - Заявки
  - `id` - ID заявки
  - `apartment_id` - ID квартиры (FK к users)
  - `request_number` - Номер заявки (уникальный)
  - `type` - Тип (plumber/electrician/chairman)
  - `fio` - ФИО заявителя
  - `phone` - Телефон
  - `subject` - Тема
  - `description` - Описание
  - `photo` - Путь к фото
  - `status` - Статус (new/in_progress/completed/rejected)

- **news** - Новости
  - `id` - ID новости
  - `title` - Заголовок
  - `content` - Содержание
  - `category` - Категория (news/announcement/urgent)
  - `image` - Путь к изображению
  - `publish_date` - Дата публикации
  - `event_date` - Дата события

- **tariffs** - Тарифы
  - `id` - ID тарифа
  - `service` - Услуга (cold_water/hot_water/electricity)
  - `rate` - Тариф
  - `effective_date` - Дата вступления в силу

- **documents** - Документы
  - `id` - ID документа
  - `title` - Название
  - `category` - Категория (charter/protocols/financial/receipts)
  - `file_path` - Путь к файлу
  - `description` - Описание
  - `upload_date` - Дата загрузки

## API Endpoints

### Получение новостей
```
GET php/api/news.php
Параметры:
  - category (опционально): news, announcement, urgent
  - limit (опционально): количество новостей (по умолчанию 10)
  - offset (опционально): смещение (по умолчанию 0)
```

### Получение тарифов
```
GET php/api/tariffs.php
Возвращает актуальные тарифы для всех услуг
```

### Получение документов
```
GET php/api/documents.php
Параметры:
  - category (опционально): charter, protocols, financial, receipts
```

## Добавление тестовых данных

### Добавление новости:

```sql
INSERT INTO news (title, content, category, publish_date) VALUES 
('Тестовая новость', 'Содержание новости', 'news', NOW());
```

### Добавление пользователя:

```sql
INSERT INTO users (apartment_number, phone, password, fio, email, status, role) VALUES 
(10, '+79001234567', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Тестовый Пользователь', 'test@mail.ru', 'active', 'user');
```

Пароль по умолчанию: `password` (хеш уже указан в примере)

## Безопасность

⚠️ **ВАЖНО**: Перед развертыванием на продакшене:

1. Измените пароли БД в `php/config.php`
2. Ограничьте CORS в PHP файлах (уберите `Access-Control-Allow-Origin: *`)
3. Настройте права доступа к файлам (chmod 644 для PHP файлов)
4. Включите HTTPS
5. Настройте защиту от SQL-инъекций (используется PDO с prepared statements)
6. Ограничьте размер загружаемых файлов в PHP настройках

## Устранение неполадок

### Ошибка подключения к БД:
- Проверьте настройки в `php/config.php`
- Убедитесь, что MySQL/MariaDB запущен
- Проверьте права доступа пользователя БД

### Новости не загружаются:
- Откройте консоль браузера (F12) и проверьте ошибки
- Проверьте, что файл `php/api/news.php` доступен
- Убедитесь, что в таблице `news` есть данные

### Заявки/показания не сохраняются:
- Проверьте логи ошибок PHP
- Убедитесь, что пользователь с указанным номером квартиры существует в БД
- Проверьте, что статус пользователя = 'active'

## Поддержка

При возникновении проблем проверьте:
1. Логи PHP: `error_log` в PHP файлах
2. Логи веб-сервера
3. Консоль браузера (F12) для ошибок JavaScript
