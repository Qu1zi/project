<?php
header('Content-Type: application/json');
$data = json_decode(file_get_contents('php://input'), true);

if (empty($data['resonatorName'])) {
    echo json_encode(['success' => false, 'message' => 'Название резонатора обязательно']);
    exit;
}

try {
    $db = new PDO('sqlite:db.sqlite3');
    $stmt = $db->prepare("INSERT INTO resonators (resonatorName, resonatorNote) VALUES (:name, :note)");
    $stmt->execute([
        ':name' => $data['resonatorName'],
        ':note' => $data['resonatorNote'] ?? ''
    ]);
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Ошибка при добавлении']);
}
