<?php
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
    if ($filesize > 500000) {
      die("エラー: ファイルサイズが大きすぎます。");
    }
    if (in_array($filetype, $allowed)) {
      // 保存先のディレクトリを変数に設定
      $uploadDir = "uploads/images/"; 

      // ファイルを指定のディレクトリに移動
      if (move_uploaded_file($_FILES["image"]["tmp_name"], $uploadDir . $filename)) {
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