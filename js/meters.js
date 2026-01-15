/**
 * JavaScript для страницы передачи показаний счетчиков
 * ЖСК "Космос"
 */

(function() {
  'use strict';

  // Конфигурация тарифов (загружаются из БД)
  let TARIFFS = {
    coldWater: 50,      // руб/м³ (по умолчанию)
    hotWater: 50,       // руб/м³ (по умолчанию)
    electricity: 5.0    // руб/кВт⋅ч (по умолчанию)
  };

  // Элементы формы
  const form = document.getElementById('metersForm');
  const apartmentSelect = document.getElementById('apartment');
  const nameInput = document.getElementById('name');
  const dateInput = document.getElementById('date');
  const coldWaterInput = document.getElementById('coldWater');
  const hotWaterInput = document.getElementById('hotWater');
  const electricityInput = document.getElementById('electricity');
  const calculateBtn = document.getElementById('calculateBtn');
  const submitBtn = document.getElementById('submitBtn');
  const calculationDiv = document.getElementById('calculation');
  const historyDiv = document.getElementById('history');

  // Инициализация
  async function init() {
    // Установка текущей даты по умолчанию
    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.value = today;
      dateInput.max = today; // Ограничение: не будущие даты
    }

    // Загрузка тарифов из БД
    await loadTariffs();

    // Заполнение выпадающего списка квартир из БД
    if (apartmentSelect) {
      await loadApartments();
    }

    // Загрузка предыдущих показаний
    loadPreviousReadings();

    // Загрузка истории
    loadHistory();

    // Обработчики событий
    if (calculateBtn) {
      calculateBtn.addEventListener('click', calculate);
    }

    if (form) {
      form.addEventListener('submit', handleSubmit);
    }

    // Валидация в реальном времени
    if (coldWaterInput) {
      coldWaterInput.addEventListener('input', validateMeter);
    }
    if (hotWaterInput) {
      hotWaterInput.addEventListener('input', validateMeter);
    }
    if (electricityInput) {
      electricityInput.addEventListener('input', validateMeter);
    }
  }

  /**
   * Загрузка предыдущих показаний из localStorage
   */
  function loadPreviousReadings() {
    const apartment = apartmentSelect ? apartmentSelect.value : null;
    if (!apartment) return;

    const history = getHistory();
    const lastReading = history
      .filter(item => item.apartment === apartment)
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

    if (lastReading) {
      updatePreviousReadings(lastReading);
    } else {
      // Если нет истории, показываем нули
      updatePreviousReadings({
        coldWater: 0,
        hotWater: 0,
        electricity: 0
      });
    }
  }

  /**
   * Обновление отображения предыдущих показаний
   */
  function updatePreviousReadings(data) {
    const prevColdWater = document.getElementById('prevColdWater');
    const prevHotWater = document.getElementById('prevHotWater');
    const prevElectricity = document.getElementById('prevElectricity');

    if (prevColdWater) prevColdWater.textContent = data.coldWater || 0;
    if (prevHotWater) prevHotWater.textContent = data.hotWater || 0;
    if (prevElectricity) prevElectricity.textContent = data.electricity || 0;
  }

  /**
   * Валидация показаний счетчика
   */
  function validateMeter(e) {
    const input = e.target;
    const value = parseFloat(input.value);
    const meterType = input.id;
    const prevValue = getPreviousValue(meterType);

    // Удаляем предыдущие ошибки
    input.classList.remove('error');
    const errorDiv = input.parentElement.querySelector('.form-group__error');
    if (errorDiv) {
      errorDiv.remove();
    }

    if (isNaN(value) || value < 0) {
      showError(input, 'Введите корректное число');
      return false;
    }

    if (value < prevValue) {
      showError(input, `Текущие показания не могут быть меньше предыдущих (${prevValue})`);
      return false;
    }

    return true;
  }

  /**
   * Получение предыдущего значения счетчика
   */
  function getPreviousValue(meterType) {
    const prevColdWater = document.getElementById('prevColdWater');
    const prevHotWater = document.getElementById('prevHotWater');
    const prevElectricity = document.getElementById('prevElectricity');

    switch(meterType) {
      case 'coldWater':
        return parseFloat(prevColdWater ? prevColdWater.textContent : 0);
      case 'hotWater':
        return parseFloat(prevHotWater ? prevHotWater.textContent : 0);
      case 'electricity':
        return parseFloat(prevElectricity ? prevElectricity.textContent : 0);
      default:
        return 0;
    }
  }

  /**
   * Показать ошибку
   */
  function showError(input, message) {
    input.classList.add('error');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-group__error';
    errorDiv.textContent = message;
    input.parentElement.appendChild(errorDiv);
  }

  /**
   * Расчет потребления и суммы
   */
  function calculate() {
    if (!validateForm()) {
      return;
    }

    const coldWater = parseFloat(coldWaterInput.value) - getPreviousValue('coldWater');
    const hotWater = parseFloat(hotWaterInput.value) - getPreviousValue('hotWater');
    const electricity = parseFloat(electricityInput.value) - getPreviousValue('electricity');

    const coldWaterCost = coldWater * TARIFFS.coldWater;
    const hotWaterCost = hotWater * TARIFFS.hotWater;
    const electricityCost = electricity * TARIFFS.electricity;
    const total = coldWaterCost + hotWaterCost + electricityCost;

    if (calculationDiv) {
      calculationDiv.innerHTML = `
        <div class="calculation">
          <h3 class="calculation__title">Расчет потребления</h3>
          <div class="calculation__row">
            <span>Холодная вода:</span>
            <span>${coldWater.toFixed(2)} м³ × ${TARIFFS.coldWater}₽ = ${coldWaterCost.toFixed(2)}₽</span>
          </div>
          <div class="calculation__row">
            <span>Горячая вода:</span>
            <span>${hotWater.toFixed(2)} м³ × ${TARIFFS.hotWater}₽ = ${hotWaterCost.toFixed(2)}₽</span>
          </div>
          <div class="calculation__row">
            <span>Электричество:</span>
            <span>${electricity.toFixed(2)} кВт⋅ч × ${TARIFFS.electricity}₽ = ${electricityCost.toFixed(2)}₽</span>
          </div>
          <div class="calculation__row">
            <span>Итого к оплате:</span>
            <span>${total.toFixed(2)}₽</span>
          </div>
        </div>
      `;
      calculationDiv.style.display = 'block';
    }
  }

  /**
   * Валидация формы
   */
  function validateForm() {
    let isValid = true;

    // Валидация квартиры
    if (!apartmentSelect || !apartmentSelect.value) {
      isValid = false;
    }

    // Валидация ФИО (минимум 2 слова)
    if (!nameInput || !nameInput.value.trim() || nameInput.value.trim().split(/\s+/).length < 2) {
      isValid = false;
      if (nameInput) {
        showError(nameInput, 'Введите ФИО (минимум 2 слова)');
      }
    }

    // Валидация даты
    if (!dateInput || !dateInput.value) {
      isValid = false;
    }

    // Валидация счетчиков
    if (!validateMeter({ target: coldWaterInput })) isValid = false;
    if (!validateMeter({ target: hotWaterInput })) isValid = false;
    if (!validateMeter({ target: electricityInput })) isValid = false;

    return isValid;
  }

  /**
   * Обработка отправки формы
   */
  function handleSubmit(e) {
    e.preventDefault();

    if (!validateForm()) {
      alert('Пожалуйста, заполните все поля корректно');
      return;
    }

    // Показываем индикатор загрузки
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Отправка...';
    }

    // Собираем данные
    const data = {
      apartment: apartmentSelect.value,
      name: nameInput.value.trim(),
      date: dateInput.value,
      coldWater: parseFloat(coldWaterInput.value),
      hotWater: parseFloat(hotWaterInput.value),
      electricity: parseFloat(electricityInput.value),
      timestamp: new Date().toISOString()
    };

    // Отправка на сервер
    fetch('php/submit_meters.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
      if (result.success) {
        // Сохранение в localStorage для истории
        saveToHistory(data);
        
        // Показываем модальное окно с подтверждением
        showModal('Показания успешно переданы!', 
          `Ваши показания за ${data.date} приняты и отправлены на проверку. Спасибо!`);
        
        // Сброс формы
        form.reset();
        if (dateInput) {
          const today = new Date().toISOString().split('T')[0];
          dateInput.value = today;
        }
        if (calculationDiv) {
          calculationDiv.style.display = 'none';
        }

        // Обновление истории
        loadHistory();
        loadPreviousReadings();
      } else {
        alert('Ошибка: ' + (result.message || result.error || 'Не удалось отправить показания'));
      }

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Отправить';
      }
    })
    .catch(error => {
      console.error('Ошибка отправки показаний:', error);
      alert('Произошла ошибка при отправке показаний. Попробуйте позже.');
      
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Отправить';
      }
    });
  }

  /**
   * Сохранение в историю (localStorage)
   */
  function saveToHistory(data) {
    const history = getHistory();
    history.push(data);
    localStorage.setItem('jsk_kosmos_meters', JSON.stringify(history));
  }

  /**
   * Получение истории из localStorage
   */
  function getHistory() {
    const stored = localStorage.getItem('jsk_kosmos_meters');
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Загрузка истории на страницу
   */
  function loadHistory() {
    const history = getHistory();
    const apartment = apartmentSelect ? apartmentSelect.value : null;
    
    if (!apartment || !historyDiv) return;

    const apartmentHistory = history
      .filter(item => item.apartment === apartment)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5); // Последние 5 записей

    if (apartmentHistory.length === 0) {
      historyDiv.innerHTML = '<p>История передач пока пуста</p>';
      return;
    }

    let html = '<table class="history-table"><thead><tr><th>Дата</th><th>ХВС</th><th>ГВС</th><th>Электричество</th></tr></thead><tbody>';
    
    apartmentHistory.forEach(item => {
      html += `
        <tr>
          <td>${item.date}</td>
          <td>${item.coldWater}</td>
          <td>${item.hotWater}</td>
          <td>${item.electricity}</td>
        </tr>
      `;
    });
    
    html += '</tbody></table>';
    historyDiv.innerHTML = html;
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

  /**
   * Загрузка списка квартир из БД
   */
  async function loadApartments() {
    if (!apartmentSelect) return;
    
    try {
      // Показываем индикатор загрузки
      apartmentSelect.innerHTML = '<option value="">Загрузка...</option>';
      apartmentSelect.disabled = true;
      
      const response = await fetch('php/api/apartments.php?active=true');
      const result = await response.json();
      
      if (result.success && result.data) {
        // Очищаем список
        apartmentSelect.innerHTML = '<option value="">Выберите квартиру</option>';
        
        // Заполняем список квартирами из БД
        result.data.forEach(apt => {
          const option = document.createElement('option');
          option.value = apt.number;
          
          // Формируем текст опции: "Квартира №X" или "Квартира №X - ФИО"
          let text = `Квартира №${apt.number}`;
          if (apt.fio) {
            text += ` - ${apt.fio}`;
          }
          option.textContent = text;
          
          apartmentSelect.appendChild(option);
        });
        
        apartmentSelect.disabled = false;
      } else {
        throw new Error('Не удалось загрузить список квартир');
      }
    } catch (error) {
      console.error('Ошибка загрузки квартир:', error);
      
      // Fallback: заполняем список от 1 до 80
      apartmentSelect.innerHTML = '<option value="">Выберите квартиру</option>';
      for (let i = 1; i <= 80; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Квартира №${i}`;
        apartmentSelect.appendChild(option);
      }
      apartmentSelect.disabled = false;
    }
  }

  /**
   * Загрузка тарифов из БД
   */
  async function loadTariffs() {
    try {
      const response = await fetch('php/api/tariffs.php');
      const result = await response.json();
      
      if (result.success && result.data) {
        // Обновляем тарифы из БД
        if (result.data.cold_water) {
          TARIFFS.coldWater = result.data.cold_water.rate;
        }
        if (result.data.hot_water) {
          TARIFFS.hotWater = result.data.hot_water.rate;
        }
        if (result.data.electricity) {
          TARIFFS.electricity = result.data.electricity.rate;
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки тарифов:', error);
      // Используем тарифы по умолчанию
    }
  }

  // Инициализация при загрузке страницы
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

