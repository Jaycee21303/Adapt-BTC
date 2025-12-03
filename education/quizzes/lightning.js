export default {
    title: 'Lightning Operations',
    questions: [
        { prompt: 'What funds a Lightning channel?', options: ['On-chain transaction that locks funds in a 2-of-2 output', 'A database entry', 'A smart contract on Ethereum', 'An email request'], answer: 0, explanation: 'Channels are funded by on-chain transactions creating a 2-of-2 multisig output.' },
        { prompt: 'Why manage inbound and outbound liquidity?', options: ['To earn mining rewards', 'To ensure you can both send and receive payments', 'To avoid taxes', 'To speed on-chain confirmations'], answer: 1, explanation: 'Balanced liquidity ensures routing capacity in both directions.' },
        { prompt: 'What is an HTLC?', options: ['Hardware trust logic control', 'Hashed timelock contract enforcing payment conditions', 'High throughput ledger chain', 'Hosted transaction ledger channel'], answer: 1, explanation: 'HTLCs ensure conditional payments with hash preimages and timeouts.' },
        { prompt: 'How do you increase inbound liquidity?', options: ['Close channels', 'Have peers open channels to you or use swaps', 'Ignore fees', 'Run more nodes'], answer: 1, explanation: 'Inbound liquidity comes from remote capacity or swap services that push funds to you.' },
        { prompt: 'Why monitor channel health?', options: ['Entertainment', 'To spot force-closure risk, stuck HTLCs, and fee policy issues', 'To change fiat price', 'To avoid backups'], answer: 1, explanation: 'Monitoring keeps channels reliable and prevents unexpected closures or failed payments.' },
        { prompt: 'What is a routing fee policy?', options: ['A tax form', 'Base fee and ppm rate you charge for forwarding payments', 'A hardware requirement', 'A backup plan'], answer: 1, explanation: 'Routing policies set how your node charges for forwarding traffic.' },
        { prompt: 'Why use watchtowers?', options: ['To grow hashrate', 'To outsource breach monitoring when you are offline', 'To avoid backups', 'To increase price'], answer: 1, explanation: 'Watchtowers protect against dishonest closes while your node is offline.' },
        { prompt: 'What is a submarine swap?', options: ['A maritime tool', 'A trust-minimized way to exchange on-chain and Lightning liquidity', 'An exchange API', 'A hardware wallet'], answer: 1, explanation: 'Swaps move funds between layers without handing over custody.' },
        { prompt: 'How do channel backups help?', options: ['They replace seeds', 'They allow channel state recovery after device loss', 'They increase block reward', 'They reduce fees'], answer: 1, explanation: 'Channel backups help recover or settle channels after failures.' },
        { prompt: 'Why coordinate with LSPs?', options: ['They give free BTC', 'They provide liquidity services and improved routing for your users', 'They prevent taxes', 'They mine blocks'], answer: 1, explanation: 'LSPs help manage liquidity and reliability for consumer-grade Lightning apps.' }
    ]
};
