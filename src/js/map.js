// マップの初期設定
const map = L.map('map').setView([35.7199323, 139.7440577], 10);

// OpenStreetMapタイルを追加
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// アイコンの色を決定する関数
function getIconColor(wbgtValue) {
    if (wbgtValue < 15) {
      return 'wbgt-low';
    } else if (wbgtValue < 25) {
      return 'wbgt-medium';
    } else {
      return 'wbgt-high';
    }
  }

// GeoJSONファイルを読み込んでレイヤーを追加
fetch('prefectures.geojson')
  .then(response => response.json())
  .then(geojsonData => {
    // スタイル設定関数
    function style(feature) {
      return {
        fillColor: getColor(feature.properties.name),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
      };
    }

    // 色を決定する関数（例: 東京とその他で色を変更）
    function getColor(name) {
      return name === '東京都' ? '#FF5733' : '#33FF57';
    }

    // GeoJSONレイヤーを追加
    L.geoJSON(geojsonData, {
      style: style,
      onEachFeature: function (feature, layer) {
        layer.bindPopup(feature.properties.name);
      }
    }).addTo(map);
  })
  .catch(error => {
    console.error('GeoJSONファイルの読み込み中にエラーが発生しました:', error);
  });

// APIからデータを取得してマップにピンを追加
fetch('api.php')
  .then(response => response.json())
  .then(data => {
    if (data.error) {
      console.error('データ取得エラー:', data.error);
      return;
    }
    
    console.log(`最後の値: ${data.wbgtValues}`);
    
    // アイコンの色をWBGT値に基づいて設定
    const iconColorClass = getIconColor(parseFloat(data.wbgtValues));

    // カスタムアイコンを作成
    const customIcon = L.divIcon({
      className: `custom-icon ${iconColorClass}`,
      iconSize: [20, 20]
    });

    // ピンを設置し、クリック時に情報を表示
    const marker = L.marker([35.7199323, 139.7440577], { icon: customIcon }).addTo(map);
    marker.bindPopup(`最後のWBGT値: ${data.wbgtValues}`);
  })
  .catch(error => {
    console.error('API呼び出し中にエラーが発生しました:', error);
  });
