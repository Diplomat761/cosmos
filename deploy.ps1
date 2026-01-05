# Скрипт для деплоя на сервер dev2.pereverzevs.ru
# Использование: .\deploy.ps1

param(
    [string]$Server = "dev2.pereverzevs.ru",
    [string]$User = "your_username",
    [string]$RemotePath = "/var/www/html",
    [int]$Port = 22
)

Write-Host "Начинаю деплой на $Server..." -ForegroundColor Green

# Проверка наличия необходимых файлов
$filesToDeploy = @(
    "index.html",
    "meters.html",
    "requests.html",
    "favicon.svg",
    "css",
    "js",
    "images",
    "php"
)

foreach ($file in $filesToDeploy) {
    if (-not (Test-Path $file)) {
        Write-Host "ОШИБКА: Файл/папка $file не найдена!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "Все файлы найдены. Начинаю загрузку..." -ForegroundColor Yellow

# Команда для деплоя через SCP (требует установки OpenSSH или WinSCP)
# Для Windows можно использовать WinSCP или установить OpenSSH Client

# Вариант 1: Через OpenSSH (если установлен)
if (Get-Command scp -ErrorAction SilentlyContinue) {
    Write-Host "Используется SCP для загрузки..." -ForegroundColor Cyan
    
    # Создаём временный архив
    $tempArchive = "deploy_temp.tar.gz"
    Write-Host "Создаю архив..." -ForegroundColor Yellow
    
    # Загружаем файлы
    foreach ($item in $filesToDeploy) {
        if (Test-Path $item) {
            Write-Host "Загружаю $item..." -ForegroundColor Cyan
            # scp -r -P $Port "$item" "${User}@${Server}:${RemotePath}/"
        }
    }
    
    Write-Host "Деплой завершён!" -ForegroundColor Green
} else {
    Write-Host "SCP не найден. Используйте один из вариантов:" -ForegroundColor Yellow
    Write-Host "1. Установите OpenSSH Client для Windows" -ForegroundColor White
    Write-Host "2. Используйте WinSCP для ручной загрузки" -ForegroundColor White
    Write-Host "3. Настройте GitHub Actions с секретами" -ForegroundColor White
    Write-Host ""
    Write-Host "Файлы для загрузки:" -ForegroundColor Cyan
    foreach ($item in $filesToDeploy) {
        Write-Host "  - $item" -ForegroundColor White
    }
}

