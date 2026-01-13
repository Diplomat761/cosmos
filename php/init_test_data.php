<?php
/**
 * Скрипт для добавления тестовых данных в базу данных
 * ЖСК "Космос"
 * 
 * ВНИМАНИЕ: Используйте только для разработки и тестирования!
 * Не запускайте на продакшене!
 */

require_once __DIR__ . '/config.php';

// Проверка, что скрипт запущен не на продакшене (можно добавить дополнительную проверку)
if ($_SERVER['SERVER_NAME'] !== 'localhost' && $_SERVER['SERVER_NAME'] !== '127.0.0.1') {
    die('Этот скрипт можно запускать только на локальном сервере!');
}

try {
    $db = getDB();
    
    echo "Добавление тестовых данных...\n\n";
    
    // Проверяем, есть ли уже новости
    $stmt = $db->query("SELECT COUNT(*) as count FROM news");
    $newsCount = $stmt->fetch()['count'];
    
    if ($newsCount == 0) {
        // Добавляем тестовые новости
        $news = [
            [
                'title' => 'Отключение воды',
                'content' => 'Уважаемые жильцы! 20 мая с 9:00 до 17:00 будет произведено плановое отключение холодной воды для проведения ремонтных работ на водопроводной сети. Просим заранее подготовить запас воды для бытовых нужд.',
                'category' => 'urgent',
                'publish_date' => date('Y-m-d H:i:s', strtotime('-5 days'))
            ],
            [
                'title' => 'Собрание жильцов',
                'content' => 'Приглашаем всех собственников квартир на общее собрание, которое состоится 20 мая в 18:00 в актовом зале. На повестке дня: вопросы благоустройства территории и выборы в правление. Ваше участие очень важно!',
                'category' => 'announcement',
                'publish_date' => date('Y-m-d H:i:s', strtotime('-10 days'))
            ],
            [
                'title' => 'Озеленение территории',
                'content' => 'Завершены работы по озеленению придомовой территории. Высажены новые деревья и кустарники. Просим бережно относиться к зелёным насаждениям и не повреждать их. Вместе мы создаём красивую и уютную среду для жизни!',
                'category' => 'news',
                'publish_date' => date('Y-m-d H:i:s', strtotime('-15 days'))
            ],
            [
                'title' => 'График передачи показаний',
                'content' => 'Напоминаем, что показания счетчиков принимаются с 20 по 25 число каждого месяца. Пожалуйста, передавайте показания вовремя для корректного начисления платежей. Это поможет избежать перерасчётов и дополнительных расходов.',
                'category' => 'announcement',
                'publish_date' => date('Y-m-d H:i:s', strtotime('-20 days'))
            ],
            [
                'title' => 'Весенний субботник',
                'content' => 'Организуется субботник по уборке и озеленению территории 12 мая в 10:00. Приглашаем всех желающих принять участие в посадке деревьев! Вместе мы сделаем наш двор ещё красивее и уютнее. Инвентарь будет предоставлен.',
                'category' => 'news',
                'publish_date' => date('Y-m-d H:i:s', strtotime('-25 days'))
            ]
        ];
        
        $stmt = $db->prepare("
            INSERT INTO news (title, content, category, publish_date) 
            VALUES (?, ?, ?, ?)
        ");
        
        foreach ($news as $item) {
            $stmt->execute([
                $item['title'],
                $item['content'],
                $item['category'],
                $item['publish_date']
            ]);
        }
        
        echo "✓ Добавлено " . count($news) . " новостей\n";
    } else {
        echo "⚠ Новости уже существуют в базе данных ($newsCount записей)\n";
    }
    
    // Проверяем тарифы
    $stmt = $db->query("SELECT COUNT(*) as count FROM tariffs");
    $tariffsCount = $stmt->fetch()['count'];
    
    if ($tariffsCount == 0) {
        // Тарифы уже должны быть в SQL файле, но на всякий случай
        $tariffs = [
            ['service' => 'cold_water', 'rate' => 50.00, 'effective_date' => date('Y-m-d')],
            ['service' => 'hot_water', 'rate' => 50.00, 'effective_date' => date('Y-m-d')],
            ['service' => 'electricity', 'rate' => 5.00, 'effective_date' => date('Y-m-d')]
        ];
        
        $stmt = $db->prepare("
            INSERT INTO tariffs (service, rate, effective_date) 
            VALUES (?, ?, ?)
        ");
        
        foreach ($tariffs as $tariff) {
            $stmt->execute([
                $tariff['service'],
                $tariff['rate'],
                $tariff['effective_date']
            ]);
        }
        
        echo "✓ Добавлены тарифы\n";
    } else {
        echo "✓ Тарифы уже существуют в базе данных ($tariffsCount записей)\n";
    }
    
    echo "\n✓ Тестовые данные успешно добавлены!\n";
    echo "Теперь вы можете открыть сайт и проверить работу.\n";
    
} catch (Exception $e) {
    echo "ОШИБКА: " . $e->getMessage() . "\n";
    error_log("Ошибка при добавлении тестовых данных: " . $e->getMessage());
}
?>
