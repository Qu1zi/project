<?php
header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', 0);
error_reporting(0);

try {
    // Получаем JSON из тела запроса
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    $email = isset($data['email']) ? trim($data['email']) : '';
    $password = isset($data['password']) ? trim($data['password']) : '';

    if ($email === '' || $password === '') {
        echo json_encode([
            'success' => false,
            'message' => 'Поля email и пароль обязательны'
        ]);
        exit;
    }

    $db = new SQLite3('db.sqlite3');

    $stmt = $db->prepare('SELECT * FROM users WHERE email = :email');
    if (!$stmt) {
        echo json_encode([
            'success' => false,
            'message' => 'Ошибка базы данных'
        ]);
        exit;
    }

    $stmt->bindValue(':email', $email, SQLITE3_TEXT);
    $result = $stmt->execute();
    if (!$result) {
        echo json_encode([
            'success' => false,
            'message' => 'Ошибка выполнения запроса'
        ]);
        exit;
    }

    $user = $result->fetchArray(SQLITE3_ASSOC);
    if (!$user) {
        echo json_encode([
            'success' => false,
            'message' => 'Пользователь не найден'
        ]);
        exit;
    }

    if (password_verify($password, $user['password'])) {
        session_start();
        
        $lastname = $user['lastname'] ?? '';
        $firstname = $user['firstname'] ?? '';
        $middlename = $user['middlename'] ?? '';
        $role = $user['role'];

        echo json_encode([
            'success' => true,
            'message' => 'Вход выполнен',
            'lastname' => $lastname,
            'firstname' => $firstname,
            'middlename' => $middlename,
            'role' => $role
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Неверный пароль'
        ]);
    }

    exit;

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Внутренняя ошибка сервера'
    ]);
    exit;
}
