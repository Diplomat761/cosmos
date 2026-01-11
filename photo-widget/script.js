/**
 * Виджет для просмотра фотографий из публичной папки Яндекс.Диска
 * 
 * TODO: Заменить локальный массив photos на метод получения реального списка файлов
 * из публичной папки Яндекс.Диска (https://disk.yandex.ru/d/SAFWsIFSGPhzOQ)
 * 
 * Варианты реализации:
 * 1. Создать photos.json файл со списком прямых ссылок на изображения
 * 2. Использовать промежуточный прокси-сервер (Python/Node.js)
 */

// Состояние приложения
const state = {
  photos: [],           // Массив ссылок на фотографии
  currentIndex: 0,      // Индекс текущей фотографии
  autoplay: false,      // Флаг автопрокрутки
  autoplayInterval: 10, // Интервал автопрокрутки в секундах
  autoplayTimer: null   // Таймер автопрокрутки
};

/**
 * Массив фотографий из папки images проекта
 * Используются файлы по маске DSC*.JPG
 * 
 * Пути указаны относительно корня проекта (index.html)
 * 
 * TODO: В будущем можно заменить на загрузку из photos.json
 * или использовать метод получения реального списка файлов из Яндекс.Диска
 */
const TEMP_PHOTOS = [
  'images/DSC07057.JPG',
  'images/DSC07056.JPG',
  'images/DSC07054.JPG',
  'images/DSC07053.JPG',
  'images/DSC07050.JPG',
  'images/DSC07049.JPG',
  'images/DSC07048.JPG',
  'images/DSC07047.JPG',
  'images/DSC07046.JPG',
  'images/DSC07043.JPG',
  'images/DSC07042.JPG',
  'images/DSC07041.JPG',
  'images/DSC07040.JPG',
  'images/DSC07039.JPG',
  'images/DSC07037.JPG',
  'images/DSC07036.JPG',
  'images/DSC07034.JPG',
  'images/DSC07033.JPG',
  'images/DSC07032.JPG',
  'images/DSC07031.JPG',
  'images/DSC07030.JPG',
  'images/DSC07029.JPG',
  'images/DSC07028.JPG',
  'images/DSC07025.JPG',
  'images/DSC07023.JPG',
  'images/DSC07022.JPG',
  'images/DSC07020.JPG',
  'images/DSC07019.JPG',
  'images/DSC07018.JPG',
  'images/DSC07017.JPG',
  'images/DSC07016.JPG',
  'images/DSC07011.JPG',
  'images/DSC07009.JPG',
  'images/DSC07006.JPG',
  'images/DSC07005.JPG',
  'images/DSC07004.JPG',
  'images/DSC07002.JPG',
  'images/DSC06998.JPG',
  'images/DSC06955.JPG',
  'images/DSC06954.JPG',
  'images/DSC06952.JPG',
  'images/DSC06951.JPG',
  'images/DSC06950.JPG',
  'images/DSC06949.JPG',
  'images/DSC06944.JPG',
  'images/DSC06927.JPG',
  'images/DSC06926.JPG',
  'images/DSC06925.JPG',
  'images/DSC06920.JPG',
  'images/DSC06919.JPG',
  'images/DSC06918.JPG',
  'images/DSC06916.JPG',
  'images/DSC06913.JPG',
  'images/DSC06895.JPG',
  'images/DSC06894.JPG',
  'images/DSC06893.JPG',
  'images/DSC06881.JPG',
  'images/DSC06880.JPG',
  'images/DSC06879.JPG',
  'images/DSC06878.JPG',
  'images/DSC06877.JPG',
  'images/DSC06876.JPG',
  'images/DSC06874.JPG',
  'images/DSC06871.JPG',
  'images/DSC06870.JPG',
  'images/DSC06869.JPG',
  'images/DSC06826.JPG',
  'images/DSC06825.JPG',
  'images/DSC06824.JPG',
  'images/DSC06822.JPG',
  'images/DSC06814.JPG',
  'images/DSC06812.JPG',
  'images/DSC06809.JPG',
  'images/DSC06808.JPG',
  'images/DSC06807.JPG',
  'images/DSC06806.JPG',
  'images/DSC06805.JPG',
  'images/DSC06804.JPG',
  'images/DSC06782.JPG',
  'images/DSC06781.JPG',
  'images/DSC06762.JPG',
  'images/DSC06759.JPG',
  'images/DSC06631.JPG',
  'images/DSC06625.JPG',
  'images/DSC06612.JPG',
  'images/DSC06611.JPG',
  'images/DSC06597.JPG',
  'images/DSC06596.JPG',
  'images/DSC06595.JPG',
  'images/DSC06593.JPG',
  'images/DSC06592.JPG',
  'images/DSC06589.JPG',
  'images/DSC06579.JPG',
  'images/DSC06578.JPG',
  'images/DSC06577.JPG',
  'images/DSC06576.JPG',
  'images/DSC06575.JPG',
  'images/DSC06573.JPG',
  'images/DSC06572.JPG',
  'images/DSC06571.JPG',
  'images/DSC06567.JPG',
  'images/DSC06566.JPG',
  'images/DSC06565.JPG',
  'images/DSC06564.JPG',
  'images/DSC06563.JPG',
  'images/DSC06562.JPG',
  'images/DSC06561.JPG',
  'images/DSC06560.JPG',
  'images/DSC06559.JPG',
  'images/DSC06558.JPG',
  'images/DSC06557.JPG',
  'images/DSC06556.JPG',
  'images/DSC06555.JPG',
  'images/DSC06554.JPG',
  'images/DSC06553.JPG',
  'images/DSC06547.JPG',
  'images/DSC06652.JPG',
  'images/DSC06651.JPG',
  'images/DSC06650.JPG',
  'images/DSC06649.JPG',
  'images/DSC06647.JPG',
  'images/DSC06646.JPG',
  'images/DSC06645.JPG',
  'images/DSC06644.JPG',
  'images/DSC06643.JPG',
  'images/DSC06642.JPG',
  'images/DSC06641.JPG',
  'images/DSC06640.JPG',
  'images/DSC06638.JPG',
  'images/DSC06637.JPG',
  'images/DSC06544.JPG',
  'images/DSC_5287.JPG',
  'images/DSC_5286.JPG',
  'images/DSC_5284.JPG',
  'images/DSC_5283.JPG',
  'images/DSC_5278.JPG',
  'images/DSC_5277.JPG',
  'images/DSC_5276.JPG',
  'images/DSC_5275.JPG',
  'images/DSC_5274.JPG',
  'images/DSC_5273.JPG',
  'images/DSC_5272.JPG',
  'images/DSC_5271.JPG',
  'images/DSC_5270.JPG',
  'images/DSC_5269.JPG',
  'images/DSC_5268.JPG',
  'images/DSC_5267.JPG',
  'images/DSC_5266.JPG',
  'images/DSC_5265.JPG',
  'images/DSC_5263.JPG',
  'images/DSC_5241.JPG',
  'images/DSC_5229.JPG',
  'images/DSC_5225.JPG',
  'images/DSC_5222.JPG',
  'images/DSC_5221.JPG',
  'images/DSC_5217.JPG',
  'images/DSC_5212.JPG',
  'images/DSC_5208.JPG',
  'images/DSC_5207.JPG',
  'images/DSC_5206.JPG',
  'images/DSC_5205.JPG',
  'images/DSC_5204.JPG',
  'images/DSC_5203.JPG',
  'images/DSC_5202.JPG',
  'images/DSC_5201.JPG',
  'images/DSC_5200.JPG',
  'images/DSC_5196.JPG',
  'images/DSC_5195.JPG',
  'images/DSC_5192.JPG',
  'images/DSC_5191.JPG',
  'images/DSC_5190.JPG',
  'images/DSC_5189.JPG',
  'images/DSC_5188.JPG',
  'images/DSC_5187.JPG',
  'images/DSC_5186.JPG',
  'images/DSC_5185.JPG',
  'images/DSC_5184.JPG',
  'images/DSC_5183.JPG',
  'images/DSC06540.JPG',
  'images/DSC06538.JPG',
  'images/DSC06537.JPG',
  'images/DSC06536.JPG',
  'images/DSC06535.JPG',
  'images/DSC06534.JPG',
  'images/DSC_5174.JPG',
  'images/DSC_5171.JPG',
  'images/DSC06531.JPG',
  'images/DSC_5166.JPG',
  'images/DSC_5165.JPG',
  'images/DSC_5164.JPG',
  'images/DSC_5163.JPG',
  'images/DSC_5162.JPG',
  'images/DSC_5161.JPG',
  'images/DSC_5160.JPG',
  'images/DSC_5159.JPG',
  'images/DSC_5158.JPG',
  'images/DSC_5157.JPG',
  'images/DSC_5156.JPG',
  'images/DSC_5155.JPG',
  'images/DSC_5154.JPG'
];

