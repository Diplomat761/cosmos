<?php
/**
 * API для получения тарифов
 * ЖСК "Космос"
 */

require_once __DIR__ . '/../config.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

try {
    $db = getDB();
    
    // Получаем актуальные тарифы (последние по дате для каждого сервиса)
    $sql = "
        SELECT t1.* 
        FROM tariffs t1
        INNER JOIN (
            SELECT service, MAX(effective_date) as max_date
            FROM tariffs
            GROUP BY service
        ) t2 ON t1.service = t2.service AND t1.effective_date = t2.max_date
        ORDER BY t1.service
    ";
    
    $stmt = $db->query($sql);
    $tariffs = $stmt->fetchAll();
    
    // Форматируем данные
    $formatted = [];
    foreach ($tariffs as $tariff) {
        $formatted[$tariff['service']] = [
            'rate' => (float)$tariff['rate'],
            'effective_date' => date('d.m.Y', strtotime($tariff['effective_date']))
        ];
    }
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => $formatted
    ]);
    
} catch (Exception $e) {
    error_log("Ошибка при получении тарифов: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Ошибка сервера',
        'message' => 'Не удалось загрузить тарифы'
    ]);
}
?>
