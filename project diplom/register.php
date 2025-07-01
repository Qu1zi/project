<?php
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

$lastname = trim($data['lastname'] ?? '');
$firstname = trim($data['firstname'] ?? '');
$middlename = trim($data['middlename'] ?? '');
$email = trim($data['email'] ?? '');
$password = trim($data['password'] ?? '');

if (!$lastname || !$firstname || !$middlename || !$email || !$password) {
    echo json_encode(['success' => false, 'message' => 'Все поля обязательны']);
    exit;
}

$db = new SQLite3('db.sqlite3');

// Хеширование пароля
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

$role = 'worker';

$stmt = $db->prepare('
    INSERT INTO users (lastname, firstname, middlename, email, password, role)
    VALUES (:lastname, :firstname, :middlename, :email, :password, :role)
');
$stmt->bindValue(':lastname', $lastname, SQLITE3_TEXT);
$stmt->bindValue(':firstname', $firstname, SQLITE3_TEXT);
$stmt->bindValue(':middlename', $middlename, SQLITE3_TEXT);
$stmt->bindValue(':email', $email, SQLITE3_TEXT);
$stmt->bindValue(':password', $hashedPassword, SQLITE3_TEXT);
$stmt->bindValue(':role', $role, SQLITE3_TEXT);


try {
    $stmt->execute();

    session_start(); // запускаем сессию после успешной регистрации
    $_SESSION['userEmail'] = $email;
    $_SESSION['userRole'] = $role;
    $_SESSION['userName'] = "$lastname $firstname";

    echo json_encode([
        'success' => true,
        'message' => 'Регистрация успешна и вход выполнен',
        'role' => $role,
        'name' => "$lastname $firstname"
    ]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Пользователь уже существует']);
}
