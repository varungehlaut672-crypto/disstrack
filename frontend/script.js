// CREATE MAP (this must be FIRST)
var map = L.map('map').setView([20, 0], 2);

// ADD TILE LAYER
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
.addTo(map);

// CLICK EVENT
map.on('click', function () {

    fetch("http://127.0.0.1:5000/risk/india")
    .then(res => res.json())
    .then(data => {
        alert(`Country: ${data.country}\nRisk: ${data.risk}`);
    })
    .catch(err => {
        console.error(err);
        alert("Backend not connected yet!");
    });

});