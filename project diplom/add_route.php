<?php
try {
    $db = new PDO('sqlite:db.sqlite3');
    $stmt = $db->prepare("INSERT INTO Routes (productID, routeN, routeDate, orderID, productSerial, routeNote)
                          VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $_POST['productID'],
        $_POST['routeN'],
        $_POST['routeDate'],
        $_POST['orderID'],
        $_POST['productSerial'],
        $_POST['routeNote']
    ]);
    echo "OK";
} catch (PDOException $e) {
    http_response_code(500);
    echo "Ошибка: " . $e->getMessage();
}
?>
