// CREATE MAP
var map = L.map('map').setView([20, 0], 2);

// ADD TILE LAYER
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
.addTo(map);

// CLICK EVENT WITH COUNTRY DETECTION
map.on('click', function (e) {

    let lat = e.latlng.lat;
    let lon = e.latlng.lng;

    // GET COUNTRY FROM LAT/LON
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
    .then(res => res.json())
    .then(location => {

        let country = location.address.country;

        if (!country) {
            document.getElementById("info").innerHTML = "Country not found";
            return;
        }

        // normalize
        country = country.toLowerCase().replace(/\s/g, "");

        // CALL BACKEND
        fetch(`http://127.0.0.1:5000/risk/${country}`)
        .then(res => res.json())
        .then(data => {

            if (data.error) {
                document.getElementById("info").innerHTML = `No data for ${country}`;
            } else {
                document.getElementById("info").innerHTML =
                    `<b>Country:</b> ${data.country}<br>
                     🌍 Earthquake: ${data.earthquake_risk}<br>
                     🌊 Flood: ${data.flood_risk}`;
            }

        });

    })
    .catch(err => console.error(err));

});