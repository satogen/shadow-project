<?php
$directory = 'uploads/JSON'; 
$targetFile = 'data.json'; // 返すJSONファイル名

// ファイルが存在するか確認
$filePath = $directory . '/' . $targetFile;
if (file_exists($filePath)) {
    header('Content-Type: application/json');
    echo json_encode([$targetFile]); // ファイル名のみをJSON配列で返す
} else {
    // ファイルが存在しない場合はエラーを返す
    header('HTTP/1.1 404 Not Found');
    echo json_encode(['error' => 'File not found']);
}
?>