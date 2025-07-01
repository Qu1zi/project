<?php
header('Content-Type: application/json');
try {
    $clientID = $_GET['clientID'] ?? null;

    if (!$clientID) {
        echo json_encode([]);
        exit;
    }

    $db = new PDO('sqlite:db.sqlite3');
    $stmt = $db->prepare("
        SELECT d.doneID, d.doneNote, d.productsNum,
               d.orderID,
               c.clientID, c.clientName,
               p.productID, p.productName,
               r.resonatorID, r.resonatorName
        FROM Done d
        LEFT JOIN Clients c ON d.clientID = c.clientID
        LEFT JOIN Products p ON d.productID = p.productID
        LEFT JOIN Resonators r ON d.resonatorID = r.resonatorID
        WHERE d.clientID = ?
        ORDER BY d.doneID DESC
    ");
    $stmt->execute([$clientID]);
    $done = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($done);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка базы данных']);
}
