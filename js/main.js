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

  console.log('ЖСК "Космос": Основной JavaScript загружен');
})();

