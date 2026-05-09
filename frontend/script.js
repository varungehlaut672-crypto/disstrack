const globe = Globe()
  (document.getElementById('globeViz'))
  .globeImageUrl('//unpkg.com/three-globe/example/img/earth-dark.jpg')
  .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')

// 🌊 HURRICANE / CYCLONE ZONES (OCEAN POINTS)
globe.pointsData([
  { lat: 15, lng: -60, size: 1, color: 'red' },     // Atlantic hurricanes
  { lat: 20, lng: 90, size: 1, color: 'orange' },   // Bay of Bengal cyclones
  { lat: -15, lng: 120, size: 1, color: 'yellow' }  // Indian Ocean
])
.pointAltitude(0.02)
.pointColor('color');  ;

// CLICK EVENT
globe.onGlobeClick(({ lat, lng }) => {

    console.log("Clicked:", lat, lng);

    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
    .then(res => res.json())
    .then(location => {

        let country = location.address.country;

        if (!country) return;

        country = country.toLowerCase().replace(/\s/g, "");

        fetch(`http://127.0.0.1:5000/risk/${country}`)
        .then(res => res.json())
        .then(data => {
            alert(`Country: ${data.country}
Earthquake: ${data.earthquake_risk}
Flood: ${data.flood_risk}`);

// 📊 FETCH HISTORY DATA
fetch(`http://127.0.0.1:5000/history/${country}`)
.then(res => res.json())
.then(history => {

    let years = history.map(item => item.year);
    let counts = history.map(item => item.count);

    // Destroy old chart (IMPORTANT)
    if (window.myChart) {
        window.myChart.destroy();
    }

    const ctx = document.getElementById('chart').getContext('2d');

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
                        text: 'Earthquake Count'
                    }
                }
            }
        }
    });

});
        });

    });

});

