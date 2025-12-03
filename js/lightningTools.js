export function initChannelPlanner(formSelector, outputSelector) {
    const form = document.querySelector(formSelector);
    const output = document.querySelector(outputSelector);
    if (!form || !output) return;

    form.addEventListener('input', () => {
        const inbound = parseFloat(form.querySelector('input[name="inbound"]').value) || 0;
        const outbound = parseFloat(form.querySelector('input[name="outbound"]').value) || 0;
        const feeRate = parseFloat(form.querySelector('input[name="feerate"]').value) || 0;
        const capacity = inbound + outbound;
        const targetFee = ((capacity * 100000000) / 1000000) * (feeRate / 1_000_000);
        output.innerHTML = `<div class="alert success">Capacity: ${capacity.toFixed(3)} BTC | Estimated open fee at ${feeRate} ppm: ${targetFee.toFixed(2)} sats</div>`;
    });
}

export function initRoutingHealth(tableSelector) {
    const table = document.querySelector(tableSelector);
    if (!table) return;
    const peers = [
        { name: 'Breez', uptime: '99.2%', liquidity: 'High', policy: 'Low fees, stable' },
        { name: 'ACINQ', uptime: '99.5%', liquidity: 'High', policy: 'Balanced' },
        { name: 'Voltage', uptime: '98.4%', liquidity: 'Medium', policy: 'Agile fees' },
        { name: 'Zeus', uptime: '97.8%', liquidity: 'Medium', policy: 'Mobile-first' }
    ];
    const head = `<tr><th>Peer</th><th>Uptime</th><th>Liquidity</th><th>Policy notes</th></tr>`;
    const body = peers.map((p) => `<tr><td>${p.name}</td><td>${p.uptime}</td><td>${p.liquidity}</td><td>${p.policy}</td></tr>`).join('');
    table.innerHTML = head + body;
}

export function initLightningWalletGuide(listSelector) {
    const list = document.querySelector(listSelector);
    if (!list) return;
    const wallets = [
        'Phoenix — self-custodial, great UX',
        'Breez — POS ready, podcasting value',
        'Zeus — control your node remotely',
        'Mutiny — web-first, privacy forward',
        'Alby — browser-first lightning identity'
    ];
    list.innerHTML = wallets.map((w) => `<li>${w}</li>`).join('');
}
