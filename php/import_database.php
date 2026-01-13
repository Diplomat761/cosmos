<?php
/**
 * Скрипт для импорта базы данных
 * ЖСК "Космос"
 * 
 * ВНИМАНИЕ: Используйте только для первоначальной настройки!
 * После импорта удалите или защитите этот файл!
 */

// Проверка безопасности (можно добавить пароль или IP-проверку)
$allowed = true; // Измените на false после импорта или добавьте проверку

if (!$allowed) {
    die('Доступ запрещен. Этот скрипт можно использовать только один раз.');
}

require_once __DIR__ . '/config.php';

?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Импорт базы данных - ЖСК "Космос"</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2d5a27;
            margin-bottom: 20px;
        }
        .success {
            background: #d4edda;
            color: #155724;
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
        }
        .error {
            background: #f8d7da;
            color: #721c24;
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
        }
        .info {
            background: #d1ecf1;
            color: #0c5460;
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
        }
        .warning {
            background: #fff3cd;
            color: #856404;
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
        }
        pre {
            background: #f8f9fa;
            padding: 10px;
            border-radius: 5px;
            overflow-x: auto;
        }
        button {
            background: #2d5a27;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            margin-top: 10px;
        }
        button:hover {
            background: #1e3d1a;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Импорт базы данных ЖСК "Космос"</h1>
        
        <?php
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['import'])) {
            try {
                $db = getDB();
                
                echo '<div class="info">Начинаю импорт базы данных...</div>';
                
                // Читаем SQL файл
                $sqlFile = __DIR__ . '/../jsk_kosmos.sql';
                
                if (!file_exists($sqlFile)) {
                    throw new Exception("SQL файл не найден: $sqlFile");
                }
                
                $sql = file_get_contents($sqlFile);
                
                if ($sql === false) {
                    throw new Exception("Не удалось прочитать SQL файл");
                }
                
                // Удаляем комментарии и команды, которые могут вызвать проблемы
                $sql = preg_replace('/--.*$/m', '', $sql); // Удаляем однострочные комментарии
                $sql = preg_replace('/\/\*.*?\*\//s', '', $sql); // Удаляем многострочные комментарии
                
                // Разбиваем на отдельные запросы
                $queries = array_filter(
                    array_map('trim', explode(';', $sql)),
                    function($query) {
                        return !empty($query) && 
                               !preg_match('/^(SET|START|COMMIT|USE|CREATE DATABASE)/i', $query);
                    }
                );
                
                $successCount = 0;
                $errorCount = 0;
                $errors = [];
                
                // Выполняем запросы по одному
                foreach ($queries as $query) {
                    if (empty(trim($query))) {
                        continue;
                    }
                    
                    try {
                        $db->exec($query);
                        $successCount++;
                    } catch (PDOException $e) {
                        $errorCount++;
                        // Игнорируем ошибки о существующих таблицах/индексах
                        if (strpos($e->getMessage(), 'already exists') === false && 
                            strpos($e->getMessage(), 'Duplicate') === false) {
                            $errors[] = $e->getMessage();
                        }
                    }
                }
                
                echo '<div class="success">';
                echo "<strong>Импорт завершен!</strong><br>";
                echo "Успешно выполнено запросов: $successCount<br>";
                if ($errorCount > 0) {
                    echo "Пропущено запросов (уже существуют): $errorCount<br>";
                }
                echo '</div>';
                
                if (!empty($errors)) {
                    echo '<div class="error">';
                    echo "<strong>Ошибки:</strong><br>";
                    echo '<pre>' . htmlspecialchars(implode("\n", array_slice($errors, 0, 10))) . '</pre>';
                    if (count($errors) > 10) {
                        echo '<p>... и еще ' . (count($errors) - 10) . ' ошибок</p>';
                    }
                    echo '</div>';
                }
                
                // Проверяем, что таблицы созданы
                $tables = ['users', 'news', 'requests', 'meter_readings', 'tariffs', 'documents'];
                $existingTables = [];
                
                foreach ($tables as $table) {
                    try {
                        $stmt = $db->query("SELECT COUNT(*) FROM `$table`");
                        $count = $stmt->fetchColumn();
                        $existingTables[$table] = $count;
                    } catch (PDOException $e) {
                        $existingTables[$table] = 'не существует';
                    }
                }
                
                echo '<div class="info">';
                echo "<strong>Проверка таблиц:</strong><br>";
                echo '<pre>';
                foreach ($existingTables as $table => $count) {
                    echo "$table: " . ($count === 'не существует' ? '<span style="color:red">' . $count . '</span>' : "$count записей") . "\n";
                }
                echo '</pre>';
                echo '</div>';
                
                echo '<div class="warning">';
                echo '<strong>Важно:</strong> После успешного импорта рекомендуется удалить или защитить этот файл!';
                echo '</div>';
                
            } catch (Exception $e) {
                echo '<div class="error">';
                echo "<strong>Ошибка импорта:</strong><br>";
                echo htmlspecialchars($e->getMessage());
                echo '</div>';
            }
        } else {
            // Показываем форму
            try {
                $db = getDB();
                
                // Проверяем существующие таблицы
                $tables = ['users', 'news', 'requests', 'meter_readings', 'tariffs', 'documents'];
                $existingTables = [];
                
                foreach ($tables as $table) {
                    try {
                        $stmt = $db->query("SELECT COUNT(*) FROM `$table`");
                        $count = $stmt->fetchColumn();
                        $existingTables[$table] = $count;
                    } catch (PDOException $e) {
                        $existingTables[$table] = false;
                    }
                }
                
                $hasTables = in_array(true, array_map(function($v) { return $v !== false; }, $existingTables));
                
                if ($hasTables) {
                    echo '<div class="warning">';
                    echo '<strong>Внимание!</strong> В базе данных уже существуют таблицы:<br>';
                    echo '<pre>';
                    foreach ($existingTables as $table => $count) {
                        if ($count !== false) {
                            echo "$table: $count записей\n";
                        }
                    }
                    echo '</pre>';
                    echo 'Импорт может перезаписать существующие данные. Продолжить?';
                    echo '</div>';
                } else {
                    echo '<div class="info">';
                    echo 'База данных пуста. Готов к импорту.';
                    echo '</div>';
                }
                
                echo '<form method="POST">';
                echo '<button type="submit" name="import" value="1">Начать импорт</button>';
                echo '</form>';
                
            } catch (Exception $e) {
                echo '<div class="error">';
                echo '<strong>Ошибка подключения к базе данных:</strong><br>';
                echo htmlspecialchars($e->getMessage());
                echo '<br><br>Проверьте настройки в <code>php/config.php</code>';
                echo '</div>';
            }
        }
        ?>
    </div>
</body>
</html>
