export default {
    title: 'Bitcoin Security',
    questions: [
        { prompt: 'Why use hardware wallets for cold storage?', options: ['They increase fees', 'They isolate keys from internet-connected devices', 'They speed confirmations', 'They enable leverage'], answer: 1, explanation: 'Hardware wallets keep private keys in secure elements away from malware.' },
        { prompt: 'What is the purpose of a passphrase (25th word)?', options: ['To shorten recovery', 'To add an extra factor to seed backups', 'To lower fees', 'To change addresses'], answer: 1, explanation: 'A passphrase adds entropy and splits backups for higher assurance.' },
        { prompt: 'How often should you test backups?', options: ['Never', 'Once after purchase', 'On a scheduled cadence such as quarterly', 'Only after loss'], answer: 2, explanation: 'Regular recovery drills validate that backups and procedures work.' },
        { prompt: 'Why segregate hot, warm, and cold wallets?', options: ['To make UI complex', 'To align risk with operational needs', 'To reduce tax liability', 'To mine blocks'], answer: 1, explanation: 'Different wallets carry different exposure; segmentation limits blast radius.' },
        { prompt: 'What is the safest way to verify a receive address?', options: ['Copy from email', 'Scan and verify on a trusted hardware screen or out-of-band channel', 'Trust the browser', 'Guess from memory'], answer: 1, explanation: 'Use device displays or out-of-band verification to avoid clipboard or malware swaps.' },
        { prompt: 'Why use multisig for treasury?', options: ['It speeds transactions', 'It distributes control across signers and reduces single-point compromise', 'It lowers fees', 'It avoids backups'], answer: 1, explanation: 'Multisig adds policy and geographic separation for critical funds.' },
        { prompt: 'What should you monitor on nodes?', options: ['Price only', 'Disk, mempool size, peer count, channel balances', 'Social media', 'Exchange ads'], answer: 1, explanation: 'Operational metrics highlight risk before downtime or stuck channels.' },
        { prompt: 'Why avoid sharing xpubs publicly?', options: ['They break the wallet', 'They reveal address history and incoming funds', 'They reduce fees', 'They speed syncing'], answer: 1, explanation: 'Xpubs leak all derived addresses, harming privacy.' },
        { prompt: 'How do you prevent phishing?', options: ['Bookmark trusted URLs, use hardware keys, and verify certificates', 'Trust all emails', 'Disable 2FA', 'Share seed phrases'], answer: 0, explanation: 'Phishing defense relies on strong authentication and domain hygiene.' },
        { prompt: 'Why rotate API keys?', options: ['To slow systems', 'To limit exposure windows and remove stale credentials', 'To increase revenue', 'To mine blocks'], answer: 1, explanation: 'Key rotation and least privilege reduce the impact of leaks.' }
    ]
};
