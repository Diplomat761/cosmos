<?php
/**
 * Обработка формы подачи заявок
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

if (empty($data['requestType']) || !in_array($data['requestType'], ['plumber', 'electrician', 'chairman'])) {
    $errors[] = 'Некорректный тип заявки';
}

if (empty($data['apartment']) || !is_numeric($data['apartment']) || $data['apartment'] < 1 || $data['apartment'] > 80) {
    $errors[] = 'Некорректный номер квартиры';
}

if (empty($data['name']) || strlen($data['name']) < 3) {
    $errors[] = 'Некорректное имя';
}

if (empty($data['phone']) || strlen(preg_replace('/\D/', '', $data['phone'])) < 11) {
    $errors[] = 'Некорректный номер телефона';
}

if (empty($data['subject']) || strlen($data['subject']) < 3) {
    $errors[] = 'Некорректная тема заявки';
}

if (empty($data['description']) || strlen($data['description']) < 10 || strlen($data['description']) > 500) {
    $errors[] = 'Описание должно содержать от 10 до 500 символов';
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
    
    // Генерация уникального номера заявки
    $year = date('Y');
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM requests WHERE request_number LIKE ?");
    $stmt->execute(["ЖСК-{$year}-%"]);
    $count = $stmt->fetch()['count'];
    $requestNumber = "ЖСК-{$year}-" . str_pad($count + 1, 4, '0', STR_PAD_LEFT);
    
    // Проверяем уникальность номера
    $stmt = $db->prepare("SELECT id FROM requests WHERE request_number = ?");
    $stmt->execute([$requestNumber]);
    if ($stmt->fetch()) {
        $requestNumber = "ЖСК-{$year}-" . str_pad($count + 2, 4, '0', STR_PAD_LEFT);
    }
    
    // Обработка загруженного файла (если есть)
    $photoPath = null;
    if (!empty($data['photo'])) {
        // Создаем директорию для загрузок, если её нет
        $uploadDir = __DIR__ . '/../uploads/requests/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        
        // Декодируем base64 изображение
        $imageData = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $data['photo']));
        if ($imageData !== false) {
            $photoFileName = uniqid('request_', true) . '.jpg';
            $photoPath = 'uploads/requests/' . $photoFileName;
            $fullPath = $uploadDir . $photoFileName;
            
            if (file_put_contents($fullPath, $imageData)) {
                $photoPath = $photoPath;
            } else {
                error_log("Не удалось сохранить фото заявки: {$fullPath}");
            }
        }
    }
    
    // Сохраняем заявку в базу данных
    $stmt = $db->prepare("
        INSERT INTO requests 
        (apartment_id, request_number, type, fio, phone, subject, description, photo, urgency, desired_time, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')
    ");
    
    $stmt->execute([
        $apartmentId,
        $requestNumber,
        $data['requestType'],
        $data['name'],
        $data['phone'],
        $data['subject'],
        $data['description'],
        $photoPath,
        !empty($data['urgency']) ? 1 : 0,
        $data['desiredTime'] ?? null
    ]);
    
    $requestId = $db->lastInsertId();
    
    // Логирование успешной операции
    error_log("Заявка сохранена: ID={$requestId}, Номер={$requestNumber}, Квартира={$data['apartment']}");
    
    // Успешный ответ
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Заявка успешно принята',
        'data' => [
            'id' => $requestId,
            'number' => $requestNumber,
            'status' => 'new'
        ]
    ]);
    
} catch (PDOException $e) {
    error_log("Ошибка БД при сохранении заявки: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Ошибка сервера',
        'message' => 'Не удалось сохранить заявку. Попробуйте позже.'
    ]);
} catch (Exception $e) {
    error_log("Ошибка при сохранении заявки: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Ошибка сервера',
        'message' => 'Произошла ошибка при обработке запроса.'
    ]);
}
?>

