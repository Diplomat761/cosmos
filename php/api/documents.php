<?php
/**
 * API для получения документов
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
    $category = $_GET['category'] ?? null;
    
    // Формируем запрос
    $sql = "SELECT id, title, category, file_path, description, upload_date 
            FROM documents 
            WHERE 1=1";
    $params = [];
    
    if ($category && in_array($category, ['charter', 'protocols', 'financial', 'receipts'])) {
        $sql .= " AND category = ?";
        $params[] = $category;
    }
    
    $sql .= " ORDER BY upload_date DESC";
    
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $documents = $stmt->fetchAll();
    
    // Форматируем даты
    foreach ($documents as &$doc) {
        $doc['upload_date'] = date('d.m.Y', strtotime($doc['upload_date']));
    }
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => $documents
    ]);
    
} catch (Exception $e) {
    error_log("Ошибка при получении документов: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Ошибка сервера',
        'message' => 'Не удалось загрузить документы'
    ]);
}
?>
