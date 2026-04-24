var map = L.map('map').setView([20, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
.addTo(map);

map.on('click', function () {

    fetch("http://10.161.239.180:5000/risk/india")
    .then(res => res.json())
    .then(data => {
        alert(`Country: ${data.country}\nRisk: ${data.risk}`);
    })
    .catch(err => {
        alert("Backend not connected!");
    });

});