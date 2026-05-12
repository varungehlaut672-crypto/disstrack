// 🌍 CREATE GLOBE
const globe = Globe()(document.getElementById('globeViz'))
  .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
  .backgroundImageUrl('https://unpkg.com/three-globe/example/img/night-sky.png');

// 🌍 CAMERA SETTINGS
globe.pointOfView({ lat: 20, lng: 0, altitude: 2 });

globe.controls().autoRotate = true;
globe.controls().autoRotateSpeed = 0.5;


// 🌊 HURRICANE / CYCLONE POINTS
globe.pointsData([
  { lat: 15, lng: -60, size: 1, color: 'red' },
  { lat: 20, lng: 90, size: 1, color: 'orange' },
  { lat: -15, lng: 120, size: 1, color: 'yellow' }
])
.pointAltitude(0.02)
.pointColor('color');


// 🌍 LOAD COUNTRY POLYGONS (for hover)
let countries = [];
let hoverD = null;

fetch("https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json")
.then(res => res.json())
.then(data => {
    countries = data.features;

    globe
        .polygonsData(countries)
        .polygonCapColor(d =>
            d === hoverD
                ? 'rgba(0,150,255,0.7)'   // 🔵 highlight
                : 'rgba(255,255,255,0.05)'
        )
        .polygonSideColor(() => 'rgba(0,0,0,0)')
        .polygonStrokeColor(() => '#111')
        .polygonAltitude(0.01);
});


// 🖱 HOVER EFFECT
globe.onPolygonHover(d => {
    hoverD = d;

    globe.polygonCapColor(feat =>
        feat === hoverD
            ? 'rgba(0,150,255,0.7)'
            : 'rgba(255,255,255,0.05)'
    );
});


// 🖱 CLICK EVENT
globe.onGlobeClick(({ lat, lng }) => {

    console.log("Clicked:", lat, lng);

    // 🌍 GET COUNTRY FROM LAT/LON
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
    .then(res => res.json())
    .then(location => {

        if (!location.address || !location.address.country) {
            document.getElementById("info").innerHTML = "Country not found";
            return;
        }

        let country = location.address.country
            .toLowerCase()
            .replace(/\s/g, "");

        console.log("Country:", country);

        // 📦 FETCH RISK DATA
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
                     🌊 Flood: ${data.flood_risk}<br>
                     🌪 Hurricane: ${data.hurricane_risk}<br>
                     🌀 Cyclone: ${data.cyclone_risk}`;
            }

        });

        // 📊 FETCH HISTORY → GRAPH
        fetch(`http://127.0.0.1:5000/history/${country}`)
        .then(res => res.json())
        .then(history => {

            if (!history || history.error) return;

            let years = history.map(item => item.year);
            let counts = history.map(item => item.count);

            const canvas = document.getElementById('chart');
            if (!canvas) return;

            const ctx = canvas.getContext('2d');

            // 🔁 Destroy old chart
            if (window.myChart) {
                window.myChart.destroy();
            }

            // 📈 CREATE CHART
            window.myChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: years,
                    datasets: [{
                        label: 'Earthquakes per Year',
                        data: counts,
                        borderColor: 'red',
                        backgroundColor: 'rgba(255,0,0,0.2)',
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Year'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Count'
                            }
                        }
                    }
                }
            });

        });

    })
    .catch(err => {
        console.error(err);
        document.getElementById("info").innerHTML = "Error detecting country";
    });

});
