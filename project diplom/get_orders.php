<?php
header('Content-Type: application/json');

try {
    $db = new PDO('sqlite:db.sqlite3');

    $query = "
        SELECT 
            o.orderID,
            o.clientID,
            c.clientName,
            o.productID,
            p.productName,
            o.productsNum,
            o.orderDateReceipt,
            o.assignedExecutionDate,
            o.actualExecutionDate,
            o.orderStatus,
            o.productsNumStart
        FROM Orders o
        LEFT JOIN Clients c ON o.clientID = c.clientID
        LEFT JOIN Products p ON o.productID = p.productID
    ";

    $stmt = $db->query($query);
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($orders);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
