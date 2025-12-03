export function initPriceWidget(selector) {
    const el = document.querySelector(selector);
    if (!el) return;
    const data = [
        { label: '1H', change: '+0.8%' },
        { label: '24H', change: '+2.4%' },
        { label: '7D', change: '+4.1%' },
        { label: '30D', change: '+11.3%' }
    ];
    el.innerHTML = data
        .map((entry) => `<div class="kpi"><div class="text-muted">${entry.label}</div><strong>${entry.change}</strong></div>`) 
        .join('');
}

export function validateAddress(address) {
    const bech32 = /^bc1[ac-hj-np-z02-9]{11,71}$/;
    const base58 = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
    return bech32.test(address) || base58.test(address);
}

export function initAddressInspector(formSelector, outputSelector) {
    const form = document.querySelector(formSelector);
    const output = document.querySelector(outputSelector);
    if (!form || !output) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const address = form.querySelector('input[name="address"]').value.trim();
        const isValid = validateAddress(address);
        const risk = isValid ? 'Address format looks valid. Always verify QR codes and never reuse deposit addresses.' : 'Address format invalid. Check network and copy/paste carefully.';
        output.innerHTML = `<div class="alert ${isValid ? 'success' : 'danger'}"><strong>${isValid ? 'Valid' : 'Invalid'}:</strong> ${risk}</div>`;
    });
}

export function initTreasuryCalculator(formSelector, outputSelector) {
    const form = document.querySelector(formSelector);
    const output = document.querySelector(outputSelector);
    if (!form || !output) return;

    form.addEventListener('input', () => {
        const btc = parseFloat(form.querySelector('input[name="btc"]').value) || 0;
        const price = parseFloat(form.querySelector('input[name="price"]').value) || 0;
        const pct = parseFloat(form.querySelector('input[name="allocation"]').value) || 0;
        const usdValue = btc * price;
        const balanced = (usdValue * pct) / 100;
        output.innerHTML = `<div class="card-row"><div class="icon-circle">Ξ</div><div><strong>Portfolio BTC value:</strong> $${usdValue.toLocaleString()}<div class="text-muted">Target allocation at ${pct}% is $${balanced.toLocaleString()}</div></div></div>`;
    });
}

export function initSavingsPlan(formSelector, outputSelector) {
    const form = document.querySelector(formSelector);
    const output = document.querySelector(outputSelector);
    if (!form || !output) return;

    form.addEventListener('input', () => {
        const contribution = parseFloat(form.querySelector('input[name="contribution"]').value) || 0;
        const cadence = form.querySelector('select[name="cadence"]').value;
        const years = parseFloat(form.querySelector('input[name="years"]').value) || 1;
        const growth = parseFloat(form.querySelector('input[name="growth"]').value) || 0;

        const periods = cadence === 'weekly' ? 52 : cadence === 'monthly' ? 12 : 1;
        const totalContrib = contribution * periods * years;
        const futureValue = totalContrib * Math.pow(1 + growth / 100, years);

        output.innerHTML = `<div class="alert success"><strong>Total contributed:</strong> $${totalContrib.toLocaleString()} | <strong>Projected value:</strong> $${futureValue.toLocaleString()}</div>`;
    });
}

export function initExchangeComparison(tableSelector) {
    const table = document.querySelector(tableSelector);
    if (!table) return;
    const rows = [
        { name: 'Strike', fees: '0.1%', focus: 'Payments first', limits: '$10k/day', custody: 'Non-custodial + Custodial' },
        { name: 'River', fees: '0.2%', focus: 'US focus, mining', limits: '$25k/day', custody: 'Custodial with hardware export' },
        { name: 'Swan', fees: '0.3%', focus: 'Auto DCA', limits: '$50k/day', custody: 'Custodial with withdrawals' },
        { name: 'Bitaroo', fees: '0.2%', focus: 'AUS', limits: '$5k/day', custody: 'Custodial' }
    ];
    const head = `<tr><th>Platform</th><th>Fees</th><th>Focus</th><th>Limits</th><th>Custody</th></tr>`;
    const body = rows
        .map((row) => `<tr><td>${row.name}</td><td>${row.fees}</td><td>${row.focus}</td><td>${row.limits}</td><td>${row.custody}</td></tr>`)
        .join('');
    table.innerHTML = head + body;
}
