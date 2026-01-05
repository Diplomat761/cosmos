<?php
/**
 * Обработка формы подачи заявок
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

// Генерация номера заявки (если не передан)
if (empty($data['number'])) {
    $year = date('Y');
    // В реальном проекте номер должен браться из базы данных
    $counter = rand(1000, 9999);
    $data['number'] = "ЖСК-{$year}-{$counter}";
}

// Обработка загруженного файла (если есть)
$photoPath = null;
if (!empty($data['photo'])) {
    // В реальном проекте здесь должна быть обработка base64 изображения
    // и сохранение файла на сервере
    $photoPath = 'uploads/' . uniqid() . '.jpg';
    // file_put_contents($photoPath, base64_decode($data['photo']));
}

// Здесь должна быть логика сохранения в базу данных
// Например:
// $db = new PDO(...);
// $stmt = $db->prepare("INSERT INTO requests ...");
// $stmt->execute([...]);

// Логирование (для отладки)
error_log('Получена заявка: ' . json_encode($data, JSON_UNESCAPED_UNICODE));

// Успешный ответ
http_response_code(200);
echo json_encode([
    'success' => true,
    'message' => 'Заявка успешно принята',
    'data' => [
        'number' => $data['number'],
        'status' => 'accepted'
    ]
]);
?>

