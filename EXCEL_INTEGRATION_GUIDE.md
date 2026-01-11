# Руководство по интеграции Excel-калькулятора на сайт

## Обзор

Это руководство описывает два варианта интеграции Excel-таблицы с формулами на веб-сайт.

---

## Вариант 1: Фронтенд-реализация (JavaScript)

### Когда использовать:
- ✅ Простые арифметические операции (+, -, *, /)
- ✅ Небольшое количество формул
- ✅ Формулы не используют сложные функции Excel (VLOOKUP, INDEX, MATCH и т.д.)
- ✅ Нет зависимостей от других листов или внешних данных

### Преимущества:
- Быстрая работа (вычисления на клиенте)
- Нет нагрузки на сервер
- Работает без интернета после загрузки
- Простота развертывания

### Недостатки:
- Логика формул дублируется в коде
- При изменении Excel нужно обновлять JavaScript
- Не подходит для сложных формул

### Пошаговый план реализации:

1. **Изучить формулы Excel**
   - Открыть Excel-файл
   - Определить какие ячейки используются для ввода (A1, A2, A3)
   - Определить целевую ячейку с результатом (A4)
   - Записать формулу из целевой ячейки

2. **Создать HTML-форму**
   - Поля ввода для данных (A1, A2, A3)
   - Кнопка "Рассчитать"
   - Область для отображения результата

3. **Написать JavaScript-логику**
   - Функция для парсинга входных данных
   - Функция, дублирующая формулу Excel
   - Функция для отображения результата

4. **Протестировать**
   - Проверить правильность вычислений
   - Сравнить с результатами в Excel

### Пример кода:

#### HTML-форма:
```html
<form id="excelCalculatorForm">
  <div class="form-group">
    <label for="data1">Данные 1 (A1)</label>
    <input type="number" id="data1" name="data1" step="0.01" required>
  </div>
  
  <div class="form-group">
    <label for="data2">Данные 2 (A2)</label>
    <input type="number" id="data2" name="data2" step="0.01" required>
  </div>
  
  <div class="form-group">
    <label for="data3">Данные 3 (A3)</label>
    <input type="number" id="data3" name="data3" step="0.01" required>
  </div>
  
  <button type="submit">Рассчитать</button>
</form>

<div id="result">Результат: <span id="resultValue">0</span></div>
```

#### JavaScript-логика:
```javascript
// Пример: Excel формула в A4 = (A1 + A2) * A3
function calculateResult(data1, data2, data3) {
  return (data1 + data2) * data3;
}

document.getElementById('excelCalculatorForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const data1 = parseFloat(document.getElementById('data1').value);
  const data2 = parseFloat(document.getElementById('data2').value);
  const data3 = parseFloat(document.getElementById('data3').value);
  
  const result = calculateResult(data1, data2, data3);
  
  document.getElementById('resultValue').textContent = result.toFixed(2);
});
```

### Конвертация Excel-формул в JavaScript:

| Excel | JavaScript |
|-------|-----------|
| `=A1+A2` | `data1 + data2` |
| `=A1*A2` | `data1 * data2` |
| `=A1/A2` | `data1 / data2` |
| `=A1-A2` | `data1 - data2` |
| `=SUM(A1:A3)` | `data1 + data2 + data3` |
| `=AVERAGE(A1:A3)` | `(data1 + data2 + data3) / 3` |
| `=MAX(A1:A3)` | `Math.max(data1, data2, data3)` |
| `=MIN(A1:A3)` | `Math.min(data1, data2, data3)` |
| `=IF(A1>0, A2, A3)` | `data1 > 0 ? data2 : data3` |
| `=POWER(A1, 2)` | `Math.pow(data1, 2)` |
| `=SQRT(A1)` | `Math.sqrt(data1)` |

---

## Вариант 2: Бэкенд-реализация (Node.js/Python)

### Когда использовать:
- ✅ Сложные формулы Excel (VLOOKUP, INDEX, MATCH, сложные вложенные IF)
- ✅ Зависимости от других листов или ячеек
- ✅ Большое количество формул
- ✅ Нужна безопасность (формулы скрыты от пользователя)

