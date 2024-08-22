document.getElementById('fetchData').addEventListener('click', function() {
    fetch('api.php')
      .then(response => response.json())
      .then(data => {
        document.getElementById('result').textContent = `取得したデータ: ${data.message}`;
      })
      .catch(error => {
        console.error('データ取得エラー:', error);
      });
  });
  