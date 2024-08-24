<?php
header('Content-Type: application/json');

// 現在の日時を取得
$currentDateTime = new DateTime('Asia/Tokyo');

// 地点番号と現在の年月を取得
$year = date('Y');
$month = date('m');

// ポイントの連想配列
$points = [
    "西多摩郡" => "44046",
    "青梅市" => "44056",
    "練馬区" => "44071",
    "八王子市" => "44112",
    "府中市" => "44116",
    "文京区" => "44132",
    "江戸川区" => "44136"
];

// 結果を格納する配列
$results = [];

foreach ($points as $locationName => $pointNumber) {
    // エンドポイントURLを作成
    $url = "https://www.wbgt.env.go.jp/est15WG/dl/wbgt_{$pointNumber}_{$year}{$month}.csv";

    // CSVデータを取得
    $csvData = file_get_contents($url);

    // データが取得できなかった場合のエラーハンドリング
    if ($csvData === false) {
        $results[] = [
            'location' => $locationName,
            'error' => 'データの取得に失敗しました'
        ];
        continue;
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
        $rowDateTime = new DateTime("$date $time", new DateTimeZone('Asia/Tokyo'));

        // 行の日時が現在の日時よりも前で、かつ最も新しい場合
        if ($rowDateTime <= $currentDateTime && 
            ($latestDateTime === null || $rowDateTime > $latestDateTime)) {
            $latestValues = $wbgtValues;
            $latestDateTime = $rowDateTime;
        }
    }

    if ($latestValues !== null) {
        // 結果を追加
        $results[] = [
            'location' => $locationName,
            'dateTime' => $latestDateTime->format('Y-m-d H:i'),
            'wbgtValues' => $latestValues[0]
        ];
    } else {
        $results[] = [
            'location' => $locationName,
            'error' => '適切なデータが見つかりませんでした'
        ];
    }
}

// JSON形式でレスポンスを返す
echo json_encode($results, JSON_UNESCAPED_UNICODE);
?>