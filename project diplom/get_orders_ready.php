<?php
header('Content-Type: application/json');
try {
    $db = new PDO('sqlite:db.sqlite3');

    $stmt = $db->prepare("
        SELECT 
            o.orderID, o.clientID, o.productID, o.productsNum,
            c.clientName,
            p.productName
        FROM Orders o
        JOIN Clients c ON o.clientID = c.clientID
        JOIN Products p ON o.productID = p.productID
        WHERE o.orderStatus = 'Готово'
        ORDER BY o.orderID DESC
    ");
    $stmt->execute();
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($orders);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка базы данных']);
}
