<?php
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Метод не поддерживается']);
    exit;
}

$orderID = $_POST['orderID'] ?? null;

if (!$orderID) {
    echo json_encode(['success' => false, 'message' => 'Отсутствует ID заказа']);
    exit;
}

try {
    $db = new PDO('sqlite:db.sqlite3');
    $stmt = $db->prepare("UPDATE Orders SET orderStatus = 'Готово' WHERE orderID = ?");
    $res = $stmt->execute([$orderID]);

    if ($res) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Ошибка обновления статуса']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Ошибка сервера']);
}