// DOM элементы
const elements = {
  photoImage: document.getElementById('photoImage'),
  loadingIndicator: document.getElementById('loadingIndicator'),
  photoInfo: document.getElementById('photoInfo'),
  photoCounter: document.getElementById('photoCounter'),
  btnPrev: document.getElementById('btnPrev'),
  btnNext: document.getElementById('btnNext'),
  btnRandom: document.getElementById('btnRandom'),
  autoplayCheckbox: document.getElementById('autoplayCheckbox'),
  intervalInput: document.getElementById('intervalInput')
};

/**
 * Инициализация виджета
 * 
 * Сначала пытается загрузить список фотографий из photos.json.
 * Если файл не найден или произошла ошибка, использует локальный массив TEMP_PHOTOS.
 */
async function init() {
  try {
    // Пытаемся загрузить список фотографий из JSON файла
    const response = await fetch('photos.json');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Проверяем, что данные в правильном формате
    if (data.photos && Array.isArray(data.photos) && data.photos.length > 0) {
      state.photos = data.photos;
      console.log(`✅ Загружено ${data.photos.length} фотографий из photos.json`);
    } else {
      throw new Error('Неверный формат данных в photos.json');
    }
  } catch (error) {
    console.warn('⚠️ Ошибка загрузки photos.json:', error.message);
    console.log('📸 Используется локальный список фотографий из папки images');
    // Используем локальный массив как fallback
    state.photos = [...TEMP_PHOTOS];
  }
  
  // Устанавливаем обработчики событий
  setupEventListeners();
  
  const randomIndex = Math.floor(Math.random() * state.photos.length);
  state.currentIndex = randomIndex;
  
  // Загружаем первую фотографию
  loadPhoto(state.currentIndex);
  
  // Обновляем интерфейс
  updateUI();
}

