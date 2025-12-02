/* ============================================================
   SAFE FETCH (Prevents errors from breaking the app)
   ============================================================ */
async function safeFetch(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) return null;
        return await res.json();
    } catch (err) {
        return null;
    }
}

/* ============================================================
   LIVE NETWORK STATUS
   ============================================================ */

async function updateLiveStatus() {
    const fees = await safeFetch("https://mempool.space/api/v1/fees/recommended");
    const ln = await safeFetch("https://mempool.space/api/v1/lightning/statistics");

    if (fees) {
        document.getElementById("cardMempool").innerText =
            fees.fastestFee + " sat/vB";
    }

    if (ln) {
        document.getElementById("cardCapacity").innerText =
            ln.total_capacity.toLocaleString() + " sats";
        document.getElementById("cardChannels").innerText =
            ln.channel_count.toLocaleString();
        document.getElementById("cardNodes").innerText =
            ln.node_count.toLocaleString();
    }
}

updateLiveStatus();
setInterval(updateLiveStatus, 60000);

/* ============================================================
   MEMPOOL HEATMAP
   ============================================================ */

async function updateHeatmap() {
    const stats = await safeFetch("https://mempool.space/api/v1/fees/recommended");

    const fee = stats ? stats.fastestFee : 50;
    const label = document.getElementById("congestionLabel");
    const indicator = document.getElementById("congestionIndicator");

    if (fee <= 3) {
        label.innerText = "LOW";
        indicator.style.background = "#2ecc71";
    } else if (fee <= 20) {
        label.innerText = "MEDIUM";
        indicator.style.background = "#f1c40f";
    } else if (fee <= 50) {
        label.innerText = "HIGH";
        indicator.style.background = "#e67e22";
    } else {
        label.innerText = "EXTREME";
        indicator.style.background = "#8e44ad";
    }
}

updateHeatmap();
setInterval(updateHeatmap, 60000);

/* ============================================================
   CAPACITY CHART
   ============================================================ */

async function loadCapacityChart() {
    const data = await safeFetch("https://mempool.space/api/v1/lightning/statistics");
    if (!data) return;

    new Chart(document.getElementById("capacityChart"), {
        type: "bar",
        data: {
            labels: ["Total Capacity", "Avg Capacity", "Channels", "Nodes"],
            datasets: [{
                label: "Lightning Stats",
                data: [
                    data.total_capacity,
                    data.avg_capacity,
                    data.channel_count,
                    data.node_count
                ],
                backgroundColor: "#673ab7"
            }]
        }
    });
}

loadCapacityChart();

/* ============================================================
   NODE TRUST CHART (Amboss Rankings)
   ============================================================ */

async function loadTrustChart() {
    const data = await safeFetch("https://api.amboss.space/api/v1/nodes/rankings");
    if (!data || !data.nodes) return;

    const nodes = data.nodes.slice(0, 10);

    new Chart(document.getElementById("trustChart"), {
        type: "bar",
        data: {
            labels: nodes.map(n => n.alias),
            datasets: [{
                label: "Node Uptime (%)",
                data: nodes.map(n => n.metrics?.uptime || 0),
                backgroundColor: "#3f51b5"
            }]
        },
        options: {
            indexAxis: "y"
        }
    });
}

loadTrustChart();

/* ============================================================
   ROUTING PATH SIMULATOR
   ============================================================ */

document.getElementById("drawRoute").addEventListener("click", async () => {
    const container = document.getElementById("routeCanvas");
    container.innerHTML = "";

    const data = await safeFetch("https://api.amboss.space/api/v1/nodes/rankings");
    if (!data || !data.nodes) {
        container.innerHTML = "<p>Error loading nodes.</p>";
        return;
    }

    const hops = data.nodes
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

    container.innerHTML += `
        <div class="route-node">Sender</div>
        <div>➡</div>
    `;

    hops.forEach(n => {
        const uptime = n.metrics?.uptime || 0;
        const severity =
            uptime < 80 ? "red" :
            uptime < 95 ? "yellow" :
            "";

        container.innerHTML += `
            <div class="route-node ${severity}">
                ${n.alias}<br>${uptime}% uptime
            </div>
            <div>➡</div>
        `;
    });

    container.innerHTML += `<div class="route-node">Receiver</div>`;
});

/* ============================================================
   GLOBAL LIGHTNING GEO MAP
   ============================================================ */

let map = L.map("map").setView([20, 0], 2);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
    .addTo(map);

async function loadGeoMap() {
    const data = await safeFetch("https://api.amboss.space/api/v1/nodes/rankings");
    if (!data || !data.nodes) return;

    const nodes = data.nodes.slice(0, 25);

    for (const n of nodes) {
        const ip = n.announcedAddresses?.find(a => a.includes("."));
        if (!ip) continue;

        const geo = await safeFetch("https://freeipapi.com/api/json/" + ip);
        if (!geo || !geo.latitude) continue;

        L.circleMarker([geo.latitude, geo.longitude], {
            radius: 6,
            color: "#673ab7"
        }).addTo(map).bindPopup(n.alias);
    }
}

loadGeoMap();

/* ============================================================
   CHANNEL PROFITABILITY CALCULATOR
   ============================================================ */

document.getElementById("profitCalc").addEventListener("click", () => {
    const size = Number(document.getElementById("chanSize").value);
    const base = Number(document.getElementById("baseFee").value);
    const ppm = Number(document.getElementById("feePpm").value);
    const volume = Number(document.getElementById("volume").value);

    const list = document.getElementById("profitList");
    list.innerHTML = "";

    if (!size || !base || !ppm || !volume) {
        list.innerHTML = "<li>Please fill in all fields.</li>";
        return;
    }

    const monthly = Math.round((ppm / 1_000_000) * volume + base * (volume / size));
    const yearly = monthly * 12;

    list.innerHTML = `
        <li><strong>Estimated Monthly Revenue:</strong> ${monthly.toLocaleString()} sats</li>
        <li><strong>Estimated Yearly Revenue:</strong> ${yearly.toLocaleString()} sats</li>
        <li><strong>Estimated ROI:</strong> ${(yearly / size * 100).toFixed(2)}%</li>
        <li><strong>Suggested Base Fee:</strong> ${Math.max(1, Math.round(base * 0.8))} sats</li>
        <li><strong>Suggested PPM:</strong> ${Math.max(50, Math.round(ppm * 0.9))} ppm</li>
    `;
});

/* ============================================================
   SMOOTH SCROLL SIDEBAR NAVIGATION
   ============================================================ */

document.querySelectorAll("#sidebar nav a").forEach(link => {
    link.addEventListener("click", e => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute("href"));
        window.scrollTo({
            top: target.offsetTop - 20,
            behavior: "smooth"
        });

        /* highlight active */
        document.querySelectorAll("#sidebar nav a")
            .forEach(a => a.classList.remove("active"));
        link.classList.add("active");
    });
});

/* ============================================================
   AUTO-HIGHLIGHT ACTIVE SECTION ON SCROLL
   ============================================================ */

window.addEventListener("scroll", () => {
    const sections = document.querySelectorAll("section");
    let scrollPos = document.documentElement.scrollTop || document.body.scrollTop;

    sections.forEach(section => {
        if (scrollPos >= section.offsetTop - 200) {
            document.querySelectorAll("#sidebar nav a")
                .forEach(a => a.classList.remove("active"));
            const active = document.querySelector(`#sidebar nav a[href="#${section.id}"]`);
            if (active) active.classList.add("active");
        }
    });
});
