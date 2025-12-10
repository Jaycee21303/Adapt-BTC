import { showAlert } from '../components/alerts.js';

async function initWalletGenerator() {
  const generateBtn = document.getElementById('generate-wallet');
  if (!generateBtn) return;
  const addressEl = document.querySelector('[data-address]');
  const wifEl = document.querySelector('[data-wif]');
  const seedEl = document.querySelector('[data-seed]');
  const canvas = document.getElementById('wallet-qr');

  generateBtn.addEventListener('click', async () => {
    try {
      const useTestnet = document.getElementById('use-testnet').checked;
      const { generateWallet } = await import('../../utils/wallet.js');
      const wallet = await generateWallet(useTestnet);
      addressEl.textContent = wallet.address;
      wifEl.textContent = wallet.wif;
      seedEl.textContent = wallet.seedPhrase;
      if (canvas && window.QRious) {
        new window.QRious({ element: canvas, value: wallet.address, size: 180 });
      }
    } catch (error) {
      console.error(error);
      showAlert('Unable to generate wallet in this environment', 'error');
    }
  });
}

document.addEventListener('DOMContentLoaded', initWalletGenerator);
