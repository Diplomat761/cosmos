#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Графический календарь на Python с использованием Tkinter
"""

import tkinter as tk
from tkinter import ttk, messagebox
import calendar
import datetime


class CalendarGUI:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("Python Календарь")
        self.root.geometry("600x500")
        self.root.resizable(False, False)

        # Текущая дата
        self.current_date = datetime.datetime.now()

        self.setup_ui()
        self.update_calendar()

    def setup_ui(self):
        """Настройка пользовательского интерфейса"""
        # Фрейм для выбора даты
        control_frame = ttk.Frame(self.root, padding="10")
        control_frame.pack(fill=tk.X)

        # Выбор года
        ttk.Label(control_frame, text="Год:").grid(row=0, column=0, padx=5, pady=5)
        self.year_var = tk.StringVar(value=str(self.current_date.year))
        year_spin = ttk.Spinbox(control_frame, from_=1900, to=2100,
                               textvariable=self.year_var, width=10,
                               command=self.update_calendar)
        year_spin.grid(row=0, column=1, padx=5, pady=5)
        year_spin.bind('<Return>', lambda e: self.update_calendar())

        # Выбор месяца
        ttk.Label(control_frame, text="Месяц:").grid(row=0, column=2, padx=5, pady=5)
        self.month_var = tk.StringVar()
        month_combo = ttk.Combobox(control_frame, textvariable=self.month_var,
                                  values=['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                                         'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
                                  state="readonly", width=10)
        month_combo.current(self.current_date.month - 1)
        month_combo.grid(row=0, column=3, padx=5, pady=5)
        month_combo.bind('<<ComboboxSelected>>', lambda e: self.update_calendar())

        # Кнопки навигации
        ttk.Button(control_frame, text="◀", width=3,
                  command=self.previous_month).grid(row=0, column=4, padx=5)
        ttk.Button(control_frame, text="▶", width=3,
                  command=self.next_month).grid(row=0, column=5, padx=5)
        ttk.Button(control_frame, text="Сегодня", command=self.go_to_today).grid(row=0, column=6, padx=10)

        # Фрейм для календаря
        calendar_frame = ttk.Frame(self.root, padding="10")
        calendar_frame.pack(fill=tk.BOTH, expand=True)

        # Заголовок календаря
        self.title_label = ttk.Label(calendar_frame, font=('Arial', 16, 'bold'))
        self.title_label.pack(pady=10)

        # Сетка календаря
        self.calendar_frame = ttk.Frame(calendar_frame)
        self.calendar_frame.pack()

        # Дни недели
        days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
        for i, day in enumerate(days):
            ttk.Label(self.calendar_frame, text=day, font=('Arial', 10, 'bold'),
                     anchor='center').grid(row=0, column=i, padx=2, pady=2, sticky='nsew')

        # Кнопки дней (7x6 сетка)
        self.day_buttons = []
        for row in range(1, 7):
            for col in range(7):
                btn = tk.Button(self.calendar_frame, text="", width=4, height=2,
                               relief='flat', bg='white', command=lambda r=row, c=col: self.day_clicked(r, c))
                btn.grid(row=row, column=col, padx=1, pady=1, sticky='nsew')
                self.day_buttons.append(btn)

        # Информация о дате
        info_frame = ttk.Frame(self.root, padding="10")
        info_frame.pack(fill=tk.X)

        self.date_info_label = ttk.Label(info_frame, text="", font=('Arial', 10))
        self.date_info_label.pack(anchor='w')

    def update_calendar(self):
        """Обновление отображения календаря"""
        try:
            year = int(self.year_var.get())
            month_names = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                          'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
            month = month_names.index(self.month_var.get()) + 1

            # Обновляем заголовок
            self.title_label.config(text=f"{month_names[month-1]} {year}")

            # Получаем данные календаря
            cal = calendar.monthcalendar(year, month)

            # Очищаем предыдущие дни
            for btn in self.day_buttons:
                btn.config(text="", bg='white', state='normal')

            # Заполняем дни
            day_index = 0
            for week in cal:
                for day in week:
                    if day != 0:
                        self.day_buttons[day_index].config(text=str(day))

                        # Выделяем текущий день
                        today = datetime.datetime.now()
                        if (year == today.year and month == today.month and day == today.day):
                            self.day_buttons[day_index].config(bg='lightblue', font=('Arial', 10, 'bold'))

                    day_index += 1
                    if day_index >= 42:  # 6 недель * 7 дней
                        break

            # Обновляем информацию о дате
            self.update_date_info(year, month)

        except ValueError:
            messagebox.showerror("Ошибка", "Некорректный год или месяц")

    def update_date_info(self, year, month):
        """Обновление информации о выбранной дате"""
        try:
            # Количество дней в месяце
            days_in_month = calendar.monthrange(year, month)[1]

            # Високосный год
            is_leap = calendar.isleap(year)

            # День недели первого дня месяца
            first_weekday = calendar.monthrange(year, month)[0]
            weekday_names = ['Понедельник', 'Вторник', 'Среда', 'Четверг',
                           'Пятница', 'Суббота', 'Воскресенье']

            info = f"Дней в месяце: {days_in_month} | Первый день: {weekday_names[first_weekday]}"
            if is_leap:
                info += " | Високосный год"

            self.date_info_label.config(text=info)

        except:
            self.date_info_label.config(text="")

    def previous_month(self):
        """Переход к предыдущему месяцу"""
        month_names = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
        current_month = month_names.index(self.month_var.get())

        if current_month == 0:  # Январь
            year = int(self.year_var.get()) - 1
            month = 11  # Декабрь
        else:
            year = int(self.year_var.get())
            month = current_month - 1

        self.year_var.set(str(year))
        self.month_var.set(month_names[month])
        self.update_calendar()

    def next_month(self):
        """Переход к следующему месяцу"""
        month_names = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
        current_month = month_names.index(self.month_var.get())

        if current_month == 11:  # Декабрь
            year = int(self.year_var.get()) + 1
            month = 0  # Январь
        else:
            year = int(self.year_var.get())
            month = current_month + 1

        self.year_var.set(str(year))
        self.month_var.set(month_names[month])
        self.update_calendar()

    def go_to_today(self):
        """Переход к текущему месяцу"""
        today = datetime.datetime.now()
        month_names = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']

        self.year_var.set(str(today.year))
        self.month_var.set(month_names[today.month - 1])
        self.update_calendar()

    def day_clicked(self, row, col):
        """Обработка клика по дню"""
        # Находим номер дня
        day_index = (row - 1) * 7 + col
        if day_index < len(self.day_buttons):
            day_text = self.day_buttons[day_index].cget('text')
            if day_text:
                year = int(self.year_var.get())
                month_names = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                              'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
                month = month_names.index(self.month_var.get()) + 1

                try:
                    selected_date = datetime.datetime(year, month, int(day_text))
                    weekday_names = ['Понедельник', 'Вторник', 'Среда', 'Четверг',
                                   'Пятница', 'Суббота', 'Воскресенье']
                    messagebox.showinfo("Выбранная дата",
                                      f"{int(day_text):02d}.{month:02d}.{year}\n"
                                      f"{weekday_names[selected_date.weekday()]}")
                except:
                    pass

    def run(self):
        """Запуск приложения"""
        self.root.mainloop()


def main():
    """Главная функция"""
    app = CalendarGUI()
    app.run()


if __name__ == "__main__":
    main()
