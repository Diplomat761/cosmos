/**
 * Загрузка новостей из базы данных
 * ЖСК "Космос"
 */

/**
 * Загружает новости с сервера
 */
async function loadNews(limit = 10) {
    try {
        const response = await fetch(`php/api/news.php?limit=${limit}`);
        const result = await response.json();
        
        if (result.success && result.data) {
            return result.data;
        } else {
            console.error('Ошибка загрузки новостей:', result.message || 'Неизвестная ошибка');
            return [];
        }
    } catch (error) {
        console.error('Ошибка при загрузке новостей:', error);
        return [];
    }
}

/**
 * Отображает новости на странице
 */
function displayNews(news, containerSelector = '.news-list--arabic') {
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error('Контейнер для новостей не найден');
        return;
    }
    
    // Очищаем контейнер
    container.innerHTML = '';
    
    if (news.length === 0) {
        container.innerHTML = `
            <article class="news-item news-item--arabic">
                <p class="news-item__text">Новостей пока нет</p>
                <div class="news-item__overlay"></div>
            </article>
        `;
        return;
    }
    
    // Создаем элементы новостей
    news.forEach((item, index) => {
        const newsItem = document.createElement('article');
        newsItem.className = 'news-item news-item--arabic';
        
        // Добавляем класс transparent для определенных новостей (например, с категорией announcement)
        if (item.category === 'announcement') {
            newsItem.classList.add('transparent');
        }
        
        // Форматируем дату
        const date = item.publish_date || item.event_date || '';
        
        // Обрезаем текст, если он слишком длинный
        let content = item.content || '';
        if (content.length > 300) {
            content = content.substring(0, 300) + '...';
        }
        
        newsItem.innerHTML = `
            <div class="news-item__date">${date}</div>
            <h3 class="news-item__title">${escapeHtml(item.title || 'Без названия')}</h3>
            <p class="news-item__text">${escapeHtml(content)}</p>
            <div class="news-item__overlay"></div>
        `;
        
        container.appendChild(newsItem);
    });
}

/**
 * Экранирует HTML для безопасности
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Инициализация загрузки новостей при загрузке страницы
 */
document.addEventListener('DOMContentLoaded', async function() {
    const newsContainer = document.querySelector('.news-list--arabic');
    if (newsContainer) {
        // Показываем индикатор загрузки
        newsContainer.innerHTML = `
            <article class="news-item news-item--arabic">
                <p class="news-item__text">Загрузка новостей...</p>
                <div class="news-item__overlay"></div>
            </article>
        `;
        
        // Загружаем новости
        const news = await loadNews(10);
        displayNews(news);
    }
});

// Экспортируем функции для использования в других скриптах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { loadNews, displayNews };
}