### Преимущества:
- Полная поддержка всех функций Excel
- Формулы хранятся в Excel-файле (один источник истины)
- Легко обновлять (просто заменить Excel-файл)
- Безопасность (логика на сервере)

### Недостатки:
- Требуется сервер
- Нагрузка на сервер при каждом расчете
- Зависимость от библиотек

### Пошаговый план реализации:

#### Вариант 2A: Node.js + xlsx

1. **Установка зависимостей:**
   ```bash
   npm init -y
   npm install xlsx express cors
   ```

2. **Создание серверного файла (server.js):**
   ```javascript
   const express = require('express');
   const XLSX = require('xlsx');
   const cors = require('cors');
   const path = require('path');
   
   const app = express();
   app.use(cors());
   app.use(express.json());
   app.use(express.static('public'));
   
   // Маршрут для расчета
   app.post('/api/calculate', (req, res) => {
     try {
       const { data1, data2, data3 } = req.body;
       
       // Загрузка Excel-файла
       const workbook = XLSX.readFile(path.join(__dirname, 'calculator.xlsx'));
       const sheetName = workbook.SheetNames[0]; // Первый лист
       const worksheet = workbook.Sheets[sheetName];
       
       // Установка значений в ячейки
       worksheet['A1'] = { t: 'n', v: data1 };
       worksheet['A2'] = { t: 'n', v: data2 };
       worksheet['A3'] = { t: 'n', v: data3 };
       
       // Обновление формул (xlsx автоматически пересчитает)
       // Для этого нужно использовать библиотеку с поддержкой формул
       // Например: exceljs или formula-parser
       
       // Чтение результата из A4
       const result = worksheet['A4'] ? worksheet['A4'].v : 0;
       
       res.json({ result });
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   });
   
   app.listen(3000, () => {
     console.log('Сервер запущен на порту 3000');
   });
   ```

3. **HTML-форма с AJAX:**
   ```javascript
   document.getElementById('excelCalculatorForm').addEventListener('submit', async function(e) {
     e.preventDefault();
     
     const data1 = parseFloat(document.getElementById('data1').value);
     const data2 = parseFloat(document.getElementById('data2').value);
     const data3 = parseFloat(document.getElementById('data3').value);
     
     try {
       const response = await fetch('/api/calculate', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ data1, data2, data3 })
       });
       
       const data = await response.json();
       document.getElementById('resultValue').textContent = data.result;
     } catch (error) {
       console.error('Ошибка:', error);
     }
   });
   ```

#### Вариант 2B: Python + Flask + openpyxl

1. **Установка зависимостей:**
   ```bash
   pip install flask flask-cors openpyxl
   ```

2. **Создание серверного файла (app.py):**
   ```python
   from flask import Flask, request, jsonify
   from flask_cors import CORS
   from openpyxl import load_workbook
   import os
   
   app = Flask(__name__)
   CORS(app)
   
   @app.route('/api/calculate', methods=['POST'])
   def calculate():
       try:
           data = request.json
           data1 = float(data.get('data1', 0))
           data2 = float(data.get('data2', 0))
           data3 = float(data.get('data3', 0))
           
           # Загрузка Excel-файла
           workbook = load_workbook('calculator.xlsx', data_only=False)
           worksheet = workbook.active
           
           # Установка значений
           worksheet['A1'] = data1
           worksheet['A2'] = data2
           worksheet['A3'] = data3
           
           # Пересчет формул
           workbook.calculation.calculateMode = 'automatic'
           worksheet.calculate_dimension()
           
           # Чтение результата
           result = worksheet['A4'].value
           
           return jsonify({'result': result})
       except Exception as e:
           return jsonify({'error': str(e)}), 500
   
   if __name__ == '__main__':
       app.run(port=5000, debug=True)
   ```

---

## Рекомендации по размещению и безопасности

### Размещение Excel-файла:

1. **Для варианта 1 (фронтенд):**
   - Excel-файл не нужен на сервере
   - Формулы хранятся в JavaScript-коде
   - ✅ Рекомендуется: хранить в системе контроля версий (Git) вместе с кодом

