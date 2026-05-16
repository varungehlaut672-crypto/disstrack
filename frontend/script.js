// 🌍 CREATE GLOBE
const globe = Globe()(document.getElementById('globeViz'))
  .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
  .backgroundImageUrl('https://unpkg.com/three-globe/example/img/night-sky.png');

globe.renderer().setPixelRatio(window.devicePixelRatio);
globe.controls().enableDamping = true;
globe.controls().dampingFactor = 0.05;
globe.pointOfView({ lat: 20, lng: 0, altitude: 2 });
globe.controls().autoRotate = false;

let rotating = false;

document.getElementById("toggleRotate").onclick = () => {
  rotating = !rotating;
  globe.controls().autoRotate = rotating;
};


let rotating = false;

document.getElementById("toggleRotate").onclick = () => {
  rotating = !rotating;
  globe.controls().autoRotate = rotating;
};

// ===============================
// 🌪 ANIMATED STORMS
// ===============================
function showRiskZones(lat, lng) {

  let rings = [];

  for (let i = 0; i < 3; i++) {
    rings.push({
      lat: lat,
      lng: lng,
      maxR: 5 + i * 3,
      propagationSpeed: 2,
      repeatPeriod: 2000
    });
  }

  globe.ringsData(rings)
    .ringColor(() => t => `rgba(255,0,0,${1-t})`)
    .ringMaxRadius('maxR')
    .ringPropagationSpeed('propagationSpeed')
    .ringRepeatPeriod('repeatPeriod');
}


// ===============================
// 🌍 LOAD COUNTRIES
// ===============================
let countries = [];
let hovered = null;

fetch("https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json")
.then(res => res.json())
.then(data => {

  countries = data.features;

  globe
    .polygonsData(countries)
    .polygonCapColor(feat =>
      feat === hovered
        ? 'rgba(255,255,0,0.35)' // 🟡 only hovered
        : 'rgba(0,0,0,0)'        // transparent base
    )
    .polygonSideColor(() => 'rgba(0,0,0,0)')
    .polygonStrokeColor(() => 'rgba(255,255,255,0.2)')
    .polygonAltitude(0.01)
    .polygonsTransitionDuration(150);
});


// ===============================
// 🖱 HOVER (SMOOTH FIX)
// ===============================
globe.onPolygonHover(d => {
  if (hovered === d) return;
  hovered = d;

  globe.polygonCapColor(feat =>
    feat === hovered
      ? 'rgba(255,255,0,0.35)'
      : 'rgba(0,0,0,0)'
  );
});


// ===============================
// 🖱 CLICK COUNTRY
// ===============================
globe.onPolygonClick(d => {

  if (!d || !d.properties || !d.properties.name) return;

  let rawCountry = d.properties.name;
  let displayName = rawCountry;
  let country = rawCountry.toLowerCase().replace(/\s/g, "");

  // ===============================
  // 🌍 ZOOM TO COUNTRY
  // ===============================
  const coords = d.geometry.coordinates[0][0];

  let lat = 0, lng = 0;
  coords.forEach(c => {
    lng += c[0];
    lat += c[1];
  });

  lat /= coords.length;
  lng /= coords.length;

  globe.pointOfView({ lat, lng, altitude: 0.8 }, 1000);


  // ===============================
  // 🌪 SHOW RISK ZONES
  // ===============================
  showRiskZones(lat, lng);


  // ===============================
  // 🧭 SIDEBAR OPEN
  // ===============================
  const sidebar = document.getElementById("sidebar");

  sidebar.style.transform = "translateX(0)";
  sidebar.innerHTML = `<h2>Loading ${displayName}...</h2>`;


  // ===============================
  // 📦 FETCH RISK
  // ===============================
  fetch(`http://127.0.0.1:5000/risk/${country}`)
  .then(res => res.json())
  .then(data => {

    window.riskHTML = `
      <div class="card">
        🌋 Earthquake: ${data.earthquake_risk}<br>
        🌊 Flood: ${data.flood_risk}<br>
        🌪 Hurricane: ${data.hurricane_risk}<br>
        🌀 Cyclone: ${data.cyclone_risk}
      </div>
    `;

    showTab("risk");
  });


  // ===============================
  // 🤖 FETCH PREDICTION
  // ===============================
  fetch(`http://127.0.0.1:5000/predict/${country}`)
  .then(res => res.json())
  .then(pred => {

    window.predHTML = `
      <div class="card">
        📅 ${pred.year}<br>
        ⚡ ${pred.predicted_earthquakes} events
      </div>
    `;
  });


  // ===============================
  // 📊 FETCH HISTORY
  // ===============================
  fetch(`http://127.0.0.1:5000/history/${country}`)
  .then(res => res.json())
  .then(history => {
    window.historyData = history;
  });


  // ===============================
  // 🧭 SIDEBAR UI
  // ===============================
  sidebar.innerHTML = `
    <h2>${displayName}</h2>

    <div>
      <button onclick="showTab('risk')">Risk</button>
      <button onclick="showTab('prediction')">Prediction</button>
      <button onclick="showTab('history')">History</button>
    </div>

    <div id="tab-content"></div>
  `;
});

  // ===============================
  // 📊 GRAPH
  // ===============================
  fetch(`http://127.0.0.1:5000/history/${country}`)
  .then(res => res.json())
  .then(history => {

    if (!history || history.error) return;

    let years = history.map(h => h.year);
    let counts = history.map(h => h.count);

    const canvas = document.getElementById('chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    if (window.myChart) window.myChart.destroy();

    window.myChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: years,
        datasets: [{
          label: 'Earthquakes',
          data: counts,
          borderColor: 'red',
          backgroundColor: 'rgba(255,0,0,0.2)',
          tension: 0.3
        }]
      }
    });

  });

function showTab(tab) {

  const box = document.getElementById("tab-content");

  if (tab === "risk") {
    box.innerHTML = window.riskHTML || "Loading...";
  }

  if (tab === "prediction") {
    box.innerHTML = window.predHTML || "Loading...";
  }

  if (tab === "history") {
    box.innerHTML = `<canvas id="chart"></canvas>`;
    renderChart(window.historyData);
  }
}

function renderChart(history) {

  if (!history) return;

  let years = history.map(h => h.year);
  let counts = history.map(h => h.count);

  const ctx = document.getElementById('chart').getContext('2d');

  if (window.myChart) window.myChart.destroy();

  window.myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: years,
      datasets: [{
        label: 'Disaster Trend',
        data: counts,
        borderColor: 'cyan',
        backgroundColor: 'rgba(0,255,255,0.2)',
        tension: 0.4
      }]
    }
  });
}

function showRiskZones(lat, lng) {

  let rings = [];

  for (let i = 0; i < 3; i++) {
    rings.push({
      lat: lat,
      lng: lng,
      maxR: 5 + i * 3,
      propagationSpeed: 2,
      repeatPeriod: 2000
    });
  }

  globe.ringsData(rings)
    .ringColor(() => t => `rgba(255,0,0,${1-t})`)
    .ringMaxRadius('maxR')
    .ringPropagationSpeed('propagationSpeed')
    .ringRepeatPeriod('repeatPeriod');
}