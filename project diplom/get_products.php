<?php
try {
    $db = new PDO('sqlite:db.sqlite3');

    // Добавлен productID
    $stmt = $db->query("SELECT productID, productName, productCATE, productAppearance, productNote FROM Products");
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($products);
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
