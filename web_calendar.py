#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Веб-календарь на Flask
Запуск: python web_calendar.py
Затем открыть http://localhost:5000
"""

from flask import Flask, render_template_string, request, jsonify
import calendar
import datetime
import json

app = Flask(__name__)

# HTML шаблон для календаря
HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Python Веб-Календарь</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            padding: 30px;
        }
        h1 {
            text-align: center;
            color: #333;
            margin-bottom: 30px;
            font-size: 2.5em;
        }
        .controls {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 20px;
            margin-bottom: 30px;
            flex-wrap: wrap;
        }
        select, button {
            padding: 10px 15px;
            font-size: 16px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        select {
            background: #f8f9fa;
            color: #333;
        }
        button {
            background: #007bff;
            color: white;
        }
        button:hover {
            background: #0056b3;
            transform: translateY(-2px);
        }
        .calendar {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 5px;
            margin-bottom: 20px;
        }
        .day-name {
            background: #343a40;
            color: white;
            padding: 15px;
            text-align: center;
            font-weight: bold;
            border-radius: 8px;
        }
        .day {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            padding: 15px;
            text-align: center;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            min-height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .day:hover {
            background: #e9ecef;
            transform: scale(1.05);
        }
        .day.today {
            background: #007bff;
            color: white;
            font-weight: bold;
        }
        .day.empty {
            background: transparent;
            border: none;
            cursor: default;
        }
        .day.empty:hover {
            background: transparent;
            transform: none;
        }
        .info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
        }
        .info h3 {
            margin-top: 0;
            color: #333;
        }
        .year-view {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-top: 20px;
        }
        .month-mini {
            background: white;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 10px;
        }
        .month-mini h4 {
            text-align: center;
            margin: 0 0 10px 0;
            color: #333;
        }
        .month-mini .calendar {
            grid-template-columns: repeat(7, 1fr);
            gap: 2px;
        }
        .month-mini .day {
            padding: 5px;
            min-height: 20px;
            font-size: 12px;
        }
        .month-mini .day-name {
            padding: 5px;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🐍 Python Календарь</h1>

        <div class="controls">
            <select id="yearSelect">
                <!-- Годы будут добавлены JavaScript -->
            </select>

            <select id="monthSelect">
                <option value="1">Январь</option>
                <option value="2">Февраль</option>
                <option value="3">Март</option>
                <option value="4">Апрель</option>
                <option value="5">Май</option>
                <option value="6">Июнь</option>
                <option value="7">Июль</option>
                <option value="8">Август</option>
                <option value="9">Сентябрь</option>
                <option value="10">Октябрь</option>
                <option value="11">Ноябрь</option>
                <option value="12">Декабрь</option>
            </select>

            <button onclick="showMonth()">Показать месяц</button>
            <button onclick="showYear()">Показать год</button>
            <button onclick="goToToday()">Сегодня</button>
        </div>

        <div id="calendarContainer">
            <!-- Календарь будет вставлен здесь -->
        </div>
    </div>

    <script>
        let currentYear = new Date().getFullYear();
        let currentMonth = new Date().getMonth() + 1;

        // Заполняем года
        const yearSelect = document.getElementById('yearSelect');
        for (let year = currentYear - 10; year <= currentYear + 10; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            if (year === currentYear) option.selected = true;
            yearSelect.appendChild(option);
        }

        // Устанавливаем текущий месяц
        document.getElementById('monthSelect').value = currentMonth;

        function showMonth() {
            const year = document.getElementById('yearSelect').value;
            const month = document.getElementById('monthSelect').value;

            fetch(`/api/calendar/${year}/${month}`)
                .then(response => response.json())
                .then(data => {
                    document.getElementById('calendarContainer').innerHTML = data.html;
                    currentYear = parseInt(year);
                    currentMonth = parseInt(month);
                });
        }

        function showYear() {
            const year = document.getElementById('yearSelect').value;

            fetch(`/api/year/${year}`)
                .then(response => response.json())
                .then(data => {
                    document.getElementById('calendarContainer').innerHTML = data.html;
                    currentYear = parseInt(year);
                });
        }

        function goToToday() {
            const today = new Date();
            document.getElementById('yearSelect').value = today.getFullYear();
            document.getElementById('monthSelect').value = today.getMonth() + 1;
            showMonth();
        }

        function dayClicked(day, month, year) {
            if (day) {
                alert(`Выбрана дата: ${day.toString().padStart(2, '0')}.${month.toString().padStart(2, '0')}.${year}`);
            }
        }

        // Показываем календарь при загрузке страницы
        showMonth();
    </script>
</body>
</html>
"""


@app.route('/')
def index():
    """Главная страница"""
    return render_template_string(HTML_TEMPLATE)


@app.route('/api/calendar/<int:year>/<int:month>')
def get_calendar(year, month):
    """API для получения календаря месяца"""
    try:
        # Получаем календарь
        cal = calendar.monthcalendar(year, month)
        month_names = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']

        # Создаем HTML для календаря
        html = f'<h2 style="text-align: center; margin-bottom: 20px;">{month_names[month-1]} {year}</h2>'

        # Дни недели
        html += '<div class="calendar">'
        days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
        for day in days:
            html += f'<div class="day-name">{day}</div>'

        # Дни месяца
        today = datetime.datetime.now()
        for week in cal:
            for day in week:
                if day == 0:
                    html += '<div class="day empty"></div>'
                else:
                    css_class = 'day'
                    if (year == today.year and month == today.month and day == today.day):
                        css_class += ' today'

                    html += f'<div class="{css_class}" onclick="dayClicked({day}, {month}, {year})">{day}</div>'

        html += '</div>'

        # Информация о месяце
        days_in_month = calendar.monthrange(year, month)[1]
        is_leap = calendar.isleap(year)

        info_html = f'''
        <div class="info">
            <h3>Информация о месяце</h3>
            <p>Дней в месяце: {days_in_month}</p>
            <p>Високосный год: {'Да' if is_leap else 'Нет'}</p>
        </div>
        '''

        html += info_html

        return jsonify({'html': html})

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/year/<int:year>')
def get_year_calendar(year):
    """API для получения календаря года"""
    try:
        month_names = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']

        html = f'<h2 style="text-align: center; margin-bottom: 20px;">Календарь {year} года</h2>'
        html += '<div class="year-view">'

        for month in range(1, 13):
            cal = calendar.monthcalendar(year, month)

            html += f'<div class="month-mini">'
            html += f'<h4>{month_names[month-1]}</h4>'
            html += '<div class="calendar">'

            # Дни недели (мини)
            days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
            for day in days:
                html += f'<div class="day-name">{day[0]}</div>'  # Только первая буква

            # Дни месяца (мини)
            today = datetime.datetime.now()
            for week in cal:
                for day in week:
                    if day == 0:
                        html += '<div class="day empty"></div>'
                    else:
                        css_class = 'day'
                        if (year == today.year and month == today.month and day == today.day):
                            css_class += ' today'
                        html += f'<div class="{css_class}">{day}</div>'

            html += '</div></div>'

        html += '</div>'

        return jsonify({'html': html})

    except Exception as e:
        return jsonify({'error': str(e)}), 400


if __name__ == '__main__':
    print("Запуск веб-календаря...")
    print("Откройте в браузере: http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
