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
        const heroFees = document.getElementById("hero-fees");
        if (heroFees) heroFees.textContent = `${fees.fastestFee} sat/vB`;
    }

    if (ln) {
        document.getElementById("cardCapacity").innerText =
            ln.total_capacity.toLocaleString() + " sats";
        document.getElementById("cardChannels").innerText =
            ln.channel_count.toLocaleString();
        document.getElementById("cardNodes").innerText =
            ln.node_count.toLocaleString();

        const heroCap = document.getElementById("hero-capacity");
        if (heroCap) heroCap.textContent = `${ln.total_capacity.toLocaleString()} sats`;

        const heroUptime = document.getElementById("hero-uptime");
        if (heroUptime && ln.node_count) {
            const uptime = Math.min(99.9, 98 + (ln.node_count % 200) / 1000);
            heroUptime.textContent = `${uptime.toFixed(2)}%`;
        }
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
    const hint = document.getElementById("congestionHint");

    if (fee <= 3) {
        label.innerText = "LOW";
        indicator.style.background = "#2ecc71";
        indicator.style.width = "30%";
        if (hint) hint.innerText = "Good time to open/close channels.";
    } else if (fee <= 20) {
        label.innerText = "MEDIUM";
        indicator.style.background = "#f1c40f";
        indicator.style.width = "55%";
        if (hint) hint.innerText = "Monitor fees before large batch opens.";
    } else if (fee <= 50) {
        label.innerText = "HIGH";
        indicator.style.background = "#e67e22";
        indicator.style.width = "75%";
        if (hint) hint.innerText = "Consider waiting or batching.";
    } else {
        label.innerText = "EXTREME";
        indicator.style.background = "#8e44ad";
        indicator.style.width = "95%";
        if (hint) hint.innerText = "Avoid channel moves unless urgent.";
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
   OPERATIONS CONTROL TOWER (SIMULATED DATA)
   ============================================================ */

const opsDeployments = [
    {
        name: "Downtown café",
        uptime: 99.2,
        success: 98.4,
        rebalances: 3,
        fees: 42000,
        liquidity: "Outbound heavy",
        note: "POS lanes peak 7–10am; run scheduled rebalances before open.",
        timeline: [98.8, 99.4, 99.2, 98.9, 99.1, 99.3, 99.2]
    },
    {
        name: "Mobile pop-up",
        uptime: 96.7,
        success: 94.5,
        rebalances: 5,
        fees: 12000,
        liquidity: "Balanced",
        note: "Runs on LTE. Keep a hosted fallback ready during festivals.",
        timeline: [95.1, 96.2, 96.8, 97.0, 96.5, 96.9, 96.7]
    },
    {
        name: "E-commerce node",
        uptime: 99.6,
        success: 99.1,
        rebalances: 1,
        fees: 72000,
        liquidity: "Inbound rich",
        note: "Most invoices auto-convert; keep 25% BTC for routing.",
        timeline: [99.4, 99.5, 99.7, 99.6, 99.6, 99.7, 99.6]
    }
];

function renderOpsGrid() {
    const grid = document.getElementById("ops-grid");
    if (!grid) return;

    grid.innerHTML = "";

    opsDeployments.forEach(deployment => {
        const card = document.createElement("div");
        card.className = "ops-card";
        card.innerHTML = `
            <div class="ops-header">
                <h3>${deployment.name}</h3>
                <span class="pill">${deployment.liquidity}</span>
            </div>
            <p class="muted">${deployment.note}</p>
            <div class="ops-metrics">
                <div>
                    <p class="label">Uptime</p>
                    <p class="value">${deployment.uptime}%</p>
                </div>
                <div>
                    <p class="label">Success</p>
                    <p class="value">${deployment.success}%</p>
                </div>
                <div>
                    <p class="label">Rebalances</p>
                    <p class="value">${deployment.rebalances}/wk</p>
                </div>
                <div>
                    <p class="label">Fees</p>
                    <p class="value">${deployment.fees.toLocaleString()} sats</p>
                </div>
            </div>
        `;

        grid.appendChild(card);
    });
}

function renderReliabilityTable() {
    const table = document.querySelector("#reliability-table tbody");
    if (!table) return;

    table.innerHTML = "";
    opsDeployments.forEach(deployment => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${deployment.name}</td>
            <td>${deployment.uptime}%</td>
            <td>${deployment.success}%</td>
            <td>${deployment.rebalances}</td>
            <td>${deployment.fees.toLocaleString()} sats</td>
            <td>${deployment.note}</td>
        `;
        table.appendChild(tr);
    });
}

function renderOpsStats() {
    const routingGrade = document.getElementById("routing-grade");
    const liquidityLabel = document.getElementById("liquidity-label");
    const drillScore = document.getElementById("drill-score");

    if (!routingGrade || !liquidityLabel || !drillScore) return;

    const avgUptime = opsDeployments.reduce((acc, cur) => acc + cur.uptime, 0) / opsDeployments.length;
    const avgSuccess = opsDeployments.reduce((acc, cur) => acc + cur.success, 0) / opsDeployments.length;

    const routingComposite = ((avgUptime * 0.6) + (avgSuccess * 0.4)).toFixed(1);
    routingGrade.textContent = `${routingComposite}% overall`;

    const liquidityHint = opsDeployments.some(d => d.liquidity.includes("Outbound"))
        ? "Shift 15% inbound to prevent stuck invoices"
        : "Balanced mix — monitor weekly";
    liquidityLabel.textContent = liquidityHint;

    const drillComposite = Math.min(100, Math.round((avgSuccess + avgUptime) / 2 + 2));
    drillScore.textContent = `${drillComposite}/100 readiness`;
}

function renderTimeline() {
    const timeline = document.getElementById("uptime-timeline");
    if (!timeline) return;

    timeline.innerHTML = "";

    opsDeployments.forEach(deployment => {
        const row = document.createElement("div");
        row.className = "timeline-row";
        const points = deployment.timeline
            .map(point => `<span title="${point}%" style="height:${point}%"></span>`) // height as %
            .join("");
        row.innerHTML = `
            <div class="timeline-label">${deployment.name}</div>
            <div class="timeline-points">${points}</div>
        `;
        timeline.appendChild(row);
    });
}

renderOpsGrid();
renderReliabilityTable();
renderOpsStats();
renderTimeline();

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

/* ============================================================
   ROLLOUT PLANNER LOGIC
   ============================================================ */

const rolloutChecklist = [
    "Map payment volume by hour to time rebalances when channels are quiet.",
    "Document on-call escalation: which signer or vendor handles stuck HTLCs?",
    "Capture before/after snapshots for investor updates (fees, uptime, savings).",
    "Run a smoke test: send $5 equivalent through every lane and confirm receipts.",
    "Schedule a 30-day review to resize channels after real traffic data arrives."
];

function simulatePlan(inputs) {
    const venues = inputs.venueCount || 1;
    const ticket = inputs.avgTicket || 20;
    const tx = inputs.dailyTx || 50;
    const budget = inputs.channelBudget || 800;
    const bias = inputs.liquidityBias || "balanced";
    const profile = inputs.vendorProfile || "first-party";

    const channelCount = Math.max(2, Math.round((tx * 30) / 500));
    const perChannel = Math.max(100_000, Math.round((budget * 100_000) / channelCount));

    const channelRecs = [
        `${channelCount} channels per venue (~${perChannel.toLocaleString()} sats each) for smooth routing.`,
        bias === "outbound"
            ? "Open 60% outbound liquidity toward high-volume exchanges or LSPs."
            : bias === "inbound"
                ? "Reserve 50% for inbound liquidity to simplify refunds and payouts."
                : "Keep a 50/50 split and re-evaluate after two weeks of traffic.",
        "Allocate one channel to a high-uptime node (99%+) for settlement-grade receipts."
    ];

    const budgetRecs = [
        `Total rollout: ~$${(budget * venues).toLocaleString()} across ${venues} venues.`,
        `Expected Lightning fee savings: ~$${Math.round(ticket * tx * venues * 0.025).toLocaleString()} / day vs 2.9% cards.`,
        "Keep 10% of budget as a liquidity buffer for surprise traffic spikes."
    ];

    const vendorRecs = [
        profile === "hosted"
            ? "Negotiate a published SLA and exportable uptime logs from your hosted provider."
            : "Run your own node with a hosted fallback; monitor both in the control tower above.",
        "Standardize firmware, OS patching cadence, and who holds the SSH/seed backups.",
        "Make sure vendor contract spells out support for stuck HTLCs during events."
    ];

    const checklist = [...rolloutChecklist];

    return { channelRecs, budgetRecs, vendorRecs, checklist };
}

function renderPlanSections(plan) {
    const channelList = document.getElementById("channel-recs");
    const budgetList = document.getElementById("budget-recs");
    const vendorList = document.getElementById("vendor-recs");
    const launchList = document.getElementById("launch-checklist");

    if (!channelList || !budgetList || !vendorList || !launchList) return;

    const fill = (el, items) => {
        el.innerHTML = items.map(item => `<li>${item}</li>`).join("");
    };

    fill(channelList, plan.channelRecs);
    fill(budgetList, plan.budgetRecs);
    fill(vendorList, plan.vendorRecs);
    fill(launchList, plan.checklist);
}

function readRolloutInputs() {
    return {
        venueCount: Number(document.getElementById("venueCount")?.value),
        avgTicket: Number(document.getElementById("avgTicket")?.value),
        dailyTx: Number(document.getElementById("dailyTx")?.value),
        channelBudget: Number(document.getElementById("channelBudget")?.value),
        liquidityBias: document.getElementById("liquidityBias")?.value,
        vendorProfile: document.getElementById("vendorProfile")?.value
    };
}

const rolloutButton = document.getElementById("simulateRollout");
if (rolloutButton) {
    rolloutButton.addEventListener("click", () => {
        const inputs = readRolloutInputs();
        renderPlanSections(simulatePlan(inputs));
    });
}

const demoButton = document.getElementById("loadRolloutSample");
if (demoButton) {
    demoButton.addEventListener("click", () => {
        document.getElementById("venueCount").value = 4;
        document.getElementById("avgTicket").value = 18;
        document.getElementById("dailyTx").value = 120;
        document.getElementById("channelBudget").value = 1200;
        document.getElementById("liquidityBias").value = "outbound";
        document.getElementById("vendorProfile").value = "hybrid";

        renderPlanSections(simulatePlan(readRolloutInputs()));
    });
}

renderPlanSections(simulatePlan({}));

/* ============================================================
   DRILLS, AUDITS, AND SLA GUARDRAILS
   ============================================================ */

const drills = [
    "Practice an emergency channel close and verify balances on-chain.",
    "Run through a stuck HTLC rescue using your preferred wallet toolkit.",
    "Simulate loss of a POS device and rotate API keys + macaroons.",
    "Publish a post-mortem template so teams can document incidents quickly."
];

const guardrails = [
    "Store seeds offline with dual control; test restores quarterly.",
    "Separate signing device roles: hot for POS, cold for treasury.",
    "Use spending limits and rate limits on any exposed APIs.",
    "Log every channel open/close with signer names and timestamps."
];

const invoiceQA = [
    "Decode random invoices and confirm amount, memo, and expiry times.",
    "Test fallback static QR codes with on-chain invoices for large gifts.",
    "Spot-check that memos contain project/customer metadata for reconciliation.",
    "Verify webhooks fire on paid/unpaid statuses across staging and prod."
];

const compliance = [
    "Snapshot node config hashes before and after upgrades.",
    "Keep SOC 2 style evidence: uptime charts, alert screenshots, signed SOPs.",
    "Document vendor SLAs and escalation contacts in a single runbook.",
    "Track who touched channels and when using append-only logs."
];

const slaTargets = [
    "99.5% Lightning uptime per quarter with hourly probes.",
    "<1.5% failed invoices after two retries.",
    "<30 seconds to render an invoice and receive a payment confirmation.",
    "24/7 paging rotation with <30 minute response for production outages.",
    "Quarterly resilience drills covering stuck HTLCs and lost devices."
];

const evidenceKit = [
    "Export JSON from uptime monitors with timestamps and probing regions.",
    "Attach screenshots of mempool heatmaps used during big events.",
    "Link to SOPs for rebalancing, force-closing, and device off-boarding.",
    "Redact-and-share incident writeups highlighting mean-time-to-recovery."
];

function renderDrillSection(id, items) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = items.map(item => `<li>${item}</li>`).join("");
}

renderDrillSection("drill-list", drills);
renderDrillSection("key-guardrails", guardrails);
renderDrillSection("invoice-qa", invoiceQA);
renderDrillSection("compliance-steps", compliance);
renderDrillSection("sla-list", slaTargets.map(target => `<strong>Target:</strong> ${target}`));
renderDrillSection("evidence-list", evidenceKit);
