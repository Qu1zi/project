<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $db = new PDO('sqlite:db.sqlite3');
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $stmt = $db->prepare("
            INSERT INTO Orders (clientID, orderDateReceipt, assignedExecutionDate, productID, productsNum)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $_POST['clientID'],
            $_POST['orderDateReceipt'],
            $_POST['assignedExecutionDate'],
            $_POST['productID'],
            $_POST['productsNum']
        ]);

        echo json_encode(['success' => true, 'message' => 'Заказ успешно добавлен']);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Недопустимый метод запроса']);
}
?>
