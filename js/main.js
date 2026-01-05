/**
 * Основной JavaScript файл для ЖСК "Космос"
 * Реализует: мобильное меню, плавную прокрутку
 */

(function() {
  'use strict';

  // ============================================
  // Мобильное меню
  // ============================================
  const menuToggle = document.querySelector('.header__menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const menuClose = document.querySelector('.mobile-menu__close');
  const overlay = document.querySelector('.overlay');
  const mobileMenuLinks = document.querySelectorAll('.mobile-menu__link');

  /**
   * Открытие мобильного меню
   */
  function openMobileMenu() {
    if (mobileMenu) {
      mobileMenu.classList.add('mobile-menu--open');
    }
    if (overlay) {
      overlay.classList.add('overlay--active');
    }
    document.body.style.overflow = 'hidden';
  }

  /**
   * Закрытие мобильного меню
   */
  function closeMobileMenu() {
    if (mobileMenu) {
      mobileMenu.classList.remove('mobile-menu--open');
    }
    if (overlay) {
      overlay.classList.remove('overlay--active');
    }
    document.body.style.overflow = '';
  }

  // Обработчики событий для мобильного меню
  if (menuToggle) {
    menuToggle.addEventListener('click', openMobileMenu);
  }

  if (menuClose) {
    menuClose.addEventListener('click', closeMobileMenu);
  }

  // Закрытие меню при клике на затемнение
  if (overlay) {
    overlay.addEventListener('click', closeMobileMenu);
  }

  // Закрытие меню при клике на ссылку
  mobileMenuLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // Закрытие меню при нажатии Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('mobile-menu--open')) {
      closeMobileMenu();
    }
  });

  // ============================================
  // Плавная прокрутка к якорным ссылкам
  // ============================================
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      
      // Пропускаем пустые якоря
      if (href === '#' || href === '') {
        return;
      }

      const target = document.querySelector(href);
      
      if (target) {
        e.preventDefault();
        
        const header = document.querySelector('.header');
        const headerHeight = header ? header.offsetHeight : 0;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ============================================
  // Интерактивный параллакс фон для Hero секции
  // ============================================
  const parallaxBg = document.getElementById('parallaxBg');
  const heroSection = document.querySelector('.hero');
  
  /**
   * Проверка, является ли устройство мобильным
   */
  function isMobileDevice() {
    return window.matchMedia('(max-width: 768px)').matches || 
           'ontouchstart' in window || 
           navigator.maxTouchPoints > 0;
  }
  
  /**
   * Обработка движения мыши для эффекта параллакса
   */
  function handleParallax(e) {
    // Отключаем эффект на мобильных устройствах
    if (isMobileDevice() || !parallaxBg || !heroSection) {
      return;
    }
    
    // Получаем размеры hero секции
    const rect = heroSection.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Вычисляем смещение курсора от центра
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const deltaX = mouseX - centerX;
    const deltaY = mouseY - centerY;
    
    // Вычисляем процент смещения (максимум ±30px)
    const maxOffset = 30;
    const offsetX = (deltaX / rect.width) * maxOffset;
    const offsetY = (deltaY / rect.height) * maxOffset;
    
    // Применяем трансформацию (в противоположную сторону)
    parallaxBg.style.transform = `translate(${-offsetX}px, ${-offsetY}px)`;
  }
  
  /**
   * Сброс позиции фона при выходе курсора из hero секции
   */
  function resetParallax() {
    if (parallaxBg && !isMobileDevice()) {
      parallaxBg.style.transform = 'translate(0, 0)';
    }
  }
  
  /**
   * Обработка изменения размера окна
   */
  function handleResize() {
    if (parallaxBg && !isMobileDevice()) {
      // При изменении размера окна сбрасываем позицию
      parallaxBg.style.transform = 'translate(0, 0)';
    }
  }
  
  // Инициализация параллакса только на десктопе
  if (heroSection && !isMobileDevice()) {
    heroSection.addEventListener('mousemove', handleParallax);
    heroSection.addEventListener('mouseleave', resetParallax);
    window.addEventListener('resize', handleResize);
  }

  console.log('ЖСК "Космос": Основной JavaScript загружен');
})();

