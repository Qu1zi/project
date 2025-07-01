<?php
header('Content-Type: application/json'); // Добавляем правильный заголовок

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $orderID = $_POST['orderID'];

    try {
        $db = new PDO('sqlite:db.sqlite3');
        $stmt = $db->prepare("UPDATE Orders SET orderStatus = 'В работе' WHERE orderID = ?");
        $stmt->execute([$orderID]);

        // Возвращаем JSON вместо редиректа
        echo json_encode([
            'success' => true,
            'message' => 'Заказ #' . $orderID . ' успешно запущен в производство'
        ]);
        exit;
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Ошибка запуска заказа: ' . $e->getMessage()
        ]);
        exit;
    }
}
?>