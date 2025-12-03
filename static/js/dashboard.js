async function fetchEngineData() {
    const res = await fetch('/api/engine/summary');
    if (!res.ok) throw new Error('Unable to load engine data');
    return res.json();
}

function renderReadiness(data) {
    const list = document.getElementById('readiness-list');
    list.innerHTML = '';
    data.checks.forEach((check) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="flex justify-between items-start gap-3">
                <span class="title">${check.title}</span>
                <span class="badge ${check.status}">${check.status}</span>
            </div>
            <p class="text-gray-700">${check.details}</p>
        `;
        list.appendChild(li);
    });

    const badge = document.getElementById('readiness-status');
    badge.textContent = data.next_steps.length ? 'Active' : 'Idle';
}

function renderFinance(finance) {
    const runway = document.getElementById('finance-runway');
    runway.textContent = `${finance.projected_runway_months} mo runway`;

    const details = document.getElementById('finance-details');
    details.innerHTML = '';
    const metrics = [
        { label: 'Holdings', value: `${finance.holdings_btc} BTC` },
        { label: 'Avg. cost basis', value: `$${finance.avg_cost_basis_usd.toLocaleString()}` },
        { label: 'Spot price', value: `$${finance.current_price_usd.toLocaleString()}` },
    ];

    metrics.forEach((metric) => {
        const row = document.createElement('div');
        row.className = 'metric';
        row.innerHTML = `<span class="label">${metric.label}</span><span class="value">${metric.value}</span>`;
        details.appendChild(row);
    });
}

function renderLightning(lightning) {
    document.getElementById('lightning-updated').textContent = `Updated ${new Date(lightning.updated).toLocaleTimeString()}`;
    const list = document.getElementById('lightning-list');
    list.innerHTML = '';
    lightning.peers.forEach((peer) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="flex justify-between items-center">
                <span class="title">${peer.name}</span>
                <span class="badge ok">${peer.status}</span>
            </div>
            <p class="text-gray-700">Score ${peer.score} · Capacity ${peer.capacity_btc} BTC</p>
        `;
        list.appendChild(li);
    });

    const actions = document.getElementById('lightning-actions');
    actions.innerHTML = '';
    lightning.recommended_actions.forEach((action) => {
        const p = document.createElement('p');
        p.textContent = action;
        p.className = 'text-gray-700';
        actions.appendChild(p);
    });
}

function renderBorrow(borrow) {
    const list = document.getElementById('borrow-list');
    list.innerHTML = '';
    borrow.lenders.forEach((lender) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="flex justify-between items-center">
                <span class="title">${lender.name}</span>
                <span class="badge">${(lender.rate).toFixed(1)}% APR</span>
            </div>
            <p class="text-gray-700">LTV ${(lender.ltv * 100).toFixed(0)}% · ${lender.notes}</p>
        `;
        list.appendChild(li);
    });

    document.getElementById('borrow-recommendation').textContent = borrow.recommendation;
}

function renderRoadmap(roadmap) {
    const container = document.getElementById('roadmap-list');
    container.innerHTML = '';

    roadmap.phases.forEach((phase) => {
        const div = document.createElement('div');
        div.className = `roadmap-phase ${phase.complete ? 'complete' : ''}`;
        const items = phase.milestones.map((m) => `<li>${m}</li>`).join('');
        div.innerHTML = `
            <div class="flex justify-between items-center">
                <h3>${phase.name}</h3>
                <span class="badge ${phase.complete ? 'ok' : 'attention'}">${phase.complete ? 'Done' : 'Planned'}</span>
            </div>
            <p class="text-gray-700">Target ${phase.target}</p>
            <ul class="milestones">${items}</ul>
        `;
        container.appendChild(div);
    });
}

async function hydrate() {
    try {
        const data = await fetchEngineData();
        renderReadiness(data.readiness);
        renderFinance(data.finance);
        renderLightning(data.lightning);
        renderBorrow(data.borrow);
        renderRoadmap(data.roadmap);
    } catch (err) {
        console.error(err);
        document.getElementById('summary-cards').insertAdjacentHTML(
            'beforeend',
            '<p class="text-red-600">Unable to load engine data right now.</p>'
        );
    }
}

document.addEventListener('DOMContentLoaded', hydrate);
