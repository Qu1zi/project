<?php
try {
    $db = new PDO('sqlite:db.sqlite3');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Добавлен clientID
    $stmt = $db->query("SELECT clientID, clientName, clientSite, clientCharac FROM Clients");

    if ($stmt === false) {
        throw new Exception("Query failed: " . implode(" ", $db->errorInfo()));
    }

    $clients = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($clients);

} catch (PDOException $e) {
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
