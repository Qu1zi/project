<?php
header('Content-Type: application/json');
try {
    $db = new PDO('sqlite:db.sqlite3');
    $stmt = $db->query("SELECT resonatorID, resonatorName, resonatorNote FROM Resonators ORDER BY resonatorName");
    $resonators = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($resonators);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка базы данных']);
}
