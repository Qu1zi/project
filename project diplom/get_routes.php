<?php
try {
    $db = new PDO('sqlite:db.sqlite3');

    // Получаем маршруты с информацией о заказе и изделии
    $stmt = $db->query("
        SELECT routeN, orderID, productID, routeDate, productSerial, routeNote
        FROM Routes
        ORDER BY routeDate DESC
    ");
    
    $routes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($routes);
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
