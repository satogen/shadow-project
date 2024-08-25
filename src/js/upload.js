document.getElementById('uploadForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const formData = new FormData(this);

    fetch('upload.php', {
        method: 'POST',
        body: formData,

    }).then(response => response.text())
        .then(data => {
            const cleanedData = data.replace(/[\x00-\x1F\x7F]/g, ''); // 制御文字を除去
            console.log(cleanedData); // 修正後のデータを出力
            console.log(cleanedData.length); // 修正後のデータ長を確認

            if (cleanedData === "success") {
                location.href = 'index.html';
            } else {
                alert(data);
            }
        })
        .catch(error => {
            // アップロード失敗時の処理
            alert('エラーが発生しました: ');
        });
});