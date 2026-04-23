// Create map
var map = L.map('map').setView([20, 0], 2);

// Add map tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

// When user clicks anywhere
map.on('click', function(e) {

    console.log("Clicked at:", e.latlng);

    // Call backend API
    fetch("http://127.0.0.1:5000/risk/india")
    .then(response => response.json())
    .then(data => {

        // Show result
        alert(
            "Country: " + data.country +
            "\nFlood Risk: " + data.flood_risk +
            "\nEarthquake Risk: " + data.earthquake_risk
        );
    })
    .catch(error => {
        console.error("Error:", error);
    });

});