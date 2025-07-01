<?php
header('Content-Type: application/json');
$db = new PDO('sqlite:db.sqlite3');

$data = json_decode(file_get_contents("php://input"), true);

$doneID = $data['doneID'] ?? null;
$doneNote = $data['doneNote'] ?? null;
$productsNum = $data['productsNum'] ?? null;
$userRole = $data['role'] ?? null;  // роль передается из клиента

if (!$doneID) {
  echo json_encode(['success' => false, 'message' => 'Нет ID']);
  exit;
}

// Проверяем роль
if ($userRole !== 'admin') {
  echo json_encode(['success' => false, 'message' => 'Доступ запрещен: только администратор может редактировать']);
  exit;
}

$stmt = $db->prepare("UPDATE done SET doneNote = ?, productsNum = ? WHERE doneID = ?");
$result = $stmt->execute([$doneNote, $productsNum, $doneID]);

echo json_encode(['success' => $result]);
