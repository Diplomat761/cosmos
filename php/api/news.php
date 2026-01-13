<?php
/**
 * API для получения новостей
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
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
    
    // Формируем запрос
    $sql = "SELECT id, title, content, category, image, publish_date, event_date 
            FROM news 
            WHERE 1=1";
    $params = [];
    
    if ($category && in_array($category, ['news', 'announcement', 'urgent'])) {
        $sql .= " AND category = ?";
        $params[] = $category;
    }
    
    $sql .= " ORDER BY publish_date DESC LIMIT ? OFFSET ?";
    $params[] = $limit;
    $params[] = $offset;
    
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $news = $stmt->fetchAll();
    
    // Форматируем даты для вывода
    foreach ($news as &$item) {
        $item['publish_date'] = date('d.m.Y', strtotime($item['publish_date']));
        if ($item['event_date']) {
            $item['event_date'] = date('d.m.Y', strtotime($item['event_date']));
        }
    }
    
    // Получаем общее количество новостей
    $countSql = "SELECT COUNT(*) as total FROM news";
    $countParams = [];
    if ($category) {
        $countSql .= " WHERE category = ?";
        $countParams[] = $category;
    }
    $countStmt = $db->prepare($countSql);
    $countStmt->execute($countParams);
    $total = $countStmt->fetch()['total'];
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => $news,
        'total' => $total,
        'limit' => $limit,
        'offset' => $offset
    ]);
    
} catch (Exception $e) {
    error_log("Ошибка при получении новостей: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Ошибка сервера',
        'message' => 'Не удалось загрузить новости'
    ]);
}
?>
