import { bindModalTriggers } from '../utils/modal.js';
import { copyTextFromElement } from '../utils/copy.js';

const generateBtn = document.getElementById('generate-wallet');
const confirmBtn = document.getElementById('modal-generate');
const seedEl = document.getElementById('seed-phrase');
const privKeyEl = document.getElementById('privkey');
const addressEl = document.getElementById('btc-address');
const networkEl = document.getElementById('network');
const qrCanvas = document.getElementById('wallet-qr');

const statusEl = document.getElementById('wallet-status');

async function loadLibraries() {
  const ecc = await import('https://cdn.jsdelivr.net/npm/tiny-secp256k1@2.2.1/+esm');
  const bitcoin = await import('https://cdn.jsdelivr.net/npm/bitcoinjs-lib@6.1.6/+esm');
  bitcoin.initEccLib(ecc);
  const { BIP32Factory } = await import('https://cdn.jsdelivr.net/npm/bip32@5.0.0/+esm');
  const bip32 = BIP32Factory(ecc);
  const bip39 = await import('https://cdn.jsdelivr.net/npm/bip39@3.0.4/+esm');
  return { bitcoin, bip32, bip39 };
}

async function generateWallet() {
  try {
    statusEl?.textContent = 'Generating secure wallet...';
    const { bitcoin, bip32, bip39 } = await loadLibraries();
    const mnemonic = bip39.generateMnemonic(128);
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const root = bip32.fromSeed(seed);
    const child = root.derivePath("m/84'/0'/0'/0/0");
    const { address } = bitcoin.payments.p2wpkh({ pubkey: child.publicKey, network: bitcoin.networks.bitcoin });
    const privWif = child.toWIF();

    if (seedEl) seedEl.textContent = mnemonic;
    if (privKeyEl) privKeyEl.textContent = privWif;
    if (addressEl) addressEl.textContent = address;
    if (networkEl) networkEl.textContent = 'Bitcoin Mainnet';
    if (statusEl) statusEl.textContent = 'Wallet generated locally. Store securely.';

    if (qrCanvas && window.QRious) {
      new QRious({ element: qrCanvas, value: address, size: 180 });
    }
  } catch (error) {
    console.error('Wallet generation failed', error);
    if (statusEl) statusEl.textContent = 'Error generating wallet. Please retry.';
  }
}

function bindCopyButtons() {
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const target = btn.getAttribute('data-copy');
      const success = await copyTextFromElement(target);
      if (success) {
        btn.textContent = 'Copied!';
        setTimeout(() => (btn.textContent = 'Copy'), 1200);
      }
    });
  });
}

if (generateBtn) {
  const { openModal } = bindModalTriggers();
  bindCopyButtons();
  generateBtn.addEventListener('click', () => openModal('seed-warning'));
  confirmBtn?.addEventListener('click', generateWallet);
}
