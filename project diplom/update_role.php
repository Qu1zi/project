<?php
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);
$email = $data['email'] ?? '';
$newRole = $data['role'] ?? '';

if (!$email || !$newRole) {
  echo json_encode(['success' => false, 'message' => 'Недостаточно данных']);
  exit;
}

try {
  $db = new PDO('sqlite:db.sqlite3');
  $stmt = $db->prepare("UPDATE Users SET role = ? WHERE email = ?");
  $success = $stmt->execute([$newRole, $email]);
  echo json_encode(['success' => $success]);
} catch (Exception $e) {
  echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
