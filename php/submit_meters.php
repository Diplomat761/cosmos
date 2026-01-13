<?php
/**
 * Обработка формы передачи показаний счетчиков
 * ЖСК "Космос"
 */

require_once __DIR__ . '/config.php';

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

try {
    $db = getDB();
    
    // Находим пользователя по номеру квартиры
    $stmt = $db->prepare("SELECT id FROM users WHERE apartment_number = ? AND status = 'active'");
    $stmt->execute([$data['apartment']]);
    $user = $stmt->fetch();
    
    if (!$user) {
        http_response_code(404);
        echo json_encode(['error' => 'Квартира не найдена или неактивна']);
        exit;
    }
    
    $apartmentId = $user['id'];
    
    // Проверяем, не были ли уже переданы показания за этот месяц
    $dateObj = new DateTime($data['date']);
    $year = $dateObj->format('Y');
    $month = $dateObj->format('m');
    
    $stmt = $db->prepare("
        SELECT id FROM meter_readings 
        WHERE apartment_id = ? 
        AND YEAR(date) = ? 
        AND MONTH(date) = ?
        AND status != 'rejected'
    ");
    $stmt->execute([$apartmentId, $year, $month]);
    $existing = $stmt->fetch();
    
    if ($existing) {
        http_response_code(409);
        echo json_encode([
            'error' => 'Показания за этот месяц уже были переданы',
            'message' => 'Вы можете отредактировать существующие показания через административную панель'
        ]);
        exit;
    }
    
    // Сохраняем показания в базу данных
    $stmt = $db->prepare("
        INSERT INTO meter_readings 
        (apartment_id, date, cold_water, hot_water, electricity, status) 
        VALUES (?, ?, ?, ?, ?, 'pending')
    ");
    
    $stmt->execute([
        $apartmentId,
        $data['date'],
        $data['coldWater'],
        $data['hotWater'],
        $data['electricity']
    ]);
    
    $readingId = $db->lastInsertId();
    
    // Логирование успешной операции
    error_log("Показания сохранены: ID={$readingId}, Квартира={$data['apartment']}, Дата={$data['date']}");
    
    // Успешный ответ
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Показания успешно приняты и отправлены на проверку',
        'data' => [
            'id' => $readingId,
            'apartment' => $data['apartment'],
            'date' => $data['date'],
            'status' => 'pending'
        ]
    ]);
    
} catch (PDOException $e) {
    error_log("Ошибка БД при сохранении показаний: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Ошибка сервера',
        'message' => 'Не удалось сохранить показания. Попробуйте позже.'
    ]);
} catch (Exception $e) {
    error_log("Ошибка при сохранении показаний: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Ошибка сервера',
        'message' => 'Произошла ошибка при обработке запроса.'
    ]);
}
?>

