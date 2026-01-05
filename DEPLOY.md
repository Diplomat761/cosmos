# Инструкция по деплою на dev2.pereverzevs.ru

## Проблема
Изменения отправлены в GitHub, но не видны на сервере dev2.pereverzevs.ru

## Решения

### Вариант 1: Автоматический деплой через GitHub Actions

1. **Настройте секреты в GitHub:**
   - Перейдите в Settings → Secrets and variables → Actions
   - Добавьте следующие секреты:
     - `DEPLOY_HOST` - адрес сервера (dev2.pereverzevs.ru)
     - `DEPLOY_USER` - имя пользователя для SSH
     - `DEPLOY_SSH_KEY` - приватный SSH ключ
     - `DEPLOY_PORT` - порт SSH (обычно 22)
     - `DEPLOY_PATH` - путь на сервере (например, /var/www/html)

2. **После настройки секретов:**
   - При каждом push в ветку `main` изменения автоматически задеплоятся на сервер

### Вариант 2: Ручной деплой через SSH/SCP

#### Через OpenSSH (Windows 10+):

```powershell
# Установите OpenSSH Client (если не установлен)
# Settings → Apps → Optional Features → OpenSSH Client

# Загрузите файлы на сервер
scp -r index.html meters.html requests.html favicon.svg user@dev2.pereverzevs.ru:/var/www/html/
scp -r css user@dev2.pereverzevs.ru:/var/www/html/
scp -r js user@dev2.pereverzevs.ru:/var/www/html/
scp -r images user@dev2.pereverzevs.ru:/var/www/html/
scp -r php user@dev2.pereverzevs.ru:/var/www/html/
```

#### Через WinSCP:

1. Скачайте и установите [WinSCP](https://winscp.net/)
2. Подключитесь к серверу dev2.pereverzevs.ru
3. Скопируйте следующие папки и файлы:
   - `index.html`
   - `meters.html`
   - `requests.html`
   - `favicon.svg`
   - `css/`
   - `js/`
   - `images/`
   - `php/`

### Вариант 3: Git Pull на сервере

Если на сервере есть доступ к git репозиторию:

```bash
# На сервере
cd /var/www/html
git pull origin main
```

### Вариант 4: Использование скрипта деплоя

Запустите PowerShell скрипт:
```powershell
.\deploy.ps1 -Server "dev2.pereverzevs.ru" -User "your_username" -RemotePath "/var/www/html"
```

## Проверка деплоя

После деплоя проверьте:
- http://dev2.pereverzevs.ru/index.html - должна отображаться обновлённая версия
- Проверьте консоль браузера (F12) на наличие ошибок загрузки ресурсов

## Важные файлы для деплоя

Обязательно загрузите:
- ✅ `index.html` - главная страница с параллакс фоном
- ✅ `css/style.css` - обновлённые стили
- ✅ `js/main.js` - JavaScript с параллакс эффектом
- ✅ `images/25.jpg` - фоновое изображение
- ✅ `favicon.svg` - иконка сайта
- ✅ Все остальные файлы из репозитория

## Быстрое решение

Если нужен быстрый деплой прямо сейчас, используйте WinSCP или FileZilla для ручной загрузки файлов на сервер.

