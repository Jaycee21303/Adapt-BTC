export default {
    title: 'Bitcoin for Business',
    questions: [
        { prompt: 'Why define a treasury policy?', options: ['To slow operations', 'To codify custody tiers, signers, and thresholds', 'To change price', 'To skip audits'], answer: 1, explanation: 'Policies clarify who can move funds, how much, and under which approvals.' },
        { prompt: 'What is key for executive alignment?', options: ['Technical jargon only', 'Clear risk statements, reporting cadence, and success metrics', 'Ignoring finance', 'Avoiding training'], answer: 1, explanation: 'Leadership needs shared language and metrics for Bitcoin initiatives.' },
        { prompt: 'How should merchants handle refunds?', options: ['Send any amount', 'Mirror original currency amounts and confirm destination addresses', 'Avoid receipts', 'Use random addresses'], answer: 1, explanation: 'Refund processes must be traceable and verified to avoid mistakes.' },
        { prompt: 'Why integrate accounting early?', options: ['To delay product launch', 'To map invoices, cost basis, and settlement flows for compliance', 'To reduce monitoring', 'To increase legal risk'], answer: 1, explanation: 'Accounting alignment prevents downstream reconciliation problems.' },
        { prompt: 'What is the value of certificates for teams?', options: ['Decoration', 'Proof of competency and training completion', 'Tax reduction', 'Instant liquidity'], answer: 1, explanation: 'Certificates signal readiness and learning progress to stakeholders.' },
        { prompt: 'How do you evaluate a Lightning Service Provider?', options: ['By logo only', 'Reliability metrics, liquidity programs, support, and pricing', 'Follower counts', 'Token incentives'], answer: 1, explanation: 'Objective operational metrics matter for payments partnerships.' },
        { prompt: 'Why document incident response?', options: ['To add bureaucracy', 'To ensure teams know steps for stuck transactions or channel failures', 'To increase fees', 'To shorten addresses'], answer: 1, explanation: 'Clear playbooks reduce downtime and customer impact.' },
        { prompt: 'What is a compliance consideration for invoices?', options: ['Include emojis', 'Accurate timestamps, fx rates, and payer data when required', 'Skip records', 'Avoid signatures'], answer: 1, explanation: 'Invoices need metadata for audit and reconciliation.' },
        { prompt: 'Why segment customer and treasury wallets?', options: ['Aesthetic reasons', 'Limit blast radius and simplify audits', 'Increase confirmations', 'Speed UI'], answer: 1, explanation: 'Segmentation isolates risk and provides clean reporting per flow.' },
        { prompt: 'What KPI signals Lightning success?', options: ['Number of tweets', 'Payment success rate, latency, and liquidity utilization', 'Sticker count', 'Exchange listings'], answer: 1, explanation: 'Routing reliability and customer payment metrics reflect real performance.' }
    ]
};