/**
 * Установка обработчиков событий
 */
function setupEventListeners() {
  // Кнопка "Предыдущее"
  elements.btnPrev.addEventListener('click', () => {
    navigatePhoto(-1);
  });
  
  // Кнопка "Следующее"
  elements.btnNext.addEventListener('click', () => {
    navigatePhoto(1);
  });
  
  // Кнопка "Случайное"
  elements.btnRandom.addEventListener('click', () => {
    showRandomPhoto();
  });
  
  // Переключатель автопрокрутки
  elements.autoplayCheckbox.addEventListener('change', (e) => {
    state.autoplay = e.target.checked;
    toggleAutoplay();
  });
  
  // Изменение интервала автопрокрутки
  elements.intervalInput.addEventListener('change', (e) => {
    const newInterval = parseInt(e.target.value);
    if (newInterval >= 2 && newInterval <= 60) {
      state.autoplayInterval = newInterval;
      if (state.autoplay) {
        toggleAutoplay(); // Перезапускаем автопрокрутку с новым интервалом
        toggleAutoplay();
      }
    }
  });
}

/**
 * Загрузка фотографии по индексу
 * @param {number} index - Индекс фотографии в массиве
 */
function loadPhoto(index) {
  if (index < 0 || index >= state.photos.length) {
    console.error('Индекс фотографии вне допустимого диапазона');
    return;
  }
  
  // Показываем индикатор загрузки
  showLoading();
  
  // Скрываем текущее изображение
  elements.photoImage.classList.remove('loaded');
  
  // Создаем новое изображение для предзагрузки
  const img = new Image();
  
  img.onload = () => {
    // Изображение загружено успешно
    elements.photoImage.src = state.photos[index];
    elements.photoImage.alt = `Фотография ${index + 1}`;
    elements.photoImage.classList.add('loaded');
    hideLoading();
    
    // Обновляем счетчик
    updateCounter();
  };
  
  img.onerror = () => {
    // Ошибка загрузки изображения
    console.error('Ошибка загрузки изображения:', state.photos[index]);
    hideLoading();
    alert('Не удалось загрузить фотографию. Попробуйте другую.');
  };
  
  // Начинаем загрузку
  img.src = state.photos[index];
  state.currentIndex = index;
}

