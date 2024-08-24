// マップの表示位置を設定
const map = L.map('map').setView([35.73297522404231, 139.48296616562493], 10);

function absolutePath(path) {
    var e = document.createElement('span');
    e.innerHTML = '<a href="' + path + '" />';
    return e.firstChild.href;
}

// CSVをパースする関数
function parseCSV(data) {
    const lines = data.trim().split('\n');
    const headers = lines[0].split(',');

    return lines.slice(1).map(line => {
        const values = line.split(',');
        let obj = {};
        headers.forEach((header, i) => {
            obj[header.trim()] = values[i] ? values[i].trim() : null;
        });
        return obj;
    });
}

// パースしたデータ
const parsedCsvData = parseCSV(csvData);

// 距離計算関数（ハバースインの公式を使用）
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // 地球の半径 (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // 距離 (km)
}

// 内挿の実行
function interpolateValue(knownPoints, targetPoint) {
    let weightedSum = 0;
    let totalWeight = 0;

    knownPoints.forEach(point => {
        const distance = haversineDistance(targetPoint.lat, targetPoint.lng, point.lat, point.lon);
        const weight = 1 / (distance || 1); // 距離が0の場合の対応
        weightedSum += weight * point.value;
        totalWeight += weight;
    });

    return weightedSum / totalWeight;
}

function reflect_map(){
    // GeoJSONファイルを読み込む
    fetch('/geojson/tokyo.geojson')
        .then(response => response.json())
        .then(geojson => {

            // ポリゴンの色付け関数
            function getColor(value) {
                return value >= 31 ? '#FA00C8' :
                        value >= 28 ? '#DC96C8' :
                        value >= 25 ? '#F0E6CB' :
                        value >= 21  ? '#323246' :
                                    '#010937';
            }

            // 各ポリゴンに対して処理を行う
            L.geoJSON(geojson, {
                // フィルター条件を指定
                filter: function(feature) {
                    // "所属未定地" のポリゴンを除外
                    return feature.properties.N03_004 !== "所属未定地";
                },
                style: function(feature) {
                    let match = null;
                    if(feature.properties.N03_003 === "西多摩郡"){
                        match = parsedCsvData.find(point => 
                        point.citynNme2 === feature.properties.N03_004
                    );
                    }else{
                        match = parsedCsvData.find(point => 
                        point.citynNme1 === feature.properties.N03_004
                        );                            
                    }

                    // 色の設定
                    return {
                        fillColor: match ? getColor(match.value) : '#FFFFFF',
                        weight: 2,
                        opacity: 1,
                        color: border_color,
                        dashArray: '0',
                        fillOpacity: 1
                    };
                },
                onEachFeature: function(feature, layer) {
                    // ポリゴンに情報のポップアップを追加
                    const match = parsedCsvData.find(point => 
                        point.citynNme1 === feature.properties.citynNme1 &&
                        point.citynNme2 === feature.properties.citynNme2
                    );
                }
            }).addTo(map);
    })
}

// 東京の色を決定する関数
function getColor(name) {
    return name === '東京都' ? '#010937' : '#7c7c7c';
}

// // OpenStreetMapタイルを追加
// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
// attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
// }).addTo(map);

// GeoJSONファイルを読み込んでレイヤーを追加
fetch('/geojson/prefectures.geojson')
    .then(response => response.json())
    .then(geojsonData => {
        // スタイル設定関数
        function style(feature) {
        return {
            fillColor: getColor(feature.properties.name),
            weight: 2,
            opacity: 1,
            color: border_color,
            dashArray: '0',
            fillOpacity: 1
        };
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

// バックエンドからデータの取得
fetch(`${window.location.origin}/api.php`)
    .then(response => response.json())
    .then(data => {
        // knownPointsをループして、それぞれのcitynNme1に対応するwbgtValuesをvalueに代入
        knownPoints.forEach(point => {
            const matchingData = data.find(item => item.location === point.citynNme1);
            if (matchingData && !matchingData.error) {
                point.value = matchingData.wbgtValues;
            }
        });

        // CSVデータに基づいて内挿を行う
        parsedCsvData.forEach(row => {
            const match = knownPoints.find(point => 
                point.citynNme1 === row.citynNme1 &&
                point.citynNme2 === row.citynNme2
            );

            if (match) {
                row.value = match.value;
            } else {
                row.value = interpolateValue(knownPoints, row);
            }
        });
        reflect_map();
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });
