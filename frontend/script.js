// CREATE MAP (this must be FIRST)
var map = L.map('map').setView([20, 0], 2);

// ADD TILE LAYER
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
.addTo(map);

// CLICK EVENT
map.on('click', function () {

    fetch("http://10.161.239.180:5000/risk/india")
    .then(res => res.json())
    .then(data => {
        alert(`Country: ${data.country}\nRisk: ${data.risk}`);
    })
    .catch(err => {
<<<<<<< HEAD
        console.error(err);
        alert("Backend not connected yet!");
=======
        alert("Backend not connected!");
>>>>>>> 22684c2bce550dd28ad6ae1dd0ff2ceb60a00223
    });

});