/**
 * Навигация по фотографиям
 * @param {number} direction - Направление: -1 (назад) или 1 (вперед)
 */
function navigatePhoto(direction) {
  let newIndex = state.currentIndex + direction;
  
  // Циклическая навигация
  if (newIndex < 0) {
    newIndex = state.photos.length - 1;
  } else if (newIndex >= state.photos.length) {
    newIndex = 0;
  }
  
  loadPhoto(newIndex);
  updateUI();
}

/**
 * Показать случайную фотографию
 */
function showRandomPhoto() {
  let randomIndex;
  
  // Если фотографий больше одной, выбираем случайную, отличную от текущей
  if (state.photos.length > 1) {
    do {
      randomIndex = Math.floor(Math.random() * state.photos.length);
    } while (randomIndex === state.currentIndex && state.photos.length > 1);
  } else {
    randomIndex = 0;
  }
  
  loadPhoto(randomIndex);
  updateUI();
}

/**
 * Показать индикатор загрузки
 */
function showLoading() {
  elements.loadingIndicator.classList.add('active');
}

/**
 * Скрыть индикатор загрузки
 */
function hideLoading() {
  elements.loadingIndicator.classList.remove('active');
}

/**
 * Обновить счетчик фотографий
 */
function updateCounter() {
  elements.photoCounter.textContent = `${state.currentIndex + 1} / ${state.photos.length}`;
}

/**
 * Обновить интерфейс (состояние кнопок)
 */
function updateUI() {
  // Кнопки всегда активны благодаря циклической навигации
  // Но можно добавить логику, если понадобится
  updateCounter();
}

/**
 * Переключение автопрокрутки
 */
function toggleAutoplay() {
  if (state.autoplay) {
    // Запускаем автопрокрутку
    startAutoplay();
  } else {
    // Останавливаем автопрокрутку
    stopAutoplay();
  }
}

/**
 * Запустить автопрокрутку
 */
function startAutoplay() {
  stopAutoplay(); // Останавливаем предыдущий таймер, если он есть
  
  state.autoplayTimer = setInterval(() => {
    navigatePhoto(1); // Переход к следующей фотографии
  }, state.autoplayInterval * 1000);
}

/**
 * Остановить автопрокрутку
 */
function stopAutoplay() {
  if (state.autoplayTimer) {
    clearInterval(state.autoplayTimer);
    state.autoplayTimer = null;
  }
}

/**
 * Загрузка списка фотографий из JSON файла (для будущей реализации)
 * 
 * Пример использования:
 * async function loadPhotosFromJSON() {
 *   try {
 *     const response = await fetch('photos.json');
 *     const data = await response.json();
 *     state.photos = data.photos; // Предполагается структура { photos: [...] }
 *     loadPhoto(0);
 *   } catch (error) {
 *     console.error('Ошибка загрузки списка фотографий:', error);
 *     // Используем временный массив как fallback
 *     state.photos = [...TEMP_PHOTOS];
 *     loadPhoto(0);
 *   }
 * }
 */

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', init);

