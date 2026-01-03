<?php
/**
 * Обработка формы передачи показаний счетчиков
 * ЖСК "Космос"
 * 
 * ВНИМАНИЕ: Это заглушка для демонстрации.
 * В реальном проекте здесь должна быть обработка данных,
 * сохранение в базу данных, отправка уведомлений и т.д.
 */

header('Content-Type: application/json; charset=utf-8');

// Разрешаем CORS (для разработки)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Обрабатываем только POST запросы
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Метод не разрешен']);
    exit;
}

// Получаем данные из запроса
$data = json_decode(file_get_contents('php://input'), true);

// Валидация данных
$errors = [];

if (empty($data['apartment']) || !is_numeric($data['apartment']) || $data['apartment'] < 1 || $data['apartment'] > 80) {
    $errors[] = 'Некорректный номер квартиры';
}

if (empty($data['name']) || strlen($data['name']) < 5) {
    $errors[] = 'Некорректное ФИО';
}

if (empty($data['date'])) {
    $errors[] = 'Не указана дата';
}

if (empty($data['coldWater']) || !is_numeric($data['coldWater']) || $data['coldWater'] < 0) {
    $errors[] = 'Некорректные показания холодной воды';
}

if (empty($data['hotWater']) || !is_numeric($data['hotWater']) || $data['hotWater'] < 0) {
    $errors[] = 'Некорректные показания горячей воды';
}

if (empty($data['electricity']) || !is_numeric($data['electricity']) || $data['electricity'] < 0) {
    $errors[] = 'Некорректные показания электричества';
}

// Если есть ошибки, возвращаем их
if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['error' => 'Ошибки валидации', 'details' => $errors]);
    exit;
}

// Здесь должна быть логика сохранения в базу данных
// Например:
// $db = new PDO(...);
// $stmt = $db->prepare("INSERT INTO meter_readings ...");
// $stmt->execute([...]);

// Логирование (для отладки)
error_log('Получены показания счетчиков: ' . json_encode($data, JSON_UNESCAPED_UNICODE));

// Успешный ответ
http_response_code(200);
echo json_encode([
    'success' => true,
    'message' => 'Показания успешно приняты',
    'data' => [
        'apartment' => $data['apartment'],
        'date' => $data['date']
    ]
]);
?>

