function getPinClass(post_type) {
    if (post_type === "type1") {
        return 'pin-fa00c8'; // ピンク色
    } else if (post_type === "type2") {
        return 'pin-010937'; // 青色
    }
}

window.onload = () => {
    // data.jsonのみを読み込む
    fetch('/uploads/JSON/data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(dataArray => { // data.jsonには複数のデータが配列で格納されていると仮定
            dataArray.forEach(data => {
                const lat = data.lat;
                const lng = data.lon;
                var imagePath = '/uploads/images/' + data.img_name;

                let post_type = data.post_type;
                let pinClass = getPinClass(post_type);

                var customPinHtml = `
                    <div class="custom-pin ${pinClass}">
                        <div class="inner-image">
                            <img src="${imagePath}" alt="Pin Image">
                        </div>
                    </div>
                `;
                var customIcon = L.divIcon({
                    html: customPinHtml,
                    className: '',
                    iconSize: [50, 70],
                    iconAnchor: [25, 70],
                    popupAnchor: [0, -70]
                });

                const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
                marker.bindPopup(data.pen_name);
            });
        })
        .catch(error => {
            console.error('Error fetching or parsing JSON:', error);
        });
};