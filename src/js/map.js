let lat, lng;

// なぜか取得できない現在位置
// 現在地を取得して表示
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
        lat = position.coords.latitude;
        lng = position.coords.longitude;
    });
} else {
    alert("Geolocation is not supported by this browser.");
}

// サンプル値
lat = 35.685175;
lng = 139.707708;

// マップの表示位置を設定
let map = L.map('map')
let subMap = L.map('sub-map', {
    zoomControl: false, // 拡大縮小ボタンを非表示にする
    attributionControl: false // 著作権表示も非表示にする場合
}).setView([35.73297522404231, 139.48296616562493], 8);


function setMainMap(){
    // 透過的な地図レイヤーを作成
    var Stadia_AlidadeSmooth = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.{ext}', {
        minZoom: 0,
        maxZoom: 20,
        attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        ext: 'png'  
    });
    Stadia_AlidadeSmooth.addTo(map);
}

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

function getColor(value) {
    return value >= 31 ? '#FA00C8' :
            value >= 28 ? '#DC96C8' :
            value >= 25 ? '#F0E6CB' :
            value >= 21  ? '#323246' :
                        '#010937';
}

function createGeoJsonLayer(geojsonData) {
    return L.geoJSON(geojsonData, {
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
                fillColor: match ? getColor(match.value) : '#000000',
                weight: 2,
                opacity: 0.5,
                color: border_color,
                dashArray: '0',
                fillOpacity: 0.5
            };
        }
    });
}

function reflect_map(){
    fetch('/geojson/tokyo.geojson')
    .then(response => response.json())
    .then(geojson => {
        
        // initialMapSetting();
        setMainMap();

        geojsonLayer = createGeoJsonLayer(geojson);
        geojsonLayer.addTo(map); // メイン地図の追加
        geojsonLayer.addTo(subMap); // サブ地図の追加

        map = map.setView([lat, lng], 15);
        
        // サブの地図に現在地にポイントを追加
        L.marker([lat, lng], { 
            icon: L.divIcon({
                className: 'custom-icon', // CSSクラスを指定
                html: '<div class="circle"></div>',
                iconSize: [30, 30], // アイコンのサイズ
                iconAnchor: [15, 15] // アイコンのアンカー（中央を基準にするためにサイズの半分）
            })
        }).addTo(subMap);    })
}

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
