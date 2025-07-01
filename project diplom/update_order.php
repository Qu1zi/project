<?php
session_start(); // Для доступа к $_SESSION
header('Content-Type: application/json');

try {
    $db = new PDO('sqlite:db.sqlite3');

    $orderID = $_POST['orderID'];
    $actualExecutionDate = $_POST['actualExecutionDate'];

    // Получаем роль пользователя
    $role = $_SESSION['userRole'] ?? 'guest'; // на случай, если сессия не установлена

    if ($role === 'admin') {
        $clientID = $_POST['clientID'];
        $productID = $_POST['productID'];
        $productsNum = $_POST['productsNum'];
        $orderDateReceipt = $_POST['orderDateReceipt'];
        $assignedExecutionDate = $_POST['assignedExecutionDate'];

        $stmt = $db->prepare("
            UPDATE Orders SET 
                clientID = :clientID,
                productID = :productID,
                productsNum = :productsNum,
                orderDateReceipt = :orderDateReceipt,
                assignedExecutionDate = :assignedExecutionDate,
                actualExecutionDate = :actualExecutionDate
            WHERE orderID = :orderID
        ");

        $stmt->bindParam(':clientID', $clientID);
        $stmt->bindParam(':productID', $productID);
        $stmt->bindParam(':productsNum', $productsNum);
        $stmt->bindParam(':orderDateReceipt', $orderDateReceipt);
        $stmt->bindParam(':assignedExecutionDate', $assignedExecutionDate);
        $stmt->bindParam(':actualExecutionDate', $actualExecutionDate);
        $stmt->bindParam(':orderID', $orderID);
    } elseif (in_array($role, ['manager', 'worker'])) {
        // Только дата выполнения
        $stmt = $db->prepare("
            UPDATE Orders SET 
                actualExecutionDate = :actualExecutionDate
            WHERE orderID = :orderID
        ");

        $stmt->bindParam(':actualExecutionDate', $actualExecutionDate);
        $stmt->bindParam(':orderID', $orderID);
    } else {
        echo json_encode(['success' => false, 'error' => 'Недостаточно прав']);
        exit;
    }

    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Ошибка при обновлении']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
