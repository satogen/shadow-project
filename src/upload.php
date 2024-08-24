<?php
mb_internal_encoding('UTF-8'); // 一番最初に記述
header('Content-Type: text/html; charset=UTF-8'); // ヘッダーを送信
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // ファイルがアップロードされたか確認
    if (isset($_FILES["image"]) && $_FILES["image"]["error"] == 0) {
        $allowed = array("jpg" => "image/jpeg", "jpeg" => "image/jpeg", "gif" => "image/gif", "png" => "image/png");
        $filename = $_FILES["image"]["name"];
        $filetype = $_FILES["image"]["type"];
        $filesize = $_FILES["image"]["size"];

        // 拡張子とMIMEタイプをチェック
        $ext = pathinfo($filename, PATHINFO_EXTENSION);
        if (!array_key_exists($ext, $allowed)) {
            die("エラー: 許可されていないファイルの種類です。");
        }
        if ($filesize > 1000000) { 
            die("エラー: ファイルサイズが大きすぎます。");
        }
        if (in_array($filetype, $allowed)) {
            // 画像の保存先ディレクトリ
            $imageDir = "uploads/images/"; 

            // JSONの保存先ディレクトリ
            $jsonDir = "uploads/JSON/";

            // ファイルを指定のディレクトリに移動
            if (move_uploaded_file($_FILES["image"]["tmp_name"], $imageDir . $filename)) {
                // JSONデータの作成
                $jsonData = array(
                    'img_name' => $filename,
                    'pen_name' => $_POST['pen_name'], 
                    'post_type' => 'hoge', 
                    'lat' => $_POST['lat'], 
                    'lon' => $_POST['lon']
                );

                // JSONファイル名
                $jsonFilename = pathinfo($filename, PATHINFO_FILENAME) . '.json'; 

                // JSONデータをファイルに書き込み (失敗してもエラーを表示しない)
                file_put_contents($jsonDir . $jsonFilename, json_encode($jsonData, JSON_UNESCAPED_UNICODE));

                // ファイルアップロードが成功した場合は常に"success"を返す
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