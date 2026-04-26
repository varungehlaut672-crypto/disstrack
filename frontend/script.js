// CREATE MAP
var map = L.map('map').setView([20, 0], 2);

var heat = L.heatLayer([
    [28.6, 77.2, 0.9],   // India
    [35.6, 139.6, 0.8],  // Japan
    [37.7, -122.4, 0.7], // USA
    [51.5, -0.1, 0.6],   // UK
    [48.8, 2.3, 0.5]     // France
], {
    radius: 25,
    blur: 15
}).addTo(map);

// LOAD COUNTRY BORDERS
fetch("https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json")
.then(res => res.json())
.then(data => {

    function style(feature) {
        return {
            color: "#555",
            weight: 1,
            fillOpacity: 0.2
        };
    }

    function highlightFeature(e) {
        let layer = e.target;
        layer.setStyle({
            weight: 2,
            color: "#000",
            fillOpacity: 0.5
        });
    }

    function resetHighlight(e) {
        geojson.resetStyle(e.target);
    }

    function onEachFeature(feature, layer) {

        // HOVER
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight
        });

        // CLICK → use country name directly
        layer.on('click', function () {

            let country = feature.properties.name.toLowerCase().replace(/\s/g, "");

            fetch(`http://127.0.0.1:5000/risk/${country}`)
            .then(res => res.json())
            .then(data => {

                if (data.error) {
                    document.getElementById("info").innerHTML =
                        `No data for ${country}`;
                } else {
                    document.getElementById("info").innerHTML =
                        `<b>${data.country}</b><br>
                         🌍 Earthquake: ${data.earthquake_risk}<br>
                         🌊 Flood: ${data.flood_risk}`;
                }

            });

        });
    }

    var geojson = L.geoJson(data, {
        style: style,
        onEachFeature: onEachFeature
    }).addTo(map);

});

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

