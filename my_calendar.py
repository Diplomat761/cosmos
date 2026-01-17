#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Календарь на Python
Поддерживает отображение календаря на заданный год и месяц
"""

import calendar
import datetime
import locale

# Устанавливаем русскую локаль
try:
    locale.setlocale(locale.LC_ALL, 'ru_RU.UTF-8')
except:
    try:
        locale.setlocale(locale.LC_ALL, 'Russian_Russia')
    except:
        pass  # Если локаль недоступна, оставляем английскую


def show_current_month():
    """Показать календарь текущего месяца"""
    now = datetime.datetime.now()
    return show_month(now.year, now.month)

def show_month(year, month):
    """Показать календарь заданного года и месяца"""
    try:
        # Проверяем корректность даты
        if not (1 <= month <= 12):
            return f"Ошибка: месяц должен быть от 1 до 12, получено: {month}"

        # Создаем текстовый календарь (понедельник - первый день)
        cal = calendar.TextCalendar(calendar.MONDAY)
        cal_str = cal.formatmonth(year, month)

        # Добавляем заголовок
        month_names = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
        header = f"\n{'='*30}\n     {month_names[month-1]} {year}\n{'='*30}\n"

        return header + cal_str

    except Exception as e:
        return f"Ошибка при создании календаря: {e}"

def show_year(year):
    """Показать календарь на весь год"""
    try:
        # Создаем текстовый календарь
        cal = calendar.TextCalendar(calendar.MONDAY)
        cal_str = cal.formatyear(year)
        header = f"\n{'='*50}\n           КАЛЕНДАРЬ {year} ГОДА\n{'='*50}\n"
        return header + cal_str
    except Exception as e:
        return f"Ошибка при создании календаря: {e}"

def get_current_date_info():
    """Получить информацию о текущей дате"""
    now = datetime.datetime.now()
    weekday_names = ['Понедельник', 'Вторник', 'Среда', 'Четверг',
                    'Пятница', 'Суббота', 'Воскресенье']

    info = f"""
Текущая дата: {now.strftime('%d.%m.%Y')}
День недели: {weekday_names[now.weekday()]}
Время: {now.strftime('%H:%M:%S')}
Номер недели в году: {now.isocalendar()[1]}
День в году: {now.timetuple().tm_yday}
    """
    return info.strip()

def is_leap_year(year):
    """Проверить, является ли год високосным"""
    return calendar.isleap(year)


def main():
    """Главная функция для демонстрации работы календаря"""
    print("Добро пожаловать в Python Календарь!")
    print("=" * 40)

    # Показываем текущий месяц
    print(show_current_month())

    # Показываем информацию о текущей дате
    print("\n" + get_current_date_info())

    # Примеры использования
    print("\nПримеры использования:")
    print("- show_month(2024, 1)  # Календарь на январь 2024")
    print("- show_year(2024)       # Календарь на весь 2024 год")
    print("- is_leap_year(2024)    # Проверить високосный год")


if __name__ == "__main__":
    main()
