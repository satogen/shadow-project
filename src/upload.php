

<?php
mb_internal_encoding('UTF-8'); 
// header('Content-Type: text/html; charset=UTF-8'); 

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (isset($_FILES["image"]) && $_FILES["image"]["error"] == 0) {
        $allowed = array("jpg" => "image/jpeg", "jpeg" => "image/jpeg", "gif" => "image/gif", "png" => "image/png");
        $filename = $_FILES["image"]["name"];
        $filetype = $_FILES["image"]["type"];
        $filesize = $_FILES["image"]["size"];

        $ext = pathinfo($filename, PATHINFO_EXTENSION);
        if (!array_key_exists($ext, $allowed)) {
            die("エラー: 許可されていないファイルの種類です。");
        }
        if ($filesize > 1000000) { 
            die("エラー: ファイルサイズが大きすぎます。");
        }
        if (in_array($filetype, $allowed)) {
            $imageDir = "uploads/images/"; 
            $jsonDir = "uploads/JSON/";
            $jsonFile = $jsonDir . "data.json"; // 追記するJSONファイル名

            if (move_uploaded_file($_FILES["image"]["tmp_name"], $imageDir . $filename)) {
                $jsonData = array(
                    'img_name' => $filename,
                    'pen_name' => $_POST['pen_name'], 
                    'post_record' => $_POST['post_record'], 
                    'post_type' => 'type1', 
                    'lat' => (float)$_POST['lat'], 
                    'lon' => (float)$_POST['lon']
                );

                // 既存のJSONデータを読み込み
                $existingData = [];
                if (file_exists($jsonFile)) {
                    $existingData = json_decode(file_get_contents($jsonFile), true);
                }

                // 新しいデータを既存のデータに追加
                $existingData[] = $jsonData;

                // JSONデータをファイルに書き込み (追記モードで開く)
                file_put_contents($jsonFile, json_encode($existingData, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

                echo "success"; 
            } else {
                echo "エラー: ファイルのアップロードに失敗しました。";
            }
        } else {
            echo "エラー: ファイルの種類が一致しません。";
        }
    } else {
        echo "エラー: ファイルを選択してください。";
    }
}
?>