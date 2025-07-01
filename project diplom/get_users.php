<?php
header('Content-Type: application/json');
$db = new PDO('sqlite:db.sqlite3');

$stmt = $db->query("SELECT email, lastname, firstname, middlename, role FROM Users");
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($users);
