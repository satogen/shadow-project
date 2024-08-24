<?php
header('Content-Type: application/json');
// 現在の日時を取得
$currentDateTime = new DateTime('Asia/Tokyo');

// 地点番号と現在の年月を取得
$pointNumber = '44132';
$year = date('Y');
$month = date('m');

// エンドポイントURLを作成
$url = "https://www.wbgt.env.go.jp/est15WG/dl/wbgt_{$pointNumber}_{$year}{$month}.csv";

// CSVデータを取得
$csvData = file_get_contents($url);

// データが取得できなかった場合のエラーハンドリング
if ($csvData === false) {
    echo json_encode(['error' => 'データの取得に失敗しました']);
    exit;
}

// CSVデータを行ごとに分割
$rows = explode("\n", trim($csvData));

// 1行目はヘッダーなので、除外
array_shift($rows);

$latestValues = null;
$latestDateTime = null;

// 各行を処理
foreach ($rows as $row) {
    $columns = str_getcsv($row);
    $date = $columns[0];
    $time = $columns[1];
    $wbgtValues = array_slice($columns, 2);

    // 行の日時を作成
    $rowDateTime = new DateTime("$date $time");

    // 行の日時が現在の日時よりも前で、かつ最も新しい場合
    if ($rowDateTime <= $currentDateTime && 
        ($latestDateTime === null || $rowDateTime > $latestDateTime)) {
        $latestValues = $wbgtValues;
        $latestDateTime = $rowDateTime;
    }
}

if ($latestValues !== null) {
    // JSON形式でレスポンスを返す
    echo json_encode([
        'dateTime' => $latestDateTime->format('Y-m-d H:i'),
        'wbgtValues' => $latestValues[0]
    ]);
} else {
    echo json_encode(['error' => '適切なデータが見つかりませんでした']);
}
?>