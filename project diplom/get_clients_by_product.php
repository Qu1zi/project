<?php
header('Content-Type: application/json');
try {
    $productID = $_GET['productID'] ?? null;

    if (!$productID) {
        echo json_encode([]);
        exit;
    }

    $db = new PDO('sqlite:db.sqlite3');
    $stmt = $db->prepare("
        SELECT DISTINCT c.clientID, c.clientName
        FROM Orders o
        JOIN Clients c ON o.clientID = c.clientID
        WHERE o.productID = ?
    ");
    $stmt->execute([$productID]);
    $clients = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($clients);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка базы данных']);
}
