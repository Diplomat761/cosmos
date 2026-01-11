/**
 * JavaScript для интеграции Dog CEO API
 * Загружает и отображает случайные изображения собак
 */

(function() {
  'use strict';

  const DOG_API_URL = 'https://disk.yandex.ru/d/SAFWsIFSGPhzOQ';
  const dogImage = document.getElementById('dogImage');
  const dogLoader = document.getElementById('dogLoader');
  const dogError = document.getElementById('dogError');
  const loadDogBtn = document.getElementById('loadDogBtn');

  /**
   * Загрузка случайного изображения собаки
   */
  async function loadDogImage() {
    // Показываем загрузчик, скрываем изображение и ошибку
    if (dogLoader) dogLoader.style.display = 'flex';
    if (dogImage) dogImage.style.display = 'none';
    if (dogError) dogError.style.display = 'none';
    if (loadDogBtn) loadDogBtn.disabled = true;

    try {
      const response = await fetch(DOG_API_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'success' && data.message) {
        // Устанавливаем изображение
        if (dogImage) {
          dogImage.src = data.message;
          dogImage.alt = 'Случайная собака';
          
          // Показываем изображение после загрузки
          dogImage.onload = function() {
            if (dogLoader) dogLoader.style.display = 'none';
            if (dogImage) dogImage.style.display = 'block';
            if (loadDogBtn) loadDogBtn.disabled = false;
          };

          // Обработка ошибки загрузки изображения
          dogImage.onerror = function() {
            if (dogLoader) dogLoader.style.display = 'none';
            if (dogError) dogError.style.display = 'flex';
            if (loadDogBtn) loadDogBtn.disabled = false;
          };
        }
      } else {
        throw new Error('Неверный формат ответа API');
      }
    } catch (error) {
      console.error('Ошибка загрузки изображения собаки:', error);
      
      // Показываем сообщение об ошибке
      if (dogLoader) dogLoader.style.display = 'none';
      if (dogError) dogError.style.display = 'flex';
      if (loadDogBtn) loadDogBtn.disabled = false;
    }
  }

  // Обработчик клика на кнопку
  if (loadDogBtn) {
    loadDogBtn.addEventListener('click', loadDogImage);
  }

  // Загружаем первое изображение при загрузке страницы
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadDogImage);
  } else {
    loadDogImage();
  }

  console.log('Dog API: JavaScript загружен');
})();

