// RPC configuration with basic failover helpers for Solana and EVM.
// In production, these lists should be expanded and possibly proxied through a gateway.

const axios = require('axios');

const solanaRPC =
  [process.env.SOLANA_RPC_1, process.env.SOLANA_RPC_2].filter(Boolean).length > 0
    ? [process.env.SOLANA_RPC_1, process.env.SOLANA_RPC_2].filter(Boolean)
    : [
        'https://api.mainnet-beta.solana.com',
        'https://solana-rpc.publicnode.com',
      ];

const evmRPC =
  [process.env.EVM_RPC_1, process.env.EVM_RPC_2].filter(Boolean).length > 0
    ? [process.env.EVM_RPC_1, process.env.EVM_RPC_2].filter(Boolean)
    : [
        'https://ethereum.publicnode.com',
        'https://rpc.ankr.com/eth',
      ];

async function checkSolanaRPC(url) {
  try {
    const { data } = await axios.post(
      url,
      { jsonrpc: '2.0', id: 1, method: 'getHealth' },
      { timeout: 800 }
    );
    return data?.result === 'ok';
  } catch (err) {
    return false;
  }
}

async function checkEvmRPC(url) {
  try {
    const { data } = await axios.post(
      url,
      { jsonrpc: '2.0', id: 1, method: 'eth_blockNumber', params: [] },
      { timeout: 800 }
    );
    return Boolean(data?.result);
  } catch (err) {
    return false;
  }
}

// Iterate configured RPC endpoints and return the first healthy responder.
async function getHealthyRPC(chain) {
  const targets = chain === 'solana' ? solanaRPC : evmRPC;
  for (const url of targets) {
    const healthy = chain === 'solana' ? await checkSolanaRPC(url) : await checkEvmRPC(url);
    if (healthy) {
      return url;
    }
  }
  return targets[0];
}

module.exports = {
  solanaRPC,
  evmRPC,
  getHealthyRPC,
};
