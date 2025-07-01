<?php
header('Content-Type: application/json');

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Метод не поддерживается');
    }

    $orderID = $_POST['orderID'] ?? null;
    $clientID = $_POST['clientID'] ?? null;
    $productID = $_POST['productID'] ?? null;
    $resonatorID = $_POST['resonatorID'] ?? null;
    $doneNote = $_POST['doneNote'] ?? '';
    $productsNum = $_POST['productsNum'] ?? null;

    if (!$orderID || !$clientID || !$productID || !$resonatorID) {
        echo json_encode(['success' => false, 'message' => 'Не все поля заполнены']);
        exit;
    }

    $db = new PDO('sqlite:db.sqlite3');

    // Вставка записи в таблицу Done
    $stmt = $db->prepare("INSERT INTO Done (orderID, clientID, productID, resonatorID, doneNote, productsNum) VALUES (?, ?, ?, ?, ?, ?)");
    $res = $stmt->execute([$orderID, $clientID, $productID, $resonatorID, $doneNote, $productsNum]);

    if (!$res) {
        echo json_encode(['success' => false, 'message' => 'Ошибка при добавлении']);
        exit;
    }

    $doneID = $db->lastInsertId();
    $uploadDir = __DIR__ . "/uploads/done_$doneID/";
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    // Загрузка файлов (если есть)
    if (!empty($_FILES['doneFiles']) && is_array($_FILES['doneFiles']['tmp_name'])) {
        $fileStmt = $db->prepare("INSERT INTO DoneFiles (doneID, filePath, originalName) VALUES (?, ?, ?)");
        foreach ($_FILES['doneFiles']['tmp_name'] as $index => $tmpPath) {
            if (!is_uploaded_file($tmpPath)) {
                continue;
            }

            $originalName = $_FILES['doneFiles']['name'][$index];
            $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));

            // Только допустимые расширения
            if (!in_array($extension, ['pdf', 'doc', 'docx', 'csv'])) {
                continue;
            }

            $safeName = uniqid() . "_" . preg_replace('/[^a-zA-Z0-9_.-]/', '_', $originalName);
            $destination = $uploadDir . $safeName;

            if (move_uploaded_file($tmpPath, $destination)) {
                $relativePath = "uploads/done_$doneID/$safeName";
                $fileStmt->execute([$doneID, $relativePath, $originalName]);
            }
        }
    }

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Ошибка сервера: ' . $e->getMessage()]);
}
