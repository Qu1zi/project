<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $db = new PDO('sqlite:db.sqlite3');

        $stmt = $db->prepare("INSERT INTO Clients (clientName, clientSite, clientCharac) VALUES (?, ?, ?)");
        $stmt->execute([
            $_POST['clientName'],
            $_POST['clientSite'],
            $_POST['clientCharac']
        ]);

        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}
?>
