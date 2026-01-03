/**
 * JavaScript для страницы подачи заявок
 * ЖСК "Космос"
 */

(function() {
  'use strict';

  // Элементы формы
  const form = document.getElementById('requestForm');
  const requestTypeInputs = document.querySelectorAll('input[name="requestType"]');
  const apartmentSelect = document.getElementById('apartment');
  const nameInput = document.getElementById('name');
  const phoneInput = document.getElementById('phone');
  const subjectInput = document.getElementById('subject');
  const descriptionTextarea = document.getElementById('description');
  const fileInput = document.getElementById('photo');
  const urgentCheckbox = document.getElementById('urgent');
  const visitTimeSelect = document.getElementById('visitTime');
  const charCounter = document.getElementById('charCounter');
  const filePreview = document.getElementById('filePreview');
  const submitBtn = document.getElementById('submitBtn');
  const requestsHistory = document.getElementById('requestsHistory');

  // Счетчик заявок для генерации номера
  let requestCounter = parseInt(localStorage.getItem('jsk_kosmos_request_counter') || '0');

  // Инициализация
  function init() {
    // Заполнение выпадающего списка квартир
    if (apartmentSelect) {
      for (let i = 1; i <= 80; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        apartmentSelect.appendChild(option);
      }
    }

    // Маска для телефона
    if (phoneInput) {
      phoneInput.addEventListener('input', formatPhone);
    }

    // Счетчик символов для описания
    if (descriptionTextarea) {
      descriptionTextarea.addEventListener('input', updateCharCounter);
      updateCharCounter();
    }

    // Предпросмотр загруженного файла
    if (fileInput) {
      fileInput.addEventListener('change', handleFileSelect);
    }

    // Обработчик отправки формы
    if (form) {
      form.addEventListener('submit', handleSubmit);
    }

    // Загрузка истории заявок
    loadRequestsHistory();
  }

  /**
   * Форматирование телефона (маска +7 (XXX) XXX-XX-XX)
   */
  function formatPhone(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length === 0) {
      e.target.value = '';
      return;
    }

    if (value[0] !== '7' && value[0] !== '8') {
      value = '7' + value;
    }

    if (value[0] === '8') {
      value = '7' + value.slice(1);
    }

    let formatted = '+7';
    if (value.length > 1) {
      formatted += ' (' + value.slice(1, 4);
    }
    if (value.length >= 4) {
      formatted += ') ' + value.slice(4, 7);
    }
    if (value.length >= 7) {
      formatted += '-' + value.slice(7, 9);
    }
    if (value.length >= 9) {
      formatted += '-' + value.slice(9, 11);
    }

    e.target.value = formatted;
  }

  /**
   * Обновление счетчика символов
   */
  function updateCharCounter() {
    if (!descriptionTextarea || !charCounter) return;

    const length = descriptionTextarea.value.length;
    charCounter.textContent = `${length} / 500 символов`;

    if (length < 10) {
      charCounter.classList.add('char-counter--warning');
      charCounter.textContent += ' (минимум 10 символов)';
    } else if (length > 500) {
      charCounter.classList.add('char-counter--warning');
    } else {
      charCounter.classList.remove('char-counter--warning');
    }
  }

  /**
   * Обработка выбора файла
   */
  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Проверка типа файла
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert('Разрешены только файлы JPG и PNG');
      e.target.value = '';
      return;
    }

    // Проверка размера файла (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Размер файла не должен превышать 5MB');
      e.target.value = '';
      return;
    }

    // Предпросмотр
    const reader = new FileReader();
    reader.onload = function(e) {
      if (filePreview) {
        filePreview.innerHTML = `
          <img src="${e.target.result}" alt="Предпросмотр" class="file-upload__preview">
          <p style="margin-top: var(--spacing-xs); font-size: 0.875rem; color: var(--color-text-light);">
            ${file.name} (${(file.size / 1024).toFixed(2)} KB)
          </p>
        `;
      }
    };
    reader.readAsDataURL(file);
  }

  /**
   * Валидация формы
   */
  function validateForm() {
    let isValid = true;

    // Валидация типа заявки
    const selectedType = Array.from(requestTypeInputs).find(input => input.checked);
    if (!selectedType) {
      isValid = false;
      alert('Выберите тип заявки');
    }

    // Валидация квартиры
    if (!apartmentSelect || !apartmentSelect.value) {
      isValid = false;
    }

    // Валидация ФИО
    if (!nameInput || !nameInput.value.trim() || nameInput.value.trim().split(/\s+/).length < 2) {
      isValid = false;
      if (nameInput) {
        showError(nameInput, 'Введите ФИО (минимум 2 слова)');
      }
    }

    // Валидация телефона
    if (!phoneInput || !phoneInput.value || phoneInput.value.replace(/\D/g, '').length < 11) {
      isValid = false;
      if (phoneInput) {
        showError(phoneInput, 'Введите корректный номер телефона');
      }
    }

    // Валидация темы
    if (!subjectInput || !subjectInput.value.trim()) {
      isValid = false;
    }

    // Валидация описания
    if (!descriptionTextarea || descriptionTextarea.value.trim().length < 10) {
      isValid = false;
      if (descriptionTextarea) {
        showError(descriptionTextarea, 'Описание должно содержать минимум 10 символов');
      }
    }

    return isValid;
  }

  /**
   * Показать ошибку
   */
  function showError(input, message) {
    input.classList.add('error');
    const errorDiv = input.parentElement.querySelector('.form-group__error');
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
    } else {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'form-group__error';
      errorDiv.textContent = message;
      input.parentElement.appendChild(errorDiv);
    }
  }

  /**
   * Генерация номера заявки
   */
  function generateRequestNumber() {
    const year = new Date().getFullYear();
    requestCounter++;
    localStorage.setItem('jsk_kosmos_request_counter', requestCounter.toString());
    return `ЖСК-${year}-${String(requestCounter).padStart(4, '0')}`;
  }

  /**
   * Обработка отправки формы
   */
  function handleSubmit(e) {
    e.preventDefault();

    if (!validateForm()) {
      alert('Пожалуйста, заполните все обязательные поля корректно');
      return;
    }

    // Показываем индикатор загрузки
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Отправка...';
    }

    // Собираем данные
    const selectedType = Array.from(requestTypeInputs).find(input => input.checked);
    const requestNumber = generateRequestNumber();

    const data = {
      number: requestNumber,
      type: selectedType.value,
      apartment: apartmentSelect.value,
      name: nameInput.value.trim(),
      phone: phoneInput.value,
      subject: subjectInput.value.trim(),
      description: descriptionTextarea.value.trim(),
      urgent: urgentCheckbox ? urgentCheckbox.checked : false,
      visitTime: visitTimeSelect ? visitTimeSelect.value : '',
      status: 'accepted',
      date: new Date().toISOString(),
      timestamp: Date.now()
    };

    // Обработка файла (если есть)
    if (fileInput && fileInput.files[0]) {
      const reader = new FileReader();
      reader.onload = function(e) {
        data.photo = e.target.result;
        saveAndSubmit(data);
      };
      reader.readAsDataURL(fileInput.files[0]);
    } else {
      saveAndSubmit(data);
    }
  }

  /**
   * Сохранение и отправка заявки
   */
  function saveAndSubmit(data) {
    // Сохранение в localStorage
    saveToHistory(data);

    // Эмуляция отправки на сервер
    setTimeout(() => {
      console.log('Данные заявки:', data);
      
      // Показываем модальное окно с подтверждением
      showModal(
        'Заявка принята!', 
        `Ваша заявка зарегистрирована под номером <strong>${data.number}</strong>. Мы свяжемся с вами в ближайшее время.`
      );
      
      // Сброс формы
      form.reset();
      if (filePreview) {
        filePreview.innerHTML = '';
      }
      if (charCounter) {
        charCounter.textContent = '0 / 500 символов';
      }

      // Обновление истории
      loadRequestsHistory();

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Отправить заявку';
      }
    }, 1000);
  }

  /**
   * Сохранение в историю (localStorage)
   */
  function saveToHistory(data) {
    const history = getHistory();
    history.push(data);
    // Сортировка по дате (новые сверху)
    history.sort((a, b) => b.timestamp - a.timestamp);
    localStorage.setItem('jsk_kosmos_requests', JSON.stringify(history));
  }

  /**
   * Получение истории из localStorage
   */
  function getHistory() {
    const stored = localStorage.getItem('jsk_kosmos_requests');
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Загрузка истории заявок на страницу
   */
  function loadRequestsHistory() {
    const history = getHistory();
    const apartment = apartmentSelect ? apartmentSelect.value : null;
    
    if (!apartment || !requestsHistory) return;

    const apartmentHistory = history
      .filter(item => item.apartment === apartment)
      .slice(0, 10); // Последние 10 заявок

    if (apartmentHistory.length === 0) {
      requestsHistory.innerHTML = '<p>У вас пока нет заявок</p>';
      return;
    }

    let html = '<table class="history-table"><thead><tr><th>Номер</th><th>Тип</th><th>Тема</th><th>Дата</th><th>Статус</th></tr></thead><tbody>';
    
    apartmentHistory.forEach(item => {
      const date = new Date(item.date).toLocaleDateString('ru-RU');
      const statusClass = `status--${item.status === 'accepted' ? 'accepted' : 
                          item.status === 'in-progress' ? 'in-progress' : 
                          item.status === 'completed' ? 'completed' : 'cancelled'}`;
      const statusText = item.status === 'accepted' ? 'Принята' : 
                        item.status === 'in-progress' ? 'В работе' : 
                        item.status === 'completed' ? 'Выполнена' : 'Отменена';
      
      html += `
        <tr>
          <td>${item.number}</td>
          <td>${getTypeLabel(item.type)}</td>
          <td>${item.subject}</td>
          <td>${date}</td>
          <td><span class="status ${statusClass}">${statusText}</span></td>
        </tr>
      `;
    });
    
    html += '</tbody></table>';
    requestsHistory.innerHTML = html;
  }

  /**
   * Получение метки типа заявки
   */
  function getTypeLabel(type) {
    const labels = {
      'plumber': 'Сантехник',
      'electrician': 'Электрик',
      'chairman': 'Председателю'
    };
    return labels[type] || type;
  }

  /**
   * Показать модальное окно
   */
  function showModal(title, text) {
    const modal = document.createElement('div');
    modal.className = 'modal modal--active';
    modal.innerHTML = `
      <div class="modal__content">
        <h3 class="modal__title">${title}</h3>
        <p class="modal__text">${text}</p>
        <div class="modal__buttons">
          <button class="btn btn--accent" onclick="this.closest('.modal').remove()">Закрыть</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Закрытие при клике вне модального окна
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  // Обновление истории при изменении квартиры
  if (apartmentSelect) {
    apartmentSelect.addEventListener('change', loadRequestsHistory);
  }

  // Инициализация при загрузке страницы
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

