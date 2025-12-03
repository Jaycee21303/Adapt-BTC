const sampleNodes = [
    { alias: 'AdaptBTC', pubkey: '023adaptnode...', capacity: 12.4, channels: 32, city: 'London' },
    { alias: 'Voltage', pubkey: '032voltage...', capacity: 55.1, channels: 210, city: 'US East' },
    { alias: 'Breez', pubkey: '029breez...', capacity: 30.3, channels: 130, city: 'Tel Aviv' },
    { alias: 'ACINQ', pubkey: '03acinq...', capacity: 130.8, channels: 500, city: 'Paris' },
    { alias: 'Zeus', pubkey: '02zeus...', capacity: 8.9, channels: 54, city: 'Remote' }
];

export function initNodeExplorer(formSelector, tableSelector) {
    const form = document.querySelector(formSelector);
    const table = document.querySelector(tableSelector);
    if (!form || !table) return;

    const render = (rows) => {
        const head = `<tr><th>Alias</th><th>Pubkey</th><th>Capacity (BTC)</th><th>Channels</th><th>Region</th></tr>`;
        const body = rows
            .map((n) => `<tr><td>${n.alias}</td><td>${n.pubkey}</td><td>${n.capacity}</td><td>${n.channels}</td><td>${n.city}</td></tr>`)
            .join('');
        table.innerHTML = head + body;
    };

    render(sampleNodes);

    form.addEventListener('input', () => {
        const query = form.querySelector('input[name="query"]').value.toLowerCase();
        const filtered = sampleNodes.filter((n) =>
            n.alias.toLowerCase().includes(query) || n.pubkey.toLowerCase().includes(query) || n.city.toLowerCase().includes(query)
        );
        render(filtered);
    });
}
