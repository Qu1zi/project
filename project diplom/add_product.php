<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $db = new PDO('sqlite:db.sqlite3');
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $productName = $_POST['productName'] ?? '';
        $productCate = $_POST['productCate'] ?? '';
        $productAppearance = $_POST['productAppearance'] ?? '';

        $photoPath = null;

        if (isset($_FILES['productPhoto']) && $_FILES['productPhoto']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = 'uploads/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            $tmpName = $_FILES['productPhoto']['tmp_name'];
            $originalName = basename($_FILES['productPhoto']['name']);
            $ext = pathinfo($originalName, PATHINFO_EXTENSION);

            // Уникальное имя файла
            $uniqueName = uniqid('photo_', true) . '.' . $ext;
            $targetPath = $uploadDir . $uniqueName;

            if (move_uploaded_file($tmpName, $targetPath)) {
                $photoPath = $targetPath;
            } else {
                echo json_encode(['success' => false, 'error' => 'Ошибка при загрузке файла']);
                exit;
            }
        }

        // Вставляем запись с путём к фото вместо productNote
        $stmt = $db->prepare("INSERT INTO Products (productName, productCATE, productAppearance, productNote) VALUES (?, ?, ?, ?)");
        $stmt->execute([
            $productName,
            $productCate,
            $productAppearance,
            $photoPath
        ]);

        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}
?>
