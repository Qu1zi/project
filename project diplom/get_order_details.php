<?php
$orderID = $_GET['orderID'] ?? null;
if (!$orderID) {
    echo json_encode(['error' => 'Нет ID']);
    exit;
}

try {
    $db = new PDO('sqlite:db.sqlite3');

    $stmt = $db->prepare("
        SELECT o.*, c.clientName, p.productName
        FROM Orders o
        LEFT JOIN Clients c ON o.clientID = c.clientID
        LEFT JOIN Products p ON o.productID = p.productID
        WHERE o.orderID = ?
    ");
    $stmt->execute([$orderID]);
    $order = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$order) {
        echo json_encode(['error' => 'Не найдено']);
        exit;
    }

    echo json_encode($order);
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
