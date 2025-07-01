<?php
header('Content-Type: application/json');

try {
    $db = new PDO('sqlite:db.sqlite3');

    // Получаем основные записи
    $stmt = $db->prepare("
        SELECT 
            d.doneID, 
            d.doneNote,
            d.productsNum,
            d.orderID,
            c.clientName,
            p.productName,
            r.resonatorName
        FROM Done d
        LEFT JOIN Clients c ON d.clientID = c.clientID
        LEFT JOIN Products p ON d.productID = p.productID
        LEFT JOIN Resonators r ON d.resonatorID = r.resonatorID
        ORDER BY d.doneID DESC
    ");
    $stmt->execute();
    $doneRecords = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Добавим к каждой записи файлы
    $fileStmt = $db->prepare("SELECT filePath, originalName FROM DoneFiles WHERE doneID = ?");
    foreach ($doneRecords as &$record) {
        $fileStmt->execute([$record['doneID']]);
        $files = $fileStmt->fetchAll(PDO::FETCH_ASSOC);
        $record['files'] = $files;
    }

    echo json_encode($doneRecords);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка базы данных']);
}

