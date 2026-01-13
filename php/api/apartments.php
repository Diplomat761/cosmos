<?php
/**
 * API для получения списка квартир
 * ЖСК "Космос"
 */

require_once __DIR__ . '/../config.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

try {
    $db = getDB();
    
    // Получаем параметры запроса
    $onlyActive = isset($_GET['active']) ? (bool)$_GET['active'] : false;
    
    // Формируем запрос
    if ($onlyActive) {
        $sql = "SELECT DISTINCT apartment_number, fio, status 
                FROM users 
                WHERE status = 'active'
                ORDER BY apartment_number ASC";
    } else {
        $sql = "SELECT DISTINCT apartment_number, fio, status 
                FROM users 
                ORDER BY apartment_number ASC";
    }
    
    $stmt = $db->query($sql);
    $apartments = $stmt->fetchAll();
    
    // Форматируем данные
    $formatted = [];
    foreach ($apartments as $apt) {
        $formatted[] = [
            'number' => (int)$apt['apartment_number'],
            'fio' => $apt['fio'],
            'status' => $apt['status']
        ];
    }
    
    // Если квартир нет в БД, возвращаем список от 1 до 80
    if (empty($formatted)) {
        for ($i = 1; $i <= 80; $i++) {
            $formatted[] = [
                'number' => $i,
                'fio' => null,
                'status' => 'unknown'
            ];
        }
    }
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => $formatted
    ]);
    
} catch (Exception $e) {
    error_log("Ошибка при получении списка квартир: " . $e->getMessage());
    
    // В случае ошибки возвращаем список от 1 до 80
    $fallback = [];
    for ($i = 1; $i <= 80; $i++) {
        $fallback[] = [
            'number' => $i,
            'fio' => null,
            'status' => 'unknown'
        ];
    }
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => $fallback,
        'warning' => 'Данные загружены из резервного списка'
    ]);
}
?>
