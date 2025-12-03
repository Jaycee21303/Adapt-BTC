export default {
    title: 'Wallets and Backups',
    questions: [
        { prompt: 'What differentiates custodial and self-custodial wallets?', options: ['Fee structure', 'Who controls the private keys', 'Color scheme', 'Confirmation speed'], answer: 1, explanation: 'Custodial wallets hold keys for you while self-custody keeps keys under user control.' },
        { prompt: 'Why use testnet before mainnet?', options: ['To earn rewards', 'To practice flows without risking funds', 'To speed confirmation', 'To avoid backups'], answer: 1, explanation: 'Testnet allows rehearsals and recovery drills safely.' },
        { prompt: 'When should you verify a backup?', options: ['Never', 'Immediately and periodically with restore tests', 'After losing device', 'During bull runs only'], answer: 1, explanation: 'Restoring ensures backups are valid and readable before real incidents.' },
        { prompt: 'What is coin control?', options: ['Mining strategy', 'Selecting specific UTXOs to spend for privacy and fee control', 'Hardware setup', 'Lightning routing'], answer: 1, explanation: 'Coin control lets you manage which outputs fund a transaction for privacy and cost.' },
        { prompt: 'Why consider Shamir or multisig backups?', options: ['To make wallets slower', 'To distribute recovery data and reduce single-point loss', 'To avoid passwords', 'To mine blocks'], answer: 1, explanation: 'Splitting secrets reduces the chance one compromise exposes all funds.' },
        { prompt: 'What should you check when installing a wallet app?', options: ['App rating only', 'Developer signatures, release notes, and reproducible builds', 'Color palette', 'Social media'], answer: 1, explanation: 'Authenticity checks reduce risk of malicious builds.' },
        { prompt: 'How do watch-only wallets help?', options: ['They spend funds automatically', 'They monitor balances without holding spending keys', 'They increase fees', 'They remove privacy'], answer: 1, explanation: 'Watch-only setups let teams view balances while keeping spend keys offline.' },
        { prompt: 'Why lock down mobile devices?', options: ['For aesthetics', 'To protect hot wallets with biometric and device encryption', 'To mine faster', 'To avoid receipts'], answer: 1, explanation: 'Device security directly impacts mobile wallet safety.' },
        { prompt: 'When is multisig overkill?', options: ['Small personal balances with simple workflows', 'Any treasury above 1 BTC', 'When using hardware', 'When using passphrases'], answer: 0, explanation: 'Risk and complexity should match holdings; small balances may not justify multisig overhead.' },
        { prompt: 'Why maintain firmware updates?', options: ['To slow devices', 'To patch vulnerabilities and improve compatibility', 'To erase data', 'To change addresses'], answer: 1, explanation: 'Updated firmware fixes bugs and strengthens hardware wallet security.' }
    ]
};