2. **Для варианта 2 (бэкенд):**
   - Excel-файл должен быть на сервере
   - ✅ Рекомендуется: размещать в защищенной директории (например, `/data/` или `/uploads/`)
   - ✅ НЕ размещать в публичной директории (public, www)
   - ✅ Использовать переменные окружения для пути к файлу

### Безопасность:

1. **Валидация входных данных:**
   ```javascript
   function validateInput(value) {
     if (isNaN(value) || !isFinite(value)) {
       throw new Error('Некорректное значение');
     }
     if (value > 1000000 || value < -1000000) {
       throw new Error('Значение вне допустимого диапазона');
     }
     return parseFloat(value);
   }
   ```

2. **Защита от SQL-инъекций:**
   - Excel-файлы не используют SQL, но все равно валидируйте данные

3. **Ограничение размера файла:**
   - Если пользователи загружают свои Excel-файлы, ограничьте размер (например, 5MB)

4. **Rate limiting:**
   - Ограничьте количество запросов от одного IP (для варианта 2)

5. **HTTPS:**
   - Используйте HTTPS для защиты данных при передаче

6. **Логирование:**
   - Логируйте все вычисления для аудита

### Структура файлов (рекомендуемая):

```
project/
├── public/                 # Публичные файлы (для варианта 1)
│   ├── index.html
│   └── js/
│       └── calculator.js
├── server/                 # Серверные файлы (для варианта 2)
│   ├── server.js          # или app.py
│   ├── data/              # Защищенная директория
│   │   └── calculator.xlsx
│   └── .env               # Переменные окружения
├── docs/                  # Документация
│   └── EXCEL_INTEGRATION_GUIDE.md
└── excel-calculator-demo.html  # Демо-файл
```

---

## Примеры использования

### Пример 1: Простая формула
**Excel:** `A4 = (A1 + A2) * A3`

**JavaScript (Вариант 1):**
```javascript
function calculate(data1, data2, data3) {
  return (data1 + data2) * data3;
}
```

### Пример 2: Формула с условием
**Excel:** `A4 = IF(A1 > 100, A2 * 2, A3 / 2)`

**JavaScript (Вариант 1):**
```javascript
function calculate(data1, data2, data3) {
  return data1 > 100 ? data2 * 2 : data3 / 2;
}
```

### Пример 3: Формула с несколькими условиями
**Excel:** `A4 = IF(A1 > 0, IF(A2 > 0, A1*A2, A1/A3), 0)`

**JavaScript (Вариант 1):**
```javascript
function calculate(data1, data2, data3) {
  if (data1 > 0) {
    return data2 > 0 ? data1 * data2 : data1 / data3;
  }
  return 0;
}
```

### Пример 4: Сложная формула (требует Вариант 2)
**Excel:** `A4 = VLOOKUP(A1, Sheet2!A:B, 2, FALSE) * A2 + A3`

Для таких формул нужно использовать бэкенд с библиотекой, поддерживающей формулы Excel.

---

## Выбор варианта

### Используйте Вариант 1, если:
- ✅ Формулы простые (арифметика, IF, SUM, AVERAGE, MAX, MIN)
- ✅ Не более 10-15 формул
- ✅ Нет зависимостей от других листов
- ✅ Хотите быстрое решение без сервера

### Используйте Вариант 2, если:
- ✅ Формулы сложные (VLOOKUP, INDEX, MATCH, сложные массивы)
- ✅ Много формул (десятки)
- ✅ Есть зависимости от других листов
- ✅ Нужна безопасность (логика скрыта)
- ✅ Excel-файл часто меняется

---

## Дополнительные ресурсы

- [Библиотека xlsx для Node.js](https://www.npmjs.com/package/xlsx)
- [Библиотека openpyxl для Python](https://openpyxl.readthedocs.io/)
- [Формулы Excel в JavaScript (formula-parser)](https://www.npmjs.com/package/formula-parser)
- [Библиотека ExcelJS (поддержка формул)](https://github.com/exceljs/exceljs)

---

## Демонстрация

Откройте файл `excel-calculator-demo.html` в браузере для просмотра рабочего примера (Вариант 1).